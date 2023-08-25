const express = require("express");
const router = express.Router();
const Room = require("../models/Room.js"); // Import the Room model
const Booking = require("../models/Booking.js");

const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "Server error" });
};

// Create a new room
router.post("/create", async (req, res) => {
  try {
    const { address, title, description } = req.body;

    // Find the highest roomNumber currently in the collection
    const highestRoom = await Room.findOne().sort({ roomNumber: -1 });

    // Calculate the new roomNumber by incrementing the highest roomNumber
    const newRoomNumber = highestRoom ? highestRoom.roomNumber + 1 : 1;

    const room = new Room({
      roomNumber: newRoomNumber.toString(), // Convert to string
      address,
      title,
      description,
    });

    const savedRoom = await room.save();
    res
      .status(201)
      .json({ message: "Room created successfully", room: savedRoom });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Get bookings by Room_number
router.get("/room/:roomNumber/bookings", async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;
    const bookings = await Booking.find({ roomNumber }).sort({ startTime: 1 });

    if (bookings.length === 0) {
      return res.status(404).json({ error: "No bookings found for this room" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.get("/", async (req, res) => {
  try {
    const bookings = await Room.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
