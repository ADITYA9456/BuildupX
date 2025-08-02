'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaDumbbell } from 'react-icons/fa';
import { IoIosFitness } from 'react-icons/io';
import { MdEmail, MdPhone } from 'react-icons/md';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      {/* Animated divider line */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="h-0.5 bg-gradient-to-r from-green-500/40 via-green-400/80 to-green-500/40"
      />

      {/* Main footer content */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 pt-8 pb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Logo & Social */}
          <motion.div variants={fadeIn} className="flex flex-col">
            <div className="flex items-center mb-2">
              <motion.div
                whileHover={{ rotate: 360, color: "#22c55e" }}
                transition={{ duration: 0.5 }}
              >
                <IoIosFitness className="text-2xl text-green-500 mr-2" />
              </motion.div>
              <span className="text-lg font-bold text-white">GYM X</span>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-2 mt-1">
              <motion.a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, backgroundColor: "#22c55e" }}
                className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center"
              >
                <FaFacebook className="text-white text-xs" />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, backgroundColor: "#22c55e" }}
                className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center"
              >
                <FaTwitter className="text-white text-xs" />
              </motion.a>
              <motion.a 
                href="https://instagram.com"
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, backgroundColor: "#22c55e" }}
                className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center"
              >
                <FaInstagram className="text-white text-xs" />
              </motion.a>
              <motion.a 
                href="https://youtube.com"
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, backgroundColor: "#22c55e" }}
                className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center"
              >
                <FaYoutube className="text-white text-xs" />
              </motion.a>
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={fadeIn} className="flex flex-col">
            <h3 className="text-md font-bold text-white mb-2 relative inline-block">
              Quick Links
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "2rem" }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute -bottom-1 left-0 h-0.5 bg-green-500 rounded-full"
              />
            </h3>
            
            <div className="grid grid-cols-2 gap-1 text-xs">
              {[
                { name: 'Home', href: '/' },
                { name: 'About', href: '/about' },
                { name: 'Classes', href: '/classes' },
                { name: 'Contact', href: '/contact' },
                { name: 'Tracker', href: '/tracker' },
                { name: 'Membership', href: '/#membership' },
              ].map((link, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-green-500 flex items-center"
                  >
                    <FaDumbbell className="mr-1 text-green-500 text-xs" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Column 3: Hours & Contact */}
          <motion.div variants={fadeIn} className="flex flex-col">
            <div className="mb-2">
              <h3 className="text-md font-bold text-white mb-2 relative inline-block">
                Hours
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "2rem" }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute -bottom-1 left-0 h-0.5 bg-green-500 rounded-full"
                />
              </h3>
              
              <ul className="text-xs space-y-0.5">
                <li className="flex justify-between">
                  <span className="text-gray-400">Mon-Fri:</span>
                  <span className="text-gray-300">6AM-10PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Sat:</span>
                  <span className="text-gray-300">7AM-8PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Sun:</span>
                  <span className="text-gray-300">8AM-6PM</span>
                </li>
              </ul>
            </div>

            <div className="mt-2">
              <h3 className="text-md font-bold text-white mb-2 relative inline-block">
                Contact
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "2rem" }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute -bottom-1 left-0 h-0.5 bg-green-500 rounded-full"
                />
              </h3>
              
              <div className="text-xs space-y-1">
                <motion.a 
                  href="tel:+14567778882"
                  whileHover={{ x: 3, color: "#22c55e" }}
                  className="flex items-center text-gray-400"
                >
                  <MdPhone className="text-green-500 mr-1" />
                  +1 456-777-8882
                </motion.a>
                <motion.a 
                  href="mailto:info@gymx.com"
                  whileHover={{ x: 3, color: "#22c55e" }}
                  className="flex items-center text-gray-400"
                >
                  <MdEmail className="text-green-500 mr-1" />
                  info@gymx.com
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t border-gray-800/50 my-4"
        />
        
        {/* Copyright Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-xs mb-1 md:mb-0">
            © {currentYear} GYM X
          </p>
          <div className="flex space-x-3 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-green-500">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-green-500">Terms</Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
