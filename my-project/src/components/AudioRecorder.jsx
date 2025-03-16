
  import { useState, useRef } from "react";
  import axios from "axios";
  import { FaMicrophone, FaStop, FaUpload, FaFileAudio, FaHistory, FaTrash } from "react-icons/fa";
  import { FiLoader } from "react-icons/fi";

  export default function AudioRecorder({ setTranscription }) {
    const [recording, setRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    // const [loggedIn, setLoggedIn] = useState(false);
    // const [email, setUsername] = useState("");
    // const [password, setPassword] = useState("");
    // const [isRegistering, setIsRegistering] = useState(false);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);





     // Handle Authentication
  // const handleAuth = async () => {
  //   try {
  //     const endpoint = isRegistering ? "/signup" : "/login";
  //     const response = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
  //     if (response.data.success) {
  //       setLoggedIn(true);
  //     } else {
  //       alert(response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Authentication error:", error);
  //   }
  // };

  // if (!loggedIn) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
  //       <h2 className="text-2xl font-bold mb-4">{isRegistering ? "Register" : "Login"}</h2>
  //       <input type="text" placeholder="Username" value={email} onChange={(e) => setUsername(e.target.value)} className="p-2 border rounded mb-2" />
  //       <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 border rounded mb-2" />
  //       <button onClick={handleAuth} className="px-4 py-2 bg-blue-500 text-white rounded">{isRegistering ? "Register" : "Login"}</button>
  //       <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-500 mt-2">{isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}</button>
  //     </div>
  //   )
  // }

    // Start Recording
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const file = new File([audioBlob], `recording-${Date.now()}.wav`, { type: "audio/wav" });
        setAudioFile(file);
        setAudioURL(URL.createObjectURL(audioBlob)); // Create URL to play audio
        audioChunks.current = [];
      };

      mediaRecorder.current.start();
      setRecording(true);
    };

    // Stop Recording
    const stopRecording = () => {
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
      }
      setRecording(false);
    };

    // Handle File Selection
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        setAudioFile(file);
        setAudioURL(URL.createObjectURL(file)); //Create URL for the selected file
      }
    };

    // Upload Audio
    const uploadAudio = async () => {
      if (!audioFile) {
        alert("No recorded or selected file found! Please upload or record.");
        return;
      }

      setUploading(true);
      setAudioURL(null); // Hide the playable audio before uploading

      const formData = new FormData();
      formData.append("audio", audioFile);

      try {
        const response = await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setTranscription(response.data.transcription);
      } catch (error) {
        console.error("Error uploading audio:", error);
        setTranscription("Error in transcription.");
      } finally {
        setUploading(false);
      }
    };

    // Fetch Transcription History
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/history");
        setHistory(response.data);
        setShowHistory(true);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    // Clear Transcription
    const clearTranscription = () => {
      setTranscription("");
    };

    // Clear History
    // const clearHistory = async () => {
    //   try {
    //     await axios.delete("http://localhost:5000/clear-history"); // Backend should handle history deletion
    //     setHistory([]);
    //     setShowHistory(false);
    //   } catch (error) {
    //     console.error("Error clearing history:", error);
    //   }
    // };

    return (
      <div className="flex flex-col md:flex-row items-start w-full max-w-5xl mx-auto p-6 bg-gray-100 shadow-lg rounded-lg space-x-6">
        {/* Left Section - Transcription History */}
        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
            <FaHistory /> <span>Transcription History</span>
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={fetchHistory}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Fetch History
            </button>
          
          </div>

          {showHistory && (
            <div className="max-h-64 overflow-y-auto border rounded-lg mt-3">
              {history.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-4 py-2">Filename</th>
                      <th className="border px-4 py-2">Transcription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => (
                      <tr key={entry.id} className="border">
                        <td className="border px-4 py-2">{entry.filename}</td>
                        <td className="border px-4 py-2">{entry.transcription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 p-2">No history available.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Recording & Upload */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">🎙 Speech-to-Text</h2>

          {audioURL && (
            <audio controls className="w-full">
              <source src={audioURL} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          )}

          {/* Buttons Row */}
          <div className="flex space-x-3">
            <button
              onClick={startRecording}
              className="px-5 py-3 flex items-center space-x-2 rounded-lg bg-green-600 text-white font-semibold transition disabled:bg-gray-400"
              disabled={recording}
            >
              <FaMicrophone />
              <span>Start</span>
            </button>

            <button
              onClick={stopRecording}
              className="px-5 py-3 flex items-center space-x-2 rounded-lg bg-red-600 text-white font-semibold transition disabled:bg-gray-400"
              disabled={!recording}
            >
              <FaStop />
              <span>Stop</span>
            </button>
          </div>

          {/* File Upload */}
          <label className="w-full flex items-center space-x-3 bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold cursor-pointer">
            <FaFileAudio />
            <span>Select Audio File</span>
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
          </label>

          {/* Upload Button */}
          <button
            onClick={uploadAudio}
            className="w-full flex justify-center items-center space-x-2 px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold transition disabled:bg-gray-400"
            disabled={!audioFile || uploading}
          >
            {uploading ? <FiLoader className="animate-spin" /> : <FaUpload />}
            <span>{uploading ? "Processing..." : "Upload & Transcribe"}</span>
          </button>

          {/* Clear Transcription Button */}
          <button
            onClick={clearTranscription}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center space-x-2"
          >
            <FaTrash />
            <span>Clear Transcription</span>
          </button>
        </div>
      </div>
    );
  }










