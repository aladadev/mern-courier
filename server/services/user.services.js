const { StatusCodes } = require("http-status-codes");
const UserModel = require("../models/user.model");

const getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id).exec();

    if (!user || user === null) {
      let error = new Error("User Not Found");
      error.name = "NotFoundError";
      error.status = "NOT_FOUND";
      error.code = StatusCodes.NOT_FOUND;

      throw error;
    }

    return user;
  } catch (err) {
    throw err;
  }
};

const pushRefreshToken = async (id, payload) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      id,
      {
        $push: {
          refreshTokens: payload,
        },
      },
      {
        new: true,
      }
    ).exec();

    return user;
  } catch (err) {
    throw err;
  }
};

const removeRefreshToken = async (id, token) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          refreshTokens: { token },
        },
      },
      {
        new: true,
      }
    ).exec();

    return user;
  } catch (err) {
    throw err;
  }
};

const invalidateRefreshToken = async (id) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          refreshTokens: [],
        },
      },
      {
        new: true,
      }
    ).exec();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getUserById,

  pushRefreshToken,
  removeRefreshToken,
  invalidateRefreshToken,
};

// {
//     "firstName": "Az",
//     "lastName": "Ba",
//     "email": "a@gmail.com",
//     "password": "123456"
// }
