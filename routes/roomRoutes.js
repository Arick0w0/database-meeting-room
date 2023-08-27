const express = require("express");
const router = express.Router();
const Room = require("../models/Room.js"); // Import the Room model
const Booking = require("../models/Booking.js");
const { errorHandler } = require("../utils/helpers.js");

// Create a new room
router.post("/create", async (req, res) => {
  try {
    const { address, title_room, description } = req.body;

    // Find the highest roomNumber currently in the collection
    const highestRoom = await Room.findOne().sort({ roomNumber: -1 });

    // Calculate the new roomNumber by incrementing the highest roomNumber
    const newRoomNumber = highestRoom ? highestRoom.roomNumber + 1 : 1;

    const room = new Room({
      roomNumber: newRoomNumber.toString(), // Convert to string
      address,
      title_room,
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

// Get bookings by Room_All

router.get("/", async (req, res) => {
  try {
    const bookings = await Room.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a room by roomNumber
router.delete("/delete/:roomNumber", async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;

    // Find and delete the room
    const deletedRoom = await Room.findOneAndDelete({ roomNumber });

    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Update room details by roomNumber
router.put("/update/:roomNumber", async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;
    const { address, title_room, description } = req.body;

    // Find and update the room
    const updatedRoom = await Room.findOneAndUpdate(
      { roomNumber },
      { address, title_room, description },
      { new: true } // Return the updated room
    );

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res
      .status(200)
      .json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    errorHandler(res, error);
  }
});

module.exports = router;
