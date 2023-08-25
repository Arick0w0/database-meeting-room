const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    collection: "admins", // Change the collection name here}
    // versionKey: false, // Exclude the __v field
  }
);

module.exports = mongoose.model("Admin", userSchema);
