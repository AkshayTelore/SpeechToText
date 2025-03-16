// import fs from "fs";
const fs = require('fs');

// import { SpeechClient } from "@google-cloud/speech";
const { SpeechClient }  = require("@google-cloud/speech");

const client = new SpeechClient({ keyFilename: "your-google-cloud-key.json" });
 async function transcribeAudio(filePath) {
  const audioBytes = fs.readFileSync(filePath).toString("base64");
  console.log("Result...",audioBytes);

  const request = {
    audio: { content: audioBytes },
    config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" },
  };

  const [response] = await client.recognize(request);
  return response.results.map(result => result.alternatives[0].transcript).join("\n");
}
module.exports = { transcribeAudio };