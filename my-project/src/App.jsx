  import { useState } from "react";
  import AudioRecorder from "./components/AudioRecorder";
  import Transcription from "./components/Transcription";
import Heading from "./components/Heading";

  export default function App() {
    const [transcription, setTranscription] = useState("");

    return (
      <>
      <Heading/>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        {/* <h1 className="text-2xl font-bold mb-6">Speech-to-Text Converter</h1> */}
        <AudioRecorder setTranscription={setTranscription} />
        <Transcription text={transcription} />
      </div>
      </>
    );
  }
