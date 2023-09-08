//routes/bookingRoute.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking.js");
const Room = require("../models/Room.js");

// Middleware for error handling
const { errorHandler } = require("../utils/helpers.js");

// Create a new booking with availability check
router.post("/create", createBooking);

// Get all bookings
router.get("/", getAllBookings);

// Get a booking by phone number
router.get("/:id", getBookingById);

// Update a booking by id
router.put("/update/:id", updateBooking);

// Delete a booking by id
router.delete("/delete/:id", deleteBooking);

// Update booking status by id
router.put("/cancel/:id", cancelBooking);

// Get bookings by Room_number and isActive status
router.get("/room/:roomNumber/:status", getBookingsByRoomAndStatus);

module.exports = router;

// Create a new booking with availability check
async function createBooking(req, res) {
  try {
    // Extract data from request body
    const {
      roomNumber,
      name,
      date,
      phone,
      department,
      startTime,
      endTime,
      title,
    } = req.body;

    // Check if the specified room exists
    const roomExists = await Room.exists({ roomNumber });
    if (!roomExists) {
      return res
        .status(404)
        .json({ error: "The specified room does not exist" });
    }

    // Check if the room is available for the specified time slot
    const isAvailable = await isBookingAvailable(
      roomNumber,
      date,
      startTime,
      endTime
    );

    if (!isAvailable) {
      return res
        .status(409)
        .json({ error: "Room not available for the specified time slot" });
    }

    // Create a new booking
    const booking = new Booking({
      roomNumber,
      name,
      date,
      phone,
      department,
      title,
      startTime,
      endTime,
    });

    // Save the booking
    const savedBooking = await booking.save();
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: savedBooking });
  } catch (error) {
    errorHandler(res, error);
  }
}

// Get all bookings
async function getAllBookings(req, res) {
  try {
    // Fetch all bookings from the database
    const bookings = await Booking.find();

    if (bookings.length === 0) {
      return res.status(404).json({ error: "No bookings found" });
    }

    // Create an array to store the final result with room titles
    const bookingsWithRoomTitles = [];

    // Fetch room titles for each booking and add them to the result
    for (const booking of bookings) {
      const roomNumber = booking.roomNumber;

      // Find the room associated with the booking
      const room = await Room.findOne({ roomNumber });

      if (room) {
        // Include the room title in the booking data
        const bookingWithRoomTitle = {
          ...booking._doc,
          title_room: room.title_room,
        };
        bookingsWithRoomTitles.push(bookingWithRoomTitle);
      }
    }

    res.status(200).json(bookingsWithRoomTitles);
  } catch (error) {
    errorHandler(res, error);
  }
}

// Get a booking by _id
async function getBookingById(req, res) {
  try {
    const bookingId = req.params.id; // Change 'phone' to 'id' here
    const booking = await Booking.findById(bookingId); // Use findById instead of findOne

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    errorHandler(res, error);
  }
}

// Update a booking by id
async function updateBooking(req, res) {
  try {
    const bookingId = req.params.id;
    const { roomNumber, date, startTime, endTime } = req.body;

    // Check if the specified room exists
    const roomExists = await Room.exists({ roomNumber });
    if (!roomExists) {
      return res
        .status(404)
        .json({ error: "The specified room does not exist" });
    }

    // Check if the room is available for the specified time slot
    const isAvailable = await isBookingAvailableForUpdate(
      bookingId,
      roomNumber,
      date,
      startTime,
      endTime
    );

    if (!isAvailable) {
      return res
        .status(409)
        .json({ error: "Room not available for the specified time slot" });
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { roomNumber, date, startTime, endTime },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    errorHandler(res, error);
  }
}

// Delete a booking by _id
async function deleteBooking(req, res) {
  try {
    const bookingId = req.params.id; // Change 'phone' to 'id' here
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (!deletedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
}

// Update booking Cancel status by phone number
async function cancelBooking(req, res) {
  try {
    const bookingId = req.params.id;
    console.log("Canceling booking with ID:", bookingId); // Add this line
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { isActive: false },
      { new: true }
    );
    if (!updatedBooking) {
      console.log("Booking not found with ID:", bookingId); // Add this line
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
}

// Get bookings by Room_number and isActive status
async function getBookingsByRoomAndStatus(req, res) {
  try {
    const roomNumber = req.params.roomNumber;
    const status = req.params.status; // Get the status from the request parameters
    const isActive = status === "active" ? 1 : 0; // Convert the status to 1 or 0

    // Query the database to find bookings with the specified room number and isActive status
    const bookings = await Booking.find({ roomNumber, isActive }).sort({
      startTime: 1,
    });

    if (bookings.length === 0) {
      return res.status(404).json({ error: "No bookings found for this room" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    errorHandler(res, error);
  }
}

// Function to check if a booking is available for the specified time slot and cancel the booking
async function isBookingAvailable(roomNumber, date, startTime, endTime) {
  try {
    const existingBooking = await Booking.findOne({
      roomNumber,
      date,
      isActive: 1, // Consider only active (not canceled) bookings
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } },
          ],
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } },
          ],
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } },
          ],
        },
      ],
    });
    return !existingBooking; // Return true if no overlapping booking found, false otherwise
  } catch (error) {
    console.error("Error checking booking availability:", error);
    return false; // Return false in case of any error
  }
}
// Function to check if a booking is available for update
async function isBookingAvailableForUpdate(
  bookingId,
  roomNumber,
  date,
  startTime,
  endTime
) {
  try {
    const existingBooking = await Booking.findOne({
      roomNumber,
      date,
      isActive: true, // Consider only active (not canceled) bookings
      _id: { $ne: bookingId }, // Exclude the current booking being updated
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } },
          ],
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } },
          ],
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } },
          ],
        },
      ],
    });
    return !existingBooking; // Return true if no overlapping booking found, false otherwise
  } catch (error) {
    console.error("Error checking booking availability for update:", error);
    return false; // Return false in case of any error
  }
}
