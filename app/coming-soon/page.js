'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function ComingSoon() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden pt-20">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-500/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="text-green-500 font-semibold tracking-widest text-lg uppercase block mb-3">
              Coming Soon
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-green-200 to-green-500 bg-clip-text text-transparent">
              MORE INFORMATION
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-6 rounded-full"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-6">
              We're working hard to bring you more detailed information about this class. 
              Please check back soon for updates.
            </p>
            
            <div className="bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-green-500">
                Stay Updated
              </h3>
              <p className="text-gray-300 mb-4">
                New content and class details will be uploaded shortly. We're committed to 
                providing comprehensive information to help you make the most of your fitness journey.
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "60px" }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="h-0.5 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-6 rounded-full"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-6"
          >
            <Link href="/classes" passHref>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg border border-green-400 cursor-pointer"
              >
                Back to Classes
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
