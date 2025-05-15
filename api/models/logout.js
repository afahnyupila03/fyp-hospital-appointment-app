const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const logoutSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Logout", logoutSchema);
