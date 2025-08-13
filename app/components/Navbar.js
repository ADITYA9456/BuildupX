'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const links = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About Us', href: '/about' },
  { id: 'contact', label: 'Contact', href: '/contact' },
  { id: 'classes', label: 'Classes', href: '/classes' },
  { id: 'tracker', label: 'Tracker', href: '/tracker' },
];

export default function Navbar() {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 100);
      
      let current = '';
      links.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section) {
          const top = section.offsetTop - 120;
          const height = section.offsetHeight;
          if (scrollTop >= top && scrollTop < top + height) {
            current = id;
          }
        }
      });
      setActive(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-4 left-4 right-4 z-50 backdrop-blur-xl border shadow-2xl rounded-2xl transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 border-green-500/50 shadow-green-500/20' 
          : 'bg-black/80 border-green-500/30'
      }`}
      style={{ 
        boxShadow: scrolled 
          ? '0 20px 40px rgba(34, 197, 94, 0.15), 0 8px 32px rgba(0,0,0,0.4)' 
          : '0 8px 32px rgba(0,0,0,0.37)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Enhanced Logo */}
        <motion.div 
          className="text-xl font-bold"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/">
            <motion.div
              className="relative overflow-hidden flex items-center bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-white px-4 py-3 rounded-xl border border-green-400/50 shadow-lg cursor-pointer"
              whileHover={{
                boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
                scale: 1.02
              }}
            >
              {/* BUILDUP text */}
              <span className="relative z-10 mr-1 font-extrabold text-gray-600 tracking-wide text-sm">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-400" style={{ letterSpacing: '1px' }}>BUILDUP</span>
              </span>
              
              {/* Professional weightlifter icon */}
              <div className="relative z-10 mx-1.5">
                <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Barbell plates */}
                  <ellipse cx="3" cy="7" rx="3" ry="2" fill="#FFD700" />
                  <ellipse cx="21" cy="7" rx="3" ry="2" fill="#FFD700" />
                  
                  {/* Barbell bar */}
                  <path d="M3 7H21" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Head */}
                  <circle cx="12" cy="7" r="3" fill="#FFD700" />
                  
                  {/* Body */}
                  <path d="M12 10V13" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Curved arm - right side */}
                  <path d="M12 11C13.5 11 15 9.5 16 9" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Curved arm - left side */}
                  <path d="M12 11C10.5 11 9 9.5 8 9" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Legs */}
                  <path d="M12 13C12 13 10 16 9 18" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M12 13C12 13 14 16 15 18" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              
              {/* X text */}
              <span className="relative z-10 ml-1 font-extrabold tracking-wide text-sm text-white">
                X
              </span>
              
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* Enhanced Links */}
        <motion.ul 
          className="hidden md:flex gap-2 bg-gray-900/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700/50"
          whileHover={{ scale: 1.01 }}
        >
          {links.map(({ id, label, href }, index) => (
            <motion.li 
              key={id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={href}
                className={`relative font-medium px-5 py-2.5 rounded-full transition-all duration-300 text-sm ${
                  active === id 
                    ? 'text-green-400 bg-green-500/20 shadow-lg' 
                    : 'text-white hover:text-green-400 hover:bg-green-500/10'
                }`}
              >
                <span className="relative z-10">{label}</span>
                {active === id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-green-500/20 rounded-full border border-green-400/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-green-500/10 rounded-full opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        {/* Enhanced Call Button */}
        <motion.a
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)"
          }}
          whileTap={{ scale: 0.95 }}
          href="tel:+14567778882"
          className="hidden md:inline-block relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold text-sm border border-green-400/50 shadow-lg transition-all duration-300 uppercase tracking-wide"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            CALL NOW
          </span>
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.a>

        {/* Enhanced Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden text-white p-3 rounded-xl border border-green-500/30 bg-green-500/20 backdrop-blur-sm"
        >
          <motion.svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </motion.svg>
        </motion.button>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-500/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: `${50}%`,
            }}
          />
        ))}
      </div>
    </motion.nav>
  );
}
