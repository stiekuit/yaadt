import { motion } from "framer-motion";

export const HeroWave = () => {
  return (
    <>
      {/* Primary wave - violet to blue */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-violet-600 via-blue-500 to-indigo-700 opacity-60 blur-3xl"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Secondary wave - cyan accent */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-400 to-purple-600 opacity-40 blur-2xl"
        animate={{
          backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
          scale: [1.05, 1, 1.05],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1,
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Pulsing overlay for AI effect */}
      <motion.div
        className="absolute inset-0 bg-white/5"
        animate={{
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </>
  );
};
