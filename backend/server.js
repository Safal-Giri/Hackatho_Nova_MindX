require("dotenv").config();
const express = require("express");
const connectDB = require("./config/mongodb");

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Server running & DB connected!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
