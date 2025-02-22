const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect("mongodb://localhost:27017/userSpeechRecord");
app.listen(5000, () => console.log("Server running on port 5000"));
