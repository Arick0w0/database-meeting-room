// imageEdit.js

const fs = require("fs");
const path = require("path");

const editRoomImage = async (room, newImage) => {
  if (room.image) {
    const oldImagePath = path.join(__dirname, "../uploads", room.image);

    // Delete the old image file
    fs.unlinkSync(oldImagePath);
  }

  // Update the room's image property with the new image filename
  room.image = newImage;
  await room.save();
};

module.exports = editRoomImage;
