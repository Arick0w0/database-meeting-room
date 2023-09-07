// routes/roomRoutes.js

const express = require("express");
const router = express.Router();
const Room = require("../models/Room.js"); // Import the Room model
const Booking = require("../models/Booking.js");
const multer = require("multer"); // Import multer for handling file uploads
const path = require("path");

// Import the fs module
const fs = require("fs");

// const errorHandler = require("../utils/helpers.js").errorHandler;
const { errorHandler } = require("../utils/helpers.js");

const upload = require("../middleware/multerConfig.js");

// Create a new room
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { address, title_room, description } = req.body;
    const image = req.file ? req.file.filename : ""; // Get the uploaded image filename

    // Find the highest roomNumber currently in the collection
    const highestRoom = await Room.findOne().sort({ roomNumber: -1 });

    // Calculate the new roomNumber by incrementing the highest roomNumber
    const newRoomNumber = highestRoom ? highestRoom.roomNumber + 1 : 1;

    const room = new Room({
      roomNumber: newRoomNumber, // Store roomNumber as a number, not a string
      address,
      title_room,
      description,
      image,
    });

    const savedRoom = await room.save();
    res
      .status(201)
      .json({ message: "Room created successfully", room: savedRoom });
  } catch (error) {
    errorHandler(res, error);
  }
});
// Get bookings by Room_All
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    const roomsWithImageURLs = rooms.map((room) => ({
      ...room._doc,
      image: room.image ? `/uploads/${room.image}` : null,
    }));
    res.status(200).json(roomsWithImageURLs);
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

    // Find the room associated with the provided room number
    const room = await Room.findOne({ roomNumber });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Map the bookings to include the room's title_room
    const bookingsWithRoomInfo = bookings.map((booking) => ({
      ...booking._doc,
      room_title: room.title_room,
    }));

    res.status(200).json(bookingsWithRoomInfo);
  } catch (error) {
    errorHandler(res, error);
  }
});

// Delete a room by roomNumber
router.delete("/delete/:roomNumber", async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;

    // Find the room to be deleted
    const roomToDelete = await Room.findOne({ roomNumber });

    if (!roomToDelete) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Delete the associated image file
    if (roomToDelete.image) {
      const imagePath = path.join(__dirname, "../uploads", roomToDelete.image);
      fs.unlinkSync(imagePath); // Delete the image file
    }

    // Delete the room from the database
    const deletedRoom = await Room.findOneAndDelete({ roomNumber });

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Update room details by roomNumber
router.put("/update/:roomNumber", upload.single("image"), async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;
    const { address, title_room, description } = req.body;
    const image = req.file ? req.file.filename : null; // Get the uploaded image filename

    // Find the room to update
    const roomToUpdate = await Room.findOne({ roomNumber });

    if (!roomToUpdate) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Update fields if they are provided in the request
    if (address !== undefined) {
      roomToUpdate.address = address;
    }
    if (title_room !== undefined) {
      roomToUpdate.title_room = title_room;
    }
    if (description !== undefined) {
      roomToUpdate.description = description;
    }
    if (image !== null) {
      roomToUpdate.image = image;
    }

    // Save the updated room
    const updatedRoom = await roomToUpdate.save();

    res
      .status(200)
      .json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Close or Open a room by roomNumber
router.put("/:action/:roomNumber", async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;
    const action = req.params.action; // 'close' or 'open'

    // Find the room by roomNumber
    const room = await Room.findOne({ roomNumber });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Update the room's isOpen status based on the action parameter
    const isOpen = action === "1" ? true : false;
    room.isOpen = isOpen;

    // Save the updated room
    const updatedRoom = await room.save();

    const message = isOpen
      ? "Room opened successfully"
      : "Room closed successfully";

    res.status(200).json({ message });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Get a room by ID
router.get("/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;

    // Find the room by its ID
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    errorHandler(res, error);
  }
});

// Get all rooms with open status
router.get("/status/open", async (req, res) => {
  try {
    // Find all rooms with the 'isOpen' field set to true
    const openRooms = await Room.find({ isOpen: true });

    if (openRooms.length === 0) {
      return res.status(404).json({ error: "No open rooms found" });
    }

    // Map the open rooms to include the image URL
    const openRoomsWithImageURLs = openRooms.map((room) => ({
      ...room._doc,
      image: room.image ? `/uploads/${room.image}` : null,
    }));

    res.status(200).json(openRoomsWithImageURLs);
  } catch (error) {
    errorHandler(res, error);
  }
});
module.exports = router;
