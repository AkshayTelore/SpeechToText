// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const axios = require("axios");
// const fs = require("fs");

// const app = express();
// const PORT = process.env.PORT || 5000;
// const ASSEMBLY_AI_API_KEY = "eae4d1c3caac4e5d9255c45cbc78582e";

// app.use(cors());
// app.use(express.json());

// // Multer for file uploads
// const storage = multer.diskStorage({
//   destination: "./uploads/",
//   filename: (req, file, cb) => {
//     cb(null, `audio-${Date.now()}.wav`);
//   },
// });
// const upload = multer({ storage });

// // Speech-to-Text Route
// app.post("/upload", upload.single("audio"), async (req, res) => {
//   try {
//     const audioPath = req.file.path;

//     // Upload file to AssemblyAI
//     const audioData = fs.readFileSync(audioPath);
//     const uploadResponse = await axios.post(
//       "https://api.assemblyai.com/v2/upload",
//       audioData,
//       {
//         headers: {
//           authorization: ASSEMBLY_AI_API_KEY,
//           "content-type": "audio/wav",
//         },
//       }
//     );

//     const audioUrl = uploadResponse.data.upload_url;
//     console.log('Audio URL is',audioUrl)

//     // Request transcription
//     const transcribeResponse = await axios.post(
//       "https://api.assemblyai.com/v2/transcript",
//       { audio_url: audioUrl },
//       {
//         headers: { authorization: ASSEMBLY_AI_API_KEY },
//       }
//     );

//     const transcriptId = transcribeResponse.data.id;

//     // Poll for transcription
//     let transcriptText = "";
//     while (true) {
//       const transcriptResponse = await axios.get(
//         `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
//         { headers: { authorization: ASSEMBLY_AI_API_KEY } }
//       );

//       if (transcriptResponse.data.status === "completed") {
//         transcriptText = transcriptResponse.data.text;
//         break;
//       } else if (transcriptResponse.data.status === "failed") {
//         transcriptText = "Transcription failed.";
//         break;
//       } else {
//         await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait before retrying
//       }
//     }

//     // Delete uploaded file
//     fs.unlinkSync(audioPath);
// console.log('text is',transcriptText)
//     res.json({ transcription: transcriptText });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Failed to process audio" });
//   }
// });

// // Start the server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/////////////////////////////////////////////////////
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const axios = require("axios");
// const { createClient } = require("@supabase/supabase-js");
// const crypto = require("crypto");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ API Keys & Supabase Config
// const ASSEMBLY_AI_API_KEY = "eae4d1c3caac4e5d9255c45cbc78582e";
// const SUPABASE_URL = "https://flxvmphnoimxxntgpmql.supabase.co";
// const SUPABASE_API_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseHZtcGhub2lteHhudGdwbXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzMxMjIsImV4cCI6MjA1NjUwOTEyMn0.m4m3JzCZPk_NcixWIEK_XMAzDL2tX7ApTKsRZVM5R3A";

// // ✅ Initialize Supabase Client
// const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY, {
//   auth: { persistSession: false },
// });

// app.use(cors());
// app.use(express.json());

// // ✅ Multer (store in memory)
// const upload = multer({ storage: multer.memoryStorage() });

// // ✅ Test Supabase Connection
// (async () => {
//   try {
//     const response = await axios.get(`${SUPABASE_URL}/rest/v1/transcription`, {
//       headers: { apikey: SUPABASE_API_KEY , "Content-Type": "application/json" },
//     });

//     if (response.status !== 200) throw new Error(`HTTP Error: ${response.status}`);
//     console.log("✅ Supabase Connected Successfully!");
//   } catch (error) {
//     console.error("❌ Supabase Connection Error:", error.message);
//   }
// })();

// // 📌 Upload Route
// app.post("/upload", upload.single("audio"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No audio file uploaded" });
//   }

//   try {
//     const uniqueFilename = `audio-${Date.now()}.wav`;
//     console.log(`📂 Uploading ${uniqueFilename} to Supabase Storage...`);

//     // ✅ Upload to Supabase Storage using Axios
//     const { data: uploadData, status } = await axios.post(
//       `${SUPABASE_URL}/storage/v1/s3/object/audio-uploads/${uniqueFilename}`,
//       req.file.buffer,
//       {
//         headers: {
//           Authorization: `Bearer ${SUPABASE_API_KEY}`,
//           "Content-Type": req.file.mimetype,
//         },
//       }
//     );

//     if (status !== 200) {
//       throw new Error(`Supabase Upload Failed: Status ${status}`);
//     }

//     console.log("✅ File uploaded successfully");

//     // ✅ Generate Public URL
//     const fileUrl = `${SUPABASE_URL}/storage/v1/s3/object/public/audio-uploads/${uniqueFilename}`;
//     console.log("🌐 Public File URL:", fileUrl);

//     // ✅ Send file to AssemblyAI for transcription
//     console.log("🎙 Sending audio to AssemblyAI for transcription...");

//     const { data: uploadResponse } = await axios.post(
//       "https://api.assemblyai.com/v2/upload",
//       req.file.buffer,
//       {
//         headers: {
//           authorization: ASSEMBLY_AI_API_KEY,
//           "Content-Type": req.file.mimetype,
//         },
//       }
//     );

//     const audioUrl = uploadResponse.upload_url;

//     const { data: transcribeResponse } = await axios.post(
//       "https://api.assemblyai.com/v2/transcript",
//       { audio_url: audioUrl },
//       { headers: { authorization: ASSEMBLY_AI_API_KEY } }
//     );

//     const transcriptId = transcribeResponse.id;

//     // 🔄 Polling for transcription result
//     let transcriptText = "";
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (attempts < maxAttempts) {
//       const { data: transcriptResponse } = await axios.get(
//         `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
//         { headers: { authorization: ASSEMBLY_AI_API_KEY } }
//       );

//       if (transcriptResponse.status === "completed") {
//         transcriptText = transcriptResponse.text;
//         break;
//       } else if (transcriptResponse.status === "failed") {
//         transcriptText = "Transcription failed.";
//         break;
//       } else {
//         await new Promise((resolve) => setTimeout(resolve, 3000));
//         attempts++;
//       }
//     }

//     if (!transcriptText) {
//       return res.status(500).json({ error: "Transcription timed out" });
//     }

//     // 🔹 Generate UUID for the new entry
//     const newId = crypto.randomUUID();

//     // 🔹 Save transcription in Supabase
//     const { data, error } = await supabase
//       .from("transcription") // Ensure table name is correct
//       .insert([
//         {
//           id: newId,
//           filename: fileUrl,
//           // file_url: fileUrl,
//           transcription: transcriptText,
//           created_at: new Date().toISOString(),
//         },
//       ]);

//     if (error) {
//       console.error("❌ Supabase Insert Error:", error);
//       return res.status(500).json({ error: "Failed to save transcription" });
//     }

//     res.json({
//       id: newId,
//       file_url: fileUrl,
//       transcription: transcriptText,
//     });
//   } catch (error) {
//     console.error("❌ Server Error:", error.message);
//     res.status(500).json({ error: "Failed to process audio", details: error.message });
//   }
// });

// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



//////////////////////////////////////





// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const axios = require("axios");
// const { Pool } = require("pg");
// const crypto = require("crypto");

// const app = express();
// const PORT = process.env.PORT || 5000;

// const pool = new Pool({
//   connectionString: "postgresql://postgres:zPdChLijK0tXrNqq@db.flxvmphnoimxxntgpmql.supabase.co:5432/postgres",
//   ssl: { rejectUnauthorized: false }, 
// });

// app.use(cors());
// app.use(express.json());

// const upload = multer({ storage: multer.memoryStorage() });

// (async () => {
//   try {
//     const client = await pool.connect();
//     console.log("✅ PostgreSQL Connected Successfully!");
//     client.release();
//   } catch (error) {
//     console.error("❌ PostgreSQL Connection Error:", error.message);
//   }
// })();

// app.post("/upload", upload.single("audio"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

//   try {
//     const uniqueFilename = `audio-${Date.now()}.wav`;
//     console.log(`📂 Processing ${uniqueFilename}...`);

//     const { data: uploadResponse } = await axios.post(
//       "https://api.assemblyai.com/v2/upload",
//       req.file.buffer,
//       { headers: { authorization: "eae4d1c3caac4e5d9255c45cbc78582e", "Content-Type": req.file.mimetype } }
//     );

//     const audioUrl = uploadResponse.upload_url;
//     const { data: transcribeResponse } = await axios.post(
//       "https://api.assemblyai.com/v2/transcript",
//       { audio_url: audioUrl },
//       { headers: { authorization: "eae4d1c3caac4e5d9255c45cbc78582e" } }
//     );

//     const transcriptId = transcribeResponse.id;
//     let transcriptText = "";
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (attempts < maxAttempts) {
//       const { data: transcriptResponse } = await axios.get(
//         `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
//         { headers: { authorization: "eae4d1c3caac4e5d9255c45cbc78582e" } }
//       );

//       if (transcriptResponse.status === "completed") {
//         transcriptText = transcriptResponse.text;
//         break;
//       } else if (transcriptResponse.status === "failed") {
//         transcriptText = "Transcription failed.";
//         break;
//       } else {
//         await new Promise((resolve) => setTimeout(resolve, 3000));
//         attempts++;
//       }
//     }

//     if (!transcriptText) return res.status(500).json({ error: "Transcription timed out" });

//     const newId =  Date.now();;
//     const client = await pool.connect();
//     await client.query(
//       "INSERT INTO transcription (id, filename, transcription, created_at) VALUES ($1, $2, $3, $4)",
//       [newId, uniqueFilename, transcriptText, new Date().toISOString()]
//     );
//     client.release();

//     res.json({ id: newId, filename: uniqueFilename, transcription: transcriptText });
//   } catch (error) {
//     console.error("❌ Server Error:", error.message);
//     res.status(500).json({ error: "Failed to process audio", details: error.message });
//   }
// });

// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


























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




























