const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["admin", "agent", "customer"],
    default: "customer",
  },
  refreshTokens: [
    {
      token: { type: String },
      jti: { type: String },
      expiresAt: { type: Date },
    },
  ],
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

const transform = function (doc, ret) {
  delete ret.hash;
  delete ret.salt;
  delete ret.refreshTokens;
  delete ret["__v"];
  return ret;
};

UserSchema.set("toJSON", { transform });
UserSchema.set("toObject", { transform });

module.exports = mongoose.model("User", UserSchema);
