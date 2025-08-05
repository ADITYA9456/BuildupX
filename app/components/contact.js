"use client";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        website: '',
        comment: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [particles, setParticles] = useState([]);
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true });

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSubmitStatus({ success: true, message: 'Message sent successfully!' });
                // Reset form after successful submission
                setFormData({
                    name: '',
                    email: '',
                    website: '',
                    comment: ''
                });
            } else {
                setSubmitStatus({ success: false, message: data.message || 'Failed to send message. Please try again.' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus({ success: false, message: 'Failed to send message. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <section className="min-h-screen bg-black text-white relative overflow-hidden pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-orange-900/20" />
                
                {/* Floating Particles */}
                {particles.length > 0 && (
                    <div className="absolute inset-0">
                        {particles.map((particle, i) => (
                            <motion.div
                                key={particle.id}
                                className="absolute w-1 h-1 bg-orange-500/40 rounded-full"
                                animate={{
                                    x: [0, 120, 0],
                                    y: [0, -100, 0],
                                    opacity: [0, 1, 0],
                                    scale: [1, 1.8, 1],
                                }}
                                transition={{
                                    duration: 6 + particle.delay,
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
                            className="text-orange-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
                        >
                            Get in Touch
                        </motion.span>
                        
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
                            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent"
                        >
                            CONTACT US
                        </motion.h1>
                        
                        <motion.div
                            initial={{ width: 0 }}
                            animate={isHeaderInView ? { width: "120px" } : { width: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mb-6 rounded-full"
                        />
                        
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="text-gray-300 text-lg max-w-2xl mx-auto"
                        >
                            We will respond to your query on priority. Let's start your fitness journey together!
                        </motion.p>
                    </motion.div>

                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            whileHover={{ 
                                scale: 1.02, 
                                boxShadow: "0 25px 50px rgba(249, 115, 22, 0.3)",
                                rotateY: 5 
                            }}
                            className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-2xl p-8 border border-orange-800/30 backdrop-blur-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl w-16 h-16 flex items-center justify-center shadow-lg mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Location</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    No 90/4, ORR Munnekolala, Opp Innovative Multiplex,<br />
                                    Bangalore, 560037
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            whileHover={{ 
                                scale: 1.02, 
                                boxShadow: "0 25px 50px rgba(249, 115, 22, 0.3)",
                                rotateY: -5 
                            }}
                            className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-2xl p-8 border border-orange-800/30 backdrop-blur-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl w-16 h-16 flex items-center justify-center shadow-lg mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Drop Us a Line</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    gymx.bauenad@gmail.com
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-8 border border-orange-800/30 backdrop-blur-sm mb-16"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.6, duration: 0.6 }}
                                >
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.7, duration: 0.6 }}
                                >
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Your Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                                    />
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.8, duration: 0.6 }}
                            >
                                <input
                                    type="text"
                                    name="website"
                                    placeholder="Your Subject (Optional)"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                                /> 
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.9, duration: 0.6 }}
                            >
                                <textarea
                                    name="comment"
                                    placeholder="Your Message"
                                    value={formData.comment}
                                    onChange={handleChange}
                                    rows={6}
                                    required
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-all duration-300 resize-none backdrop-blur-sm"
                                />
                            </motion.div>
                            <motion.button
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2, duration: 0.6 }}
                                whileHover={{ 
                                    scale: isSubmitting ? 1 : 1.02,
                                    boxShadow: isSubmitting ? "none" : "0 0 30px rgba(249, 115, 22, 0.5)",
                                    background: isSubmitting ? "linear-gradient(45deg, #ea580c, #f97316)" : "linear-gradient(45deg, #ea580c, #f97316)"
                                }}
                                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-gradient-to-r ${isSubmitting ? 'from-gray-500 to-gray-600' : 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'} text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 text-lg uppercase tracking-wide ${isSubmitting ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        SENDING...
                                    </div>
                                ) : 'SEND MESSAGE'}
                            </motion.button>
                            
                            {/* Success/Error Message */}
                            {submitStatus && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 p-3 rounded-lg ${
                                        submitStatus.success 
                                            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                                    }`}
                                >
                                    {submitStatus.message}
                                </motion.div>
                            )}
                        </form>
                    </motion.div>

                    {/* Social Media with GIF Icons */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                        className="text-center"
                    >
                        <h3 className="text-2xl font-bold mb-8">Follow Us On Social Media</h3>
                        <div className="flex justify-center gap-8">
                            {[
                                { name: "facebook", href: "#" },
                                { name: "x", href: "#" },
                                { name: "insta", href: "#" }
                            ].map((social, index) => (
                                <motion.a
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 2.4 + index * 0.1, duration: 0.5 }}
                                    whileHover={{ 
                                        scale: 1.15, 
                                        rotateY: 10,
                                        boxShadow: "0 10px 30px rgba(249, 115, 22, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative flex items-center justify-center transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Glowing background effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150" />
                                    
                                    {/* Icon container */}
                                    <div className="relative z-10 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-800/50 to-gray-900/70 border border-orange-500/30 backdrop-blur-sm shadow-lg">
                                        <Image
                                            src={`/gif/${social.name}.gif`}
                                            alt={social.name}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 object-contain"
                                        />
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </>
    );
}