const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true },
    // capacity: { type: Number, required: true },
    // amenities: [String], // An array of strings representing amenities
    title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    collection: "room_2", // Change the collection name here}
    versionKey: false, // Exclude the __v field
  }
);

module.exports = mongoose.model("Room", roomSchema);
