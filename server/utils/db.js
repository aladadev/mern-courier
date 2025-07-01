const config = require("./config");
const mongoose = require("mongoose");

const connectDb = () => {
  mongoose
    .connect(config.db.uri, {})
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.error("Failed to connect db", err);
    });
};

module.exports = {
  connectDb,
};
