'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function GetInspired() {
    // Custom styles for gradient circles
    const circleGradients = {
        "stop-from-red-500": { stopColor: "#ef4444" },
        "stop-to-red-600": { stopColor: "#dc2626" },
        "stop-from-blue-500": { stopColor: "#3b82f6" },
        "stop-to-blue-600": { stopColor: "#2563eb" },
        "stop-from-green-500": { stopColor: "#22c55e" },
        "stop-to-green-600": { stopColor: "#16a34a" },
        "stop-from-purple-500": { stopColor: "#a855f7" },
        "stop-to-purple-600": { stopColor: "#9333ea" },
    };
    const [quotes, setQuotes] = useState([
        {
            text: "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward.",
            image: "/img/bg.jpg"
        },
        {
            text: "If you don't take risks, you can't create a future!",
            image: "/img/bg.jpg"
        },
        {
            text: "You need to accept the fact that you're not the best and have all the will to strive to be better than anyone you face.",
            image: "/img/bg.jpg"
        }
    ]);
    
    const [activeQuote, setActiveQuote] = useState(0);
    const [particles, setParticles] = useState([]);
    const storiesRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [quotes.length]);

    useEffect(() => {
        const generatedParticles = [...Array(50)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 3,
            size: Math.random() * 3 + 1,
        }));
        setParticles(generatedParticles);
    }, []);

    const successStories = [
        {
            name: "Michael R.",
            age: 34,
            achievement: "Lost 30kg in 8 months",
            quote: "When I first joined BuildupX, I couldn't even run for 5 minutes. Now I'm training for my first marathon!",
            color: "from-blue-500 to-cyan-500"
        },
        {
            name: "Sarah J.",
            age: 28,
            achievement: "Overcame chronic back pain",
            quote: "The trainers here understood my limitations and designed a program that strengthened my core. I'm now pain-free for the first time in years.",
            color: "from-pink-500 to-rose-500"
        },
        {
            name: "David T.",
            age: 42,
            achievement: "Gained 15kg of muscle",
            quote: "I was always the skinny guy. The nutrition advice and personalized training at BuildupX transformed not just my body, but my confidence.",
            color: "from-green-500 to-emerald-500"
        }
    ];

    const fadeInUp = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    return (
        <>
            <main className="bg-black min-h-screen">
                <Navbar />

                {/* Hero Section with Inspirational Quotes */}
                <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900 pt-24">
                    {/* Dynamic Background */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                        style={{
                            backgroundImage: `url('${quotes[activeQuote].image}')`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60"></div>
                    </div>

                    {/* Floating Particles */}
                    {particles.length > 0 && (
                        <div className="absolute inset-0">
                            {particles.map((particle) => (
                                <motion.div
                                    key={particle.id}
                                    className="absolute bg-white/20 rounded-full"
                                    style={{
                                        width: `${particle.size}px`,
                                        height: `${particle.size}px`,
                                        left: `${particle.left}%`,
                                        top: `${particle.top}%`,
                                    }}
                                    animate={{
                                        y: [0, -100, 0],
                                        opacity: [0, 1, 0],
                                        scale: [1, 1.5, 1],
                                    }}
                                    transition={{
                                        duration: 4 + particle.delay,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: particle.delay,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Quote Content */}
                    <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                        <motion.div
                            key={activeQuote}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.8 }}
                            className="p-6"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-8"
                            >
                                <i className="fas fa-quote-left text-green-500 text-6xl opacity-50"></i>
                            </motion.div>
                            
                            <motion.h1 
                                className="text-3xl md:text-5xl font-bold mb-8 text-white leading-tight"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                {quotes[activeQuote].text}
                            </motion.h1>
                            
                            <motion.div
                                className="h-2 w-32 bg-gradient-to-r from-green-400 to-green-600 mx-auto mt-8 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "8rem" }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="mt-8"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="w-32 h-1 bg-green-500 mb-6"></div>
                                    <span className="inline-block bg-green-500 text-white px-12 py-5 rounded-full font-bold shadow-lg text-lg uppercase tracking-wide">
                                        ACHIEVE GREATNESS
                                    </span>
                                </div>
                            </motion.div>
                            
                            {/* 3D Floating Element with BuildupX Logo */}
                            <div className="relative h-60 w-full max-w-md mx-auto mt-16">
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{ 
                                        rotateY: [0, 360],
                                        rotateX: [0, 15, 0, -15, 0],
                                    }}
                                    transition={{ 
                                        rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                                        rotateX: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                >
                                    {/* The circular green glow effect from the image */}
                                    <div className="relative h-52 w-52">
                                        {/* Outer glow */}
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10"
                                            style={{ transform: 'scale(1.2)' }}
                                        />
                                        
                                        {/* The two green circular borders that rotate */}
                                        <motion.div 
                                            className="absolute inset-0 rounded-full border-2 border-green-500/70"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        />
                                        <motion.div 
                                            className="absolute inset-0 rounded-full border-2 border-blue-400/40"
                                            style={{ transform: 'scale(1.1)' }}
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        />
                                        
                                        {/* The BuildupX Logo with black circular brush background */}
                                        <motion.div 
                                            className="absolute inset-0 flex items-center justify-center"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            {/* Black circular background that fits inside the glowing border */}
                                            <div className="relative w-[90%] h-[90%] mx-auto">
                                                {/* Black circle background */}
                                                <div className="absolute inset-0 rounded-full bg-black border border-white/20"></div>
                                                
                                                {/* Gold BuildupX Logo Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                                    {/* Gold Dumbbell with arm icon */}
                                                    <div className="w-16 h-14 mb-1 relative">
                                                        <div className="absolute left-0 top-2 w-4 h-8 bg-yellow-500 rounded-sm"></div>
                                                        <div className="absolute right-0 top-2 w-4 h-8 bg-yellow-500 rounded-sm"></div>
                                                        <div className="absolute left-4 top-5 right-4 h-2 bg-yellow-500"></div>
                                                        <div className="absolute top-0 left-7 text-black text-xs font-bold">+</div>
                                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-6">
                                                            <div className="w-5 h-4 bg-yellow-500 rounded-full"></div>
                                                            <div className="w-1.5 h-2 bg-yellow-500 mx-auto"></div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* BUILDUP X text */}
                                                    <div className="text-center mt-1">
                                                        <div className="text-2xl font-extrabold tracking-wide text-yellow-500">BUILDUP X</div>
                                                        <div className="text-[9px] tracking-wider text-yellow-500 mt-0.5">push past your limits</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                        
                        {/* Quote Navigator - Bottom Dots */}
                        <div className="flex justify-center gap-4 mt-16">
                            {quotes.map((_, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => setActiveQuote(idx)}
                                    className={`relative w-4 h-4 rounded-full transition-all duration-500 ${
                                        activeQuote === idx ? 'bg-green-500' : 'bg-gray-500/50'
                                    }`}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {activeQuote === idx && (
                                        <motion.div
                                            className="absolute inset-0 bg-green-500 rounded-full"
                                            layoutId="activeQuote"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Success Stories Section */}
                <section id="stories" ref={storiesRef} className="relative py-24 pt-32 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-blue-900/10" />
                        {particles.slice(0, 20).map((particle) => (
                            <motion.div
                                key={`story-${particle.id}`}
                                className="absolute w-1 h-1 bg-green-500/30 rounded-full"
                                style={{
                                    left: `${particle.left}%`,
                                    top: `${particle.top}%`,
                                }}
                                animate={{
                                    y: [0, -50, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 6 + particle.delay,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: particle.delay,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4">
                        <motion.div
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <motion.span
                                className="text-green-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Real Results
                            </motion.span>
                            <motion.h2
                                className="text-5xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-green-200 to-green-500 bg-clip-text text-transparent"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                SUCCESS STORIES
                            </motion.h2>
                            <motion.div
                                className="h-1 w-32 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: "8rem" }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            />
                            <motion.p
                                className="text-gray-300 max-w-3xl mx-auto mt-6 text-lg"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                            >
                                Real people, real transformations. These members put in the work and achieved incredible results.
                                Their journeys inspire us every day.
                            </motion.p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {successStories.map((story, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    whileHover={{
                                        scale: 1.03,
                                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                    }}
                                    className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm overflow-hidden group"
                                >
                                    {/* Glowing border effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${story.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`} />
                                    
                                    <div className="relative z-10">
                                        <motion.div
                                            className="mb-6"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="mb-6 rounded-lg overflow-hidden">
                                                <div className="h-2 w-32 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-4 rounded-full"/>
                                            </div>
                                            
                                            <motion.h3
                                                className={`text-2xl font-bold mb-1 bg-gradient-to-r ${story.color} bg-clip-text text-transparent`}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {story.name}, {story.age}
                                            </motion.h3>
                                            
                                            <p className="text-white font-semibold mb-4">
                                                {story.achievement}
                                            </p>
                                            
                                            <div className="relative mb-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700/30">
                                                <div className="absolute -top-3 -left-2 text-green-500 text-4xl opacity-40">
                                                    <i className="fas fa-quote-left"></i>
                                                </div>
                                                <p className="text-gray-300 italic text-sm leading-relaxed">
                                                    {story.quote}
                                                </p>
                                            </div>
                                            
                                            <motion.div
                                                className={`w-full text-center bg-gradient-to-r ${story.color} opacity-80 text-white py-3 px-6 rounded-lg font-bold text-sm`}
                                            >
                                                TRANSFORMATION COMPLETE
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                                {/* Animated Progress Stats */}
                        <motion.div
                            className="mt-16 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h3 className="text-3xl font-bold text-white mb-12">YOUR POTENTIAL</h3>
                            <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
                                {[
                                    { label: "STRENGTH", percent: 95, color: "from-red-500 to-red-600" },
                                    { label: "ENDURANCE", percent: 85, color: "from-blue-500 to-blue-600" },
                                    { label: "DISCIPLINE", percent: 90, color: "from-green-500 to-green-600" },
                                    { label: "WILLPOWER", percent: 100, color: "from-purple-500 to-purple-600" }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="relative w-44 h-44"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            {/* Background Circle */}
                                            <circle 
                                                cx="50" 
                                                cy="50" 
                                                r="40" 
                                                fill="none" 
                                                stroke="#2A2A2A" 
                                                strokeWidth="8"
                                            />
                                            
                                            {/* Animated Progress Circle */}
                                            <motion.circle 
                                                cx="50" 
                                                cy="50" 
                                                r="40" 
                                                fill="none" 
                                                stroke={`url(#gradient-${index})`}
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray="251.2"
                                                strokeDashoffset="251.2"
                                                initial={{ strokeDashoffset: 251.2 }}
                                                whileInView={{ 
                                                    strokeDashoffset: 251.2 - (251.2 * stat.percent / 100) 
                                                }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 2, delay: index * 0.2 }}
                                                transform="rotate(-90 50 50)"
                                            />
                                            
                                            {/* Gradient Definition */}
                                            <defs>
                                                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" style={circleGradients[`stop-${stat.color.split(' ')[0]}`]} />
                                                    <stop offset="100%" style={circleGradients[`stop-${stat.color.split(' ')[2]}`]} />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        
                                        {/* Text in middle */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.div 
                                                className="text-3xl font-bold text-white"
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.2 + 1.5 }}
                                            >
                                                {stat.percent}%
                                            </motion.div>
                                            <motion.div 
                                                className="text-xs font-bold tracking-wider text-gray-400 mt-1"
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.2 + 1.7 }}
                                            >
                                                {stat.label}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Motivational Tips Section */}
                <section className="relative py-24 pt-32 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
                    <div className="relative z-10 max-w-7xl mx-auto px-4">
                        <motion.div
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <motion.span
                                className="text-blue-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Stay Motivated
                            </motion.span>
                            <motion.h2
                                className="text-5xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-transparent"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                DAILY MOTIVATION
                            </motion.h2>
                            <motion.div
                                className="h-1 w-32 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: "8rem" }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Set Realistic Goals",
                                    icon: "fas fa-bullseye",
                                    description: "Break your fitness journey into small, achievable milestones. Celebrate each victory, no matter how small.",
                                    color: "from-blue-500 to-blue-600"
                                },
                                {
                                    title: "Find Your Why",
                                    icon: "fas fa-heart",
                                    description: "Connect to the deeper reason behind your fitness journey. When motivation wanes, your 'why' will keep you going.",
                                    color: "from-green-500 to-green-600"
                                },
                                {
                                    title: "Track Progress",
                                    icon: "fas fa-chart-line",
                                    description: "Keep a fitness journal or use an app to log workouts, measurements, and how you feel. Seeing progress is motivating.",
                                    color: "from-purple-500 to-purple-600"
                                },
                                {
                                    title: "Mix It Up",
                                    icon: "fas fa-random",
                                    description: "Try different workouts to keep things fresh and challenge your body in new ways.",
                                    color: "from-red-500 to-red-600"
                                },
                                {
                                    title: "Rest & Recover",
                                    icon: "fas fa-bed",
                                    description: "Give your body time to heal between workouts. Quality sleep and recovery are essential for growth.",
                                    color: "from-amber-500 to-amber-600"
                                },
                                {
                                    title: "Community Support",
                                    icon: "fas fa-users",
                                    description: "Surround yourself with supportive people who share your fitness goals and values.",
                                    color: "from-pink-500 to-pink-600"
                                }
                            ].map((tip, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                                >
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${tip.color} mb-6 shadow-lg`}>
                                        <i className={`${tip.icon} text-white text-2xl`}></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{tip.title}</h3>
                                    <p className="text-gray-300 leading-relaxed">{tip.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-24 pt-32 overflow-hidden bg-gradient-to-r from-green-900/20 via-black to-blue-900/20">
                    <div className="absolute inset-0">
                        {particles.slice(30, 40).map((particle) => (
                            <motion.div
                                key={`cta-${particle.id}`}
                                className="absolute w-2 h-2 bg-green-500/20 rounded-full"
                                style={{
                                    left: `${particle.left}%`,
                                    top: `${particle.top}%`,
                                }}
                                animate={{
                                    y: [0, -200, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 10 + particle.delay,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: particle.delay,
                                }}
                            />
                        ))}
                    </div>
                    
                    <div className="relative z-10 max-w-5xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white leading-tight">
                                The Path to <span className="text-green-500">Greatness</span>
                            </h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                                &ldquo;It&apos;s not about having time, it&apos;s about making time. If you want it, you&apos;ll make time.&rdquo;
                            </p>
                        </motion.div>

                        {/* Animated Timeline */}
                        <div className="relative pb-12">
                            {/* Vertical Line */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>

                            {/* Timeline Items */}
                            {[
                                { day: "DAY 1", title: "Begin", description: "Take the first step of your journey" },
                                { day: "DAY 30", title: "Adapt", description: "Feel your body changing, embrace the pain" },
                                { day: "DAY 90", title: "Transform", description: "See visible results, gain momentum" },
                                { day: "DAY 180", title: "Inspire", description: "Become an inspiration to others" },
                                { day: "DAY 365", title: "Transcend", description: "Evolve beyond your former limitations" }
                            ].map((item, index) => (
                                <motion.div 
                                    key={index}
                                    className={`flex items-center mb-12 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    {/* Content */}
                                    <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                                        <div className="text-sm font-bold tracking-wider text-green-500 mb-1">{item.day}</div>
                                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                        <p className="text-gray-400">{item.description}</p>
                                    </div>

                                    {/* Center Dot */}
                                    <div className="w-2/12 relative flex justify-center">
                                        <motion.div
                                            className="w-6 h-6 rounded-full bg-white border-4 border-green-500 z-10"
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.3, type: "spring" }}
                                        />
                                        <motion.div
                                            className="absolute w-12 h-12 rounded-full bg-green-500/20"
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: [0, 1.5, 1] }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                        />
                                    </div>

                                    {/* Empty Space for Alternating Layout */}
                                    <div className="w-5/12"></div>
                                </motion.div>
                            ))}

                            {/* Final Element */}
                            <motion.div
                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                                    <i className="fas fa-infinity text-white"></i>
                                </div>
                            </motion.div>
                        </div>

                        {/* Final Quote */}
                        <motion.div 
                            className="text-center mt-16"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 1 }}
                        >
                            <div className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-full font-bold shadow-lg text-lg uppercase tracking-wide">
                                Plus Ultra
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
