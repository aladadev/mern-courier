const { StatusCodes } = require('http-status-codes')
const { successResponse } = require('../utils/response')
const passport = require('passport')
const authenticate = require('../utils/authenticate')
const { cookieNames } = require('../utils/constant')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')

// models
const UserModel = require('../models/user.model')

const UserServices = require('../services/user.services')

const register = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body
  console.log(req.body)
  UserModel.register(
    {
      firstName,
      lastName,
      email,
    },
    password,
    (err, user) => {
      if (err) {
        switch (err.name) {
          case 'UserExistsError':
            return next({
              message: 'A user with the given email is already registered',
              code: StatusCodes.CONFLICT,
              status: 'UserExistsError',
            })
          default:
            return next({
              message: err.message,
              code: StatusCodes.INTERNAL_SERVER_ERROR,
              status: 'INTERNAL_SERVER_ERROR',
            })
        }
      }

      successResponse(res, 'Registered successfully', null, StatusCodes.CREATED)
    }
  )
}

const login = async (req, res, next) => {
  passport.authenticate('local', { session: true }, (err, user, info) => {
    if (err) {
      return next({
        message: err.message,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        status: 'INTERNAL_SERVER_ERROR',
      })
    } else if (!user && info) {
      switch (info.name) {
        case 'TooManyAttemptsError':
          return next({
            message: info.message,
            code: StatusCodes.UNAUTHORIZED,
            status: 'TooManyAttemptsError',
          })
        case 'AttemptTooSoonError':
          return next({
            message: info.message,
            code: StatusCodes.UNAUTHORIZED,
            status: 'AttemptTooSoonError',
          })
        case 'IncorrectUsernameError':
          return next({
            message: info.message,
            code: StatusCodes.UNAUTHORIZED,
            status: 'IncorrectUsernameError',
          })
        default:
          return next({
            message: info.message,
            code: StatusCodes.UNAUTHORIZED,
            status: 'UNAUTHORIZED',
          })
      }
    }

    req.logIn(user, async err => {
      if (err) {
        next({
          message: err.message,
          code: StatusCodes.UNAUTHORIZED,
          status: 'UNAUTHORIZED',
        })
      } else {
        try {
          const accessToken = authenticate.generateToken({
            _id: user._id,
          })
          const refreshToken = authenticate.generateRefreshToken({
            _id: user._id,
          })

          // Attach the access token from the session to the user object
          req.session.passport.user.accessToken = accessToken.token
          req.session.passport.user.expiresAt = accessToken.expiresAt
          await UserServices.pushRefreshToken(user._id, refreshToken)

          res.cookie(cookieNames.refreshToken, refreshToken.token, {
            httpOnly: true,
            domain: config.cookie.domain,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
          })

          const userI = await UserServices.getUserById(user._id)

          const data = {
            user: userI,
            accessToken: accessToken.token,
          }

          successResponse(
            res,
            'User logged in successfully',
            data,
            StatusCodes.OK
          )
        } catch (err) {
          next(err)
        }
      }
    })
  })(req, res, next)
}

const logout = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next({
      message: 'User is not logged in',
      code: StatusCodes.UNAUTHORIZED,
      status: 'UNAUTHORIZED',
    })
  }

  const token = req.cookies?.[cookieNames.refreshToken]

  if (token) {
    try {
      const decoded = jwt.verify(token, config.secrets.jwtRefresh)
      await UserServices.removeRefreshToken(decoded._id, token)
    } catch (err) {}
  }

  req.logout(err => {
    if (err) {
      next({
        message: err.message,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        status: 'INTERNAL_SERVER_ERROR',
      })
    } else {
      req.session.destroy(err => {
        if (err) {
          next({
            message: err.message,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            status: 'INTERNAL_SERVER_ERROR',
          })
        } else {
          res.clearCookie(cookieNames.session)
          res.clearCookie(cookieNames.refreshToken)

          successResponse(
            res,
            'User logged out successfully',
            null,
            StatusCodes.OK
          )
        }
      })
    }
  })
}

const getUser = async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      let { user, accessToken, expiresAt } = req.user

      let now = Date.now()
      if (!expiresAt || now > expiresAt) {
        const newAccessToken = authenticate.generateToken({
          _id: user._id,
        })

        req.session.passport.user.accessToken = newAccessToken.token
        req.session.passport.user.expiresAt = newAccessToken.expiresAt
        req.session.modified = true

        await new Promise((resolve, reject) => {
          req.session.save(err => {
            if (err) return reject(err)

            resolve()
          })
        })

        accessToken = newAccessToken.token
      }

      successResponse(
        res,
        'Fetched user from session',
        { user, accessToken },
        StatusCodes.OK
      )
    } else {
      next({
        message: 'User session expired or invalid',
        code: StatusCodes.UNAUTHORIZED,
        status: 'UNAUTHORIZED',
      })
    }
  } catch (err) {
    next({
      message: err.message,
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      status: 'INTERNAL_SERVER_ERROR',
    })
  }
}

const refreshAccessToken = async (req, res, next) => {
  const token = req.cookies?.[cookieNames.refreshToken]

  if (!token) {
    return next({
      message: 'Missing token',
      code: StatusCodes.UNAUTHORIZED,
      status: 'UNAUTHORIZED',
    })
  }

  try {
    const decoded = jwt.verify(token, config.secrets.jwtRefresh)
    const user = await UserServices.getUserById(decoded._id)

    const storedToken = user.refreshTokens.find(
      rt => rt.jti === decoded.jti && rt.token === token
    )

    if (!storedToken) {
      await UserServices.invalidateRefreshToken(user._id)
      return next({
        message: 'Refresh token reuse detected',
        code: StatusCodes.FORBIDDEN,
        status: 'FORBIDDEN',
      })
    }

    // Token is valid, rotate
    const newRefreshToken = authenticate.generateRefreshToken({
      _id: user._id,
    })

    // Replace old token with new one
    await UserServices.removeRefreshToken(user._id, token)
    await UserServices.pushRefreshToken(user._id, newRefreshToken)

    const newAccessToken = authenticate.generateToken({
      _id: user._id,
    })

    res.cookie(cookieNames.refreshToken, newRefreshToken.token, {
      httpOnly: true,
      domain: config.cookie.domain,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    req.session.passport.user.accessToken = newAccessToken.token
    req.session.passport.user.expiresAt = newAccessToken.expiresAt
    req.session.modified = true

    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) return reject(err)

        resolve()
      })
    })

    return successResponse(
      res,
      'Token refreshed',
      { accessToken: newAccessToken.token },
      StatusCodes.OK
    )
  } catch (err) {
    return next({
      message: 'Invalid token',
      code: StatusCodes.UNAUTHORIZED,
      status: 'UNAUTHORIZED',
    })
  }
}

module.exports = {
  register,
  login,
  getUser,
  logout,
  refreshAccessToken,
}
