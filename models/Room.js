//models/Room.js

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true },
    title_room: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: null },
  },
  {
    collection: "room2", // Change the collection name here}
    versionKey: false, // Exclude the __v field
  }
);

module.exports = mongoose.model("Room", roomSchema);
