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
    isActive: {
      type: Boolean,
      default: true, // Booking is active by default
    },
  },
  {
    collection: "booking_1", // Change the collection name here}
    // versionKey: false, // Exclude the __v field
  }
);

// Set the versionKey property to false to hide the __v field in the output
bookingSchema.set("toJSON", { versionKey: false });
module.exports = mongoose.model("Booking", bookingSchema);
