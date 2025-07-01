const passport = require("passport");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");

const UserModel = require("../models/user.model");

// strategies
const LocalStrategy = require("passport-local").Strategy,
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

// use static authenticate method of model in LocalStrategy
exports.local = passport.use(
  new LocalStrategy({ usernameField: "email" }, UserModel.authenticate())
);

// use static serialize and deserialize of model for passport session support
passport.serializeUser((user, done) => {
  done(null, {
    id: user._id,
  });
});

passport.deserializeUser(async (sessionData, done) => {
  try {
    const user = await UserModel.findById(sessionData.id).exec();

    done(null, { user, accessToken: sessionData.accessToken });
  } catch (err) {
    done(err);
  }
});

exports.generateToken = (user) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const token = jwt.sign(user, config.secrets.jwt, {
    algorithm: "HS512",
    expiresIn: 3600,
    issuer: config.origin.server,
    audience: config.origin.client,
  });

  return {
    token,
    expiresAt,
  };
};

exports.generateRefreshToken = (user) => {
  const jti = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const token = jwt.sign({ ...user, jti }, config.secrets.jwtRefresh, {
    algorithm: "HS512",
    expiresIn: "30d",
    issuer: config.origin.server,
    audience: config.origin.client,
  });

  return {
    jti,
    token,
    expiresAt,
  };
};

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secrets.jwt,
};

exports.jwtExtractor = passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      if (
        jwt_payload?.iss !== config.origin.server ||
        config.origin.client.indexOf(jwt_payload?.aud) === -1
      ) {
        return done(
          {
            message: "Unauthorized request",
            status: "UNAUTHORIZED",
            code: 401,
          },
          false
        );
      }

      const user = await UserModel.findById(jwt_payload._id).exec();

      if (!user) {
        return done(
          {
            message: "User not found",
            status: "NOT_FOUND",
            code: 404,
          },
          false
        );
      }

      done(null, user);
    } catch (err) {
      console.error("Error in JWT strategy:", err);
      done(err, false);
    }
  })
);
