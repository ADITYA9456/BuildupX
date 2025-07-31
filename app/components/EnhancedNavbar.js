'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const mainLinks = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About Us', href: '/about' },
  { id: 'contact', label: 'Contact', href: '/contact' },
  { id: 'classes', label: 'Classes', href: '/classes' },
  { id: 'tracker', label: 'Tracker', href: '/tracker' },
];

export default function EnhancedNavbar() {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 100);
      
      let current = '';
      mainLinks.forEach(({ id }) => {
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

  const handleLogout = async () => {
    await logout();
  };

  // Create links array based on authentication status
  const links = [...mainLinks];
  
  // Only add these links if not logged in
  if (!user) {
    links.push({ id: 'login', label: 'Login', href: '/login' });
    links.push({ id: 'register', label: 'Register', href: '/register' });
  }

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
        {/* Logo */}
        <motion.div 
          className="text-xl font-bold"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/">
            <motion.span 
              className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-white px-6 py-3 rounded-xl border border-green-400/50 shadow-lg cursor-pointer font-extrabold tracking-wide text-sm"
              whileHover={{
                boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
                scale: 1.02
              }}
            >
              <span className="relative z-10">GYM X</span>
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.span>
          </Link>
        </motion.div>

        {/* Main Links */}
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

        {/* Action Button - Changes based on auth state */}
        {user ? (
          <motion.div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm border border-blue-400/50 shadow-lg transition-all duration-300 tracking-wide"
              >
                Dashboard
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(239, 68, 68, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm border border-red-400/50 shadow-lg transition-all duration-300 tracking-wide"
            >
              Logout
            </motion.button>
          </motion.div>
        ) : (
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
          </motion.a>
        )}

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-3 rounded-xl border border-green-500/30 bg-green-500/20 backdrop-blur-sm"
        >
          <motion.svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </motion.svg>
        </motion.button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-gray-900/90 backdrop-blur-md border-t border-green-500/20 rounded-b-2xl overflow-hidden"
        >
          <div className="px-6 py-4 space-y-2">
            {links.map(({ id, label, href }) => (
              <motion.div 
                key={id}
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Link
                  href={href}
                  className={`block py-3 px-4 rounded-lg ${
                    active === id 
                      ? 'text-green-400 bg-green-500/20' 
                      : 'text-white hover:text-green-400 hover:bg-green-500/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
            
            {/* Mobile auth buttons */}
            {user && (
              <div className="pt-2 border-t border-gray-700/50 space-y-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="block py-3 px-4 rounded-lg text-blue-400 hover:bg-blue-500/20"
                  >
                    Dashboard
                  </motion.div>
                </Link>
                
                <motion.button
                  whileHover={{ x: 10 }}
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 rounded-lg text-red-400 hover:bg-red-500/20"
                >
                  Logout
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

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
