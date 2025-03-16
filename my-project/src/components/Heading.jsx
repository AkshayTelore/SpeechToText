import { motion } from "framer-motion";

const Heading = () => {
  return (
    <motion.h1
      className="m-8 text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-white mt-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <span className="text-blue-600 animate-pulse">"Speak Freely,</span>{" "}
      <span className="text-green-500 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent animate-gradient">
        Convert Instantly."
      </span>
    </motion.h1>
  );
};

export default Heading;
