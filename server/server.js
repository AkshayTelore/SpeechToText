
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const { Pool } = require("pg");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: "postgresql://postgres:zPdChLijK0tXrNqq@db.flxvmphnoimxxntgpmql.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }, 
});

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Check PostgreSQL connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Connected Successfully!");
    client.release();
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error.message);
  }
})();

// Upload and transcribe audio
app.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

  try {
    const uniqueFilename = `audio-${Date.now()}.wav`;
    console.log(`📂 Processing ${uniqueFilename}...`);

    const { data: uploadResponse } = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      req.file.buffer,
      { headers: { authorization: "eae4d1c3caac4e5d9255c45cbc78582e", "Content-Type": req.file.mimetype } }
    );

    const audioUrl = uploadResponse.upload_url;
    const { data: transcribeResponse } = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      { headers: { authorization: "eae4d1c3caac4e5d9255c45cbc78582e" } }
    );

    const transcriptId = transcribeResponse.id;
    let transcriptText = "";
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: transcriptResponse } = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { authorization: "eae4d1c3caac4e5d9255c45cbc78582e" } }
      );

      if (transcriptResponse.status === "completed") {
        transcriptText = transcriptResponse.text;
        break;
      } else if (transcriptResponse.status === "failed") {
        transcriptText = "Transcription failed.";
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts++;
      }
    }

    if (!transcriptText) return res.status(500).json({ error: "Transcription timed out" });

    const newId = Date.now();
    const client = await pool.connect();
    await client.query(
      "INSERT INTO transcription (id, filename, transcription, created_at) VALUES ($1, $2, $3, $4)",
      [newId, uniqueFilename, transcriptText, new Date().toISOString()]
    );
    client.release();

    res.json({ id: newId, filename: uniqueFilename, transcription: transcriptText });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ error: "Failed to process audio", details: error.message });
  }
});

// Fetch transcription history
app.get("/history", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM transcription ORDER BY created_at DESC");
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching history:", error.message);
    res.status(500).json({ error: "Failed to fetch transcription history" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




























