require("dotenv").config();
const express = require("express");
const connectDB = require("./config/mongodb");
const authRoute = require('./routes/user_route');
const personRoute = require('./routes/person_route')
const conversationRoute = require('./routes/conversation_route')
const cors = require('cors');
const app = express();
app.use(express.json());

//cors
app.use(cors())
// routes
app.use(personRoute)
app.use(authRoute)
app.use(conversationRoute)

// Connect to MongoDB
connectDB();
app.get("/", (req, res) => {
  res.send("Server running & DB connected!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
