// model/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    title: { type: String, default: null },
    roomNumber: { type: Number, required: true },
    // room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    isActive: {
      type: Boolean,
      default: true, // Booking is active by default
    },
  },
  {
    collection: "booking", // Change the collection name here}
    versionKey: false, // Exclude the __v field
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
