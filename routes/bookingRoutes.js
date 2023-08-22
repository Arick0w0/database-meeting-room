//routes/bookingRoutes.js

const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking.js");

// Middleware for error handling
const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "Server error" });
};

// Create a new booking with availability check
router.post("/create", async (req, res) => {
  try {
    // Extract necessary data from the request body
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

    // Check if the room is available for the specified time slot
    const isAvailable = await isBookingAvailable(
      roomNumber,
      date,
      startTime,
      endTime
    );

    // If the room is not available, send a conflict response
    if (!isAvailable) {
      return res
        .status(409)
        .json({ error: "Room not available for the specified time slot" });
    }

    // Create a new booking instance
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

    // Save the booking to the database and send the saved booking as a response
    const savedBooking = await booking.save();
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: savedBooking });
  } catch (error) {
    // If an error occurs during any step above, handle the error using the errorHandler
    errorHandler(res, error);
  }
});

// Function to check if a booking is available for the specified time slot
// async function isBookingAvailable(roomNumber, date, startTime, endTime) {
//   try {
//     const existingBooking = await Booking.findOne({
//       roomNumber,
//       date,
//       $or: [
//         {
//           $and: [
//             { startTime: { $lte: startTime } },
//             { endTime: { $gt: startTime } },
//           ],
//         },
//         {
//           $and: [
//             { startTime: { $lt: endTime } },
//             { endTime: { $gte: endTime } },
//           ],
//         },
//         {
//           $and: [
//             { startTime: { $gte: startTime } },
//             { endTime: { $lte: endTime } },
//           ],
//         },
//       ],
//     });
//     return !existingBooking; // Return true if no overlapping booking found, false otherwise
//   } catch (error) {
//     console.error("Error checking booking availability:", error);
//     return false; // Return false in case of any error
//   }
// }

async function isBookingAvailable(roomNumber, date, startTime, endTime) {
  try {
    const existingBooking = await Booking.findOne({
      roomNumber,
      date,
      isActive: true, // Only consider active (not canceled) bookings
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

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get a booking by phone number
router.get("/:phone", async (req, res) => {
  try {
    const phoneNumber = req.params.phone;
    const booking = await Booking.findOne({ phone: phoneNumber });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update a booking by phone number
router.put("/update/:phone", async (req, res) => {
  try {
    const phoneNumber = req.params.phone;
    const updatedBooking = await Booking.findOneAndUpdate(
      { phone: phoneNumber },
      req.body,
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a booking by phone number
// router.delete("/delete/:phone", async (req, res) => {
//   try {
//     const phoneNumber = req.params.phone;
//     const deletedBooking = await Booking.findOneAndDelete({
//       phone: phoneNumber,
//     });
//     if (!deletedBooking) {
//       return res.status(404).json({ error: "Booking not found" });
//     }
//     res.status(200).json({ message: "Booking deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// Update booking status by phone number
router.put("/cancel/:phone", async (req, res) => {
  try {
    const phoneNumber = req.params.phone;
    const updatedBooking = await Booking.findOneAndUpdate(
      { phone: phoneNumber },
      { isActive: false }, // Set the isActive property to false
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get bookings by Room_number
router.get("/room/:roomNumber", async (req, res) => {
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

module.exports = router;
