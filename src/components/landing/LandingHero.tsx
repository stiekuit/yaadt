import { motion } from "framer-motion";
import { HeroWave } from "./HeroWave";
import { Sparkles, Bot, Code, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onStartChat: () => void;
}

export const LandingHero = ({ onStartChat }: LandingHeroProps) => {
  return (
    <section className="relative h-[70vh] min-h-[500px] flex flex-col justify-center items-center text-center overflow-hidden px-4">
      {/* Animated background */}
      <HeroWave />
      
      {/* Content */}
      <motion.div
        className="relative z-10 space-y-6 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center gap-3"
        >
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <Bot className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Your AI-Assisted <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
            Dev Team
          </span>
        </motion.h1>

        {/* Subtitle with icons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 text-white/90 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            <span>Automation</span>
          </div>
          <span className="text-white/50">•</span>
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            <span>Testing</span>
          </div>
          <span className="text-white/50">•</span>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span>AI Bots</span>
          </div>
          <span className="text-white/50">•</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>DevOps</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Button
            onClick={onStartChat}
            size="lg"
            className="mt-4 px-8 py-6 text-lg bg-white/10 border-2 border-white/30 rounded-full font-semibold backdrop-blur hover:bg-white/20 transition-all hover:scale-105 text-white shadow-2xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Chat with YAADT
          </Button>
        </motion.div>

        {/* Guest mode indicator */}
        <motion.p
          className="text-white/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          No sign-in required • Instant access
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <motion.div
            className="w-1.5 h-1.5 bg-white/70 rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};
