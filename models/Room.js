//models/Room.js

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true },
    title_room: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    isOpen: { type: Boolean, default: true }, // New field to track room status
    image: { type: String, default: null },
  },
  {
    collection: "room02",
    versionKey: false,
  }
);

module.exports = mongoose.model("Room", roomSchema);
