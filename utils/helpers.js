// utils/helpers.js
const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "Server error" });
};

module.exports = { errorHandler };
