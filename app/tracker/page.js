'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CalorieTracker from '../components/CalorieTracker';
import Navbar from '../components/Navbar';

export default function TrackerPage() {
  const [particles, setParticles] = useState([]);

  // Generate particles only on client side
  useEffect(() => {
    const generatedParticles = [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white relative overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-green-900/20" />
        
        {/* Floating Particles */}
        {particles.length > 0 && (
          <div className="absolute inset-0">
            {particles.map((particle, i) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-green-500/40 rounded-full"
                animate={{
                  x: [0, 150, 0],
                  y: [0, -120, 0],
                  opacity: [0, 1, 0],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 5 + particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay,
                }}
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
              />
            ))}
          </div>
        )}
        
        <div className="relative z-10 container mx-auto max-w-6xl px-4 py-20">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-green-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
            >
              Fitness Journey
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-green-200 to-green-500 bg-clip-text text-transparent"
            >
              CALORIE TRACKER
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-6 rounded-full"
            />
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-gray-300 text-lg max-w-2xl mx-auto"
            >
              Track your daily calories, set personalized fitness goals, and monitor your progress over time.
            </motion.p>
          </motion.div>
          
          <CalorieTracker />
        </div>
      </main>
    </>
  );
}
