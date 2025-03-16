export default function Transcription({ text }) {
  return (
    <div className="mt-6 p-4 bg-gray-200 rounded-lg w-full max-w-lg text-center">
      <h2 className="font-bold text-lg mb-2">Transcription Result:</h2>
      <p className="text-gray-700">{text || "No transcription yet"}</p>
    </div>
  );
}
