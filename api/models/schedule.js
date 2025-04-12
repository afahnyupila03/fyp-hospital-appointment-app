const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { TIME_SLOTS } = require("../constants");

const scheduleSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
    // required: true,
  },
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  time: {
    type: String,
    enum: TIME_SLOTS,
    required: true,
  },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
