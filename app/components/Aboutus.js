"use client";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";

export default function Aboutus() {
    const [particles, setParticles] = useState([]);
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true });

    // Generate particles only on client side
    useEffect(() => {
        const generatedParticles = [...Array(25)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 2,
        }));
        setParticles(generatedParticles);
    }, []);

    return (
        <>
            <Navbar />
            <section className="min-h-screen bg-black text-white relative overflow-hidden pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-red-900/20" />
                
                {/* Floating Particles */}
                {particles.length > 0 && (
                    <div className="absolute inset-0">
                        {particles.map((particle, i) => (
                            <motion.div
                                key={particle.id}
                                className="absolute w-1 h-1 bg-red-500/40 rounded-full"
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

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-4 py-20">
                    {/* Header Section */}
                    <motion.div
                        ref={headerRef}
                        initial={{ opacity: 0, y: -100 }}
                        animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
                        transition={{ duration: 1, type: "spring", stiffness: 100 }}
                        className="text-center mb-16"
                    >
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-red-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
                        >
                            Who We Are
                        </motion.span>
                        
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
                            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent"
                        >
                            ABOUT US
                        </motion.h1>
                        
                        <motion.div
                            initial={{ width: 0 }}
                            animate={isHeaderInView ? { width: "120px" } : { width: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="h-1 bg-gradient-to-r from-red-400 to-red-600 mx-auto mb-6 rounded-full"
                        />
                    </motion.div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
                        {/* Left: Image */}
                        <motion.div
                            initial={{ x: -100, opacity: 0, rotateY: -15 }}
                            animate={{ x: 0, opacity: 1, rotateY: 0 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="relative"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, rotateY: 5 }}
                                className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(17, 24, 39, 0.9) 100%)',
                                }}
                            >
                                <Image
                                    src="/img/a.jpg"
                                    alt="GymX Trainer"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-red-900/20" />
                                
                                {/* Glowing border effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-30 blur-sm" />
                            </motion.div>
                        </motion.div>

                        {/* Right: Content */}
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="flex flex-col justify-center space-y-8"
                        >
                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                                className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                            >
                                GYM THAT PUSH YOU TO YOUR LIMITS
                            </motion.h2>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4, duration: 0.8 }}
                                className="text-gray-300 text-lg leading-relaxed"
                            >
                                Welcome to <span className="text-red-500 font-bold">GymX</span>, where fitness is our passion and helping people is our mission! If you're searching for the best gym near you, look no further. Founded by dedicated Aeronautical engineers, we aim to make a positive impact on lives by celebrating fitness and empowering healthier lifestyles.
                            </motion.p>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.6, duration: 0.8 }}
                                className="text-gray-400 leading-relaxed"
                            >
                                With <span className="text-red-500 font-bold">10+ years</span> of experience, thousands of satisfied customers, and multiple branches since 2014, GymX is transforming lives through tailored fitness programs and countless success stories.
                            </motion.p>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.8, duration: 0.8 }}
                                className="text-gray-400 leading-relaxed"
                            >
                                At GymX, we believe in <span className="text-red-400 font-semibold">pushing limits</span>, breaking barriers, and achieving the extraordinary. Join us and be a part of our fitness revolution.
                            </motion.p>
                            
                            <motion.button
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2, duration: 0.8 }}
                                whileHover={{ 
                                    scale: 1.05, 
                                    boxShadow: "0 0 30px rgba(220, 38, 38, 0.5)",
                                    background: "linear-gradient(45deg, #dc2626, #ea580c)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="w-fit bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg text-lg uppercase tracking-wide cursor-pointer"
                            >
                                BUY MEMBERSHIP
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Stats Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
                    >
                        {[
                            { number: "10+", label: "Years Experience" },
                            { number: "5000+", label: "Happy Members" },
                            { number: "50+", label: "Expert Trainers" },
                            { number: "15+", label: "Locations" }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 2.4 + index * 0.1, duration: 0.6 }}
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-6 bg-gradient-to-br from-red-900/20 to-gray-900/40 rounded-xl border border-red-800/30 backdrop-blur-sm"
                            >
                                <div className="text-3xl font-bold text-red-500 mb-2">{stat.number}</div>
                                <div className="text-gray-400 text-sm uppercase tracking-wide">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </>
    );
}