'use client';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PaymentModal from './components/PaymentModal';

const heroSlides = [
    {
        headline: (
            <>
                Fitness <span className="text-green-500">Wonder.</span>
            </>
        ),
        desc: 'Unlock your potential with expert trainers, modern equipment, and a supportive community.',
        btn: 'Join Now',
        bg: '/img/bg.jpg',
        gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
        headline: (
            <>
                Push <span className="text-orange-500">Past Your Limits</span>
            </>
        ),
        desc: 'Every rep, every set, every drop of sweat brings you closer to your goals. Start your journey today.',
        btn: 'Start Training',
        bg: '/img/bg.jpg',
        gradient: 'from-orange-500/20 to-red-500/20'
    },
    {
        headline: (
            <>
                Set Your <span className="text-red-500">Heart Ablaze</span>
            </>
        ),
        desc: 'Ignite your passion for fitness and discover the strength within you. Your transformation starts here.',
        btn: 'Get Inspired',
        bg: '/img/bg.jpg',
        gradient: 'from-red-500/20 to-pink-500/20'
    },
];

const trainers = [
    {
        name: "DAVID WILLIAMS",
        role: "BODY BUILDER COACH",
        image: "/img/t4.webp",
        description: "David specializes in strength training and bodybuilding, helping clients achieve peak physical performance.",
        color: "from-blue-500 to-cyan-500"
    },
    {
        name: "ROSY RIVERA",
        role: "CARDIO SPECIALIST",
        image: "/img/t1.webp",
        description: "Rosy is passionate about cardio and endurance, inspiring clients to push their limits every session.",
        color: "from-pink-500 to-rose-500"
    },
    {
        name: "MATT STONIE",
        role: "FUNCTIONAL TRAINER",
        image: "/img/t2.webp",
        description: "Matt brings energy and creativity to functional training, making every workout dynamic and fun.",
        color: "from-purple-500 to-indigo-500"
    },
    {
        name: "SOFIA LAUREN",
        role: "HIIT SPECIALIST",
        image: "/img/t3.webp",
        description: "Sofia focuses on kettlebell and HIIT, motivating clients to reach their fitness goals with intensity.",
        color: "from-amber-500 to-orange-500"
    }
];

const membershipPlans = [
    {
        name: "STANDARD",
        price: 30,
        priceINR: 2499,
        color: "from-blue-500 to-blue-600",
        popular: false,
        features: [
            "Includes Membership",
            "Access To All Gym Facilities",
            "Diet Plan Included",
            "Health and Fitness Tips",
            "Monday-Friday Gym Access",
            "Full Access To Everything"
        ],
        notIncluded: ["No Additional Amenities"]
    },
    {
        name: "ULTIMATE",
        price: 45,
        priceINR: 3749,
        color: "from-green-500 to-green-600",
        popular: true,
        features: [
            "Includes Membership",
            "Access To All Gym Facilities",
            "Diet Plan Included",
            "Health and Fitness Tips",
            "Monday-Friday Gym Access",
            "Full Access To Everything",
            "Personal Trainer Sessions"
        ],
        notIncluded: []
    },
    {
        name: "PROFESSIONAL",
        price: 60,
        priceINR: 4999,
        color: "from-red-500 to-red-600",
        popular: false,
        features: [
            "Includes Membership",
            "Access To All Gym Facilities",
            "Diet Plan Included",
            "Health and Fitness Tips",
            "Monday-Friday Gym Access",
            "Full Access To Everything",
            "Personal Trainer Sessions",
            "Nutrition Consultation"
        ],
        notIncluded: []
    }
];

export default function Home() {
    const [slide, setSlide] = useState(0);
    const [particles, setParticles] = useState([]);
    const trainersRef = useRef(null);
    const membershipRef = useRef(null);
    const isTrainersInView = useInView(trainersRef, { once: true });
    const isMembershipInView = useInView(membershipRef, { once: true });
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Preload background images
    useEffect(() => {
        if (typeof window !== 'undefined') {
            heroSlides.forEach(slide => {
                const img = document.createElement('img');
                img.src = slide.bg;
                img.onload = () => console.log(`Loaded: ${slide.bg}`);
                img.onerror = () => console.error(`Failed to load: ${slide.bg}`);
            });
        }
    }, []);

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

    const goTo = (idx) => setSlide(idx);

    const slideVariants = {
        initial: { opacity: 0, x: -100, scale: 0.9 },
        animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
        exit: { opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.6, ease: 'easeIn' } },
    };

    return (
        <>
            <main className="bg-black">
                <Navbar />

                {/* Hero Section */}
                <section
                    id="home"
                    className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 overflow-hidden bg-gray-900"
                    style={{
                        backgroundImage: `url('${heroSlides[slide].bg}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    {/* Dynamic Overlay - Reduced opacity to show background */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50`}></div>
                    <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[slide].gradient}`}></div>

                    {/* Floating Particles */}
                    {particles.length > 0 && (
                        <div className="absolute inset-0">
                            {particles.map((particle, i) => (
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

                    {/* Left: Carousel Content */}
                    <div className="relative z-10 w-full md:w-1/2 max-w-2xl flex flex-col items-start justify-center py-24 md:py-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slide}
                                variants={slideVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="w-full"
                            >
                                <motion.h1 
                                    className="text-left text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    {heroSlides[slide].headline}
                                </motion.h1>
                                <motion.p 
                                    className="text-left text-lg sm:text-xl text-gray-200 mb-8 max-w-xl leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {heroSlides[slide].desc}
                                </motion.p>
                                <motion.a
                                    href="#trainers"
                                    className="inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-4 rounded-full font-bold shadow-lg transition-all duration-300 text-lg uppercase tracking-wide"
                                    whileHover={{ 
                                        scale: 1.05,
                                        boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {heroSlides[slide].btn}
                                </motion.a>
                            </motion.div>
                        </AnimatePresence>

                        {/* Enhanced Carousel Controls */}
                        <div className="flex gap-4 mt-12 justify-start">
                            {heroSlides.map((_, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => goTo(idx)}
                                    className={`relative w-12 h-2 rounded-full transition-all duration-500 ${
                                        slide === idx ? 'bg-green-500' : 'bg-white/30'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {slide === idx && (
                                        <motion.div
                                            className="absolute inset-0 bg-green-500 rounded-full"
                                            layoutId="activeSlide"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Right: 3D Floating Elements */}
                    <div className="hidden md:flex flex-1 justify-center items-center h-full relative z-10">
                        <motion.div
                            className="relative w-96 h-96"
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-xl"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Enhanced Trainers Section */}
                <section
                    id="trainers"
                    className="relative py-20 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden"
                >
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-blue-900/10" />
                        {particles.slice(0, 20).map((particle, i) => (
                            <motion.div
                                key={`trainer-${particle.id}`}
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
                            ref={trainersRef}
                            initial={{ opacity: 0, y: -50 }}
                            animate={isTrainersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <motion.span
                                className="text-green-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={isTrainersInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Meet Our Experts
                            </motion.span>
                            <motion.h2
                                className="text-5xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-green-200 to-green-500 bg-clip-text text-transparent"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={isTrainersInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                OUR TRAINERS
                            </motion.h2>
                            <motion.div
                                className="h-1 w-32 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"
                                initial={{ width: 0 }}
                                animate={isTrainersInView ? { width: "8rem" } : { width: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            />
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trainers.map((trainer, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50, rotateY: -15 }}
                                    animate={isTrainersInView ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 50, rotateY: -15 }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    whileHover={{
                                        scale: 1.05,
                                        rotateY: 10,
                                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                    }}
                                    className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm overflow-hidden group"
                                >
                                    {/* Glowing border effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${trainer.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`} />
                                    
                                    {/* Background pattern */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
                                    
                                    <div className="relative z-10">
                                        <motion.div
                                            className="relative mb-6 overflow-hidden rounded-xl"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Image
                                                src={trainer.image}
                                                alt={trainer.name}
                                                width={400}
                                                height={300}
                                                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                        </motion.div>
                                        
                                        <motion.h3
                                            className={`text-xl font-bold text-center mb-2 bg-gradient-to-r ${trainer.color} bg-clip-text text-transparent`}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {trainer.name}
                                        </motion.h3>
                                        
                                        <p className="text-green-400 text-xs tracking-widest mb-3 text-center uppercase">
                                            {trainer.role}
                                        </p>
                                        
                                        <p className="text-gray-300 text-center text-sm mb-4 leading-relaxed">
                                            {trainer.description}
                                        </p>
                                        
                                        <div className="flex gap-4 justify-center">
                                            {[
                                                { icon: "fab fa-facebook-f", color: "hover:text-blue-500" },
                                                { icon: "fab fa-twitter", color: "hover:text-sky-400" },
                                                { icon: "fab fa-instagram", color: "hover:text-pink-500" },
                                            ].map((social, idx) => (
                                                <motion.a
                                                    key={idx}
                                                    href="#"
                                                    className={`text-gray-400 ${social.color} transition-colors duration-300 text-lg`}
                                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <i className={social.icon}></i>
                                                </motion.a>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Enhanced Membership Section */}
                <section
                    id="membership"
                    className="relative py-20 bg-gradient-to-br from-gray-900 via-black to-red-900/20 overflow-hidden"
                >
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        {particles.slice(20, 40).map((particle, i) => (
                            <motion.div
                                key={`membership-${particle.id}`}
                                className="absolute w-1 h-1 bg-red-500/30 rounded-full"
                                style={{
                                    left: `${particle.left}%`,
                                    top: `${particle.top}%`,
                                }}
                                animate={{
                                    x: [0, 100, 0],
                                    y: [0, -100, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 8 + particle.delay,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: particle.delay,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4">
                        <motion.div
                            ref={membershipRef}
                            initial={{ opacity: 0, y: -50 }}
                            animate={isMembershipInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <motion.span
                                className="text-red-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={isMembershipInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Choose Your Plan
                            </motion.span>
                            <motion.h2
                                className="text-5xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={isMembershipInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                MEMBERSHIP
                            </motion.h2>
                            <motion.div
                                className="h-1 w-32 bg-gradient-to-r from-red-400 to-red-600 mx-auto rounded-full"
                                initial={{ width: 0 }}
                                animate={isMembershipInView ? { width: "8rem" } : { width: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {membershipPlans.map((plan, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={isMembershipInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                    }}
                                    className={`relative bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-2xl p-8 border backdrop-blur-sm overflow-hidden group ${
                                        plan.popular ? 'border-green-500 ring-2 ring-green-500/30' : 'border-gray-700/50'
                                    }`}
                                >
                                    {/* Popular badge */}
                                    {plan.popular && (
                                        <motion.div
                                            className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-1 rounded-full text-sm font-bold"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            MOST POPULAR
                                        </motion.div>
                                    )}

                                    {/* Glowing effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />

                                    <div className="relative z-10">
                                        <motion.h3
                                            className={`text-2xl font-bold mb-6 text-center bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {plan.name}
                                        </motion.h3>

                                        <motion.div
                                            className="text-center mb-8"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <span className={`text-5xl font-extrabold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                                                ₹{plan.priceINR}
                                            </span>
                                            <span className="text-xl text-gray-400 font-semibold ml-2">/month</span>
                                        </motion.div>

                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    className="flex items-center text-white text-sm"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={isMembershipInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                                    transition={{ delay: index * 0.1 + idx * 0.05 }}
                                                >
                                                    <i className={`fas fa-check text-green-500 mr-3 text-sm`}></i>
                                                    {feature}
                                                </motion.li>
                                            ))}
                                            {plan.notIncluded.map((feature, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    className="flex items-center text-gray-500 text-sm"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={isMembershipInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                                    transition={{ delay: index * 0.1 + (plan.features.length + idx) * 0.05 }}
                                                >
                                                    <i className="fas fa-times text-red-500 mr-3 text-sm"></i>
                                                    {feature}
                                                </motion.li>
                                            ))}
                                        </ul>

                                        <motion.button
                                            onClick={() => {
                                                setSelectedPlan(plan);
                                                setShowPaymentModal(true);
                                            }}
                                            className={`w-full block text-center bg-gradient-to-r ${plan.color} hover:shadow-lg text-white py-4 px-8 rounded-full font-bold transition-all duration-300 text-lg uppercase tracking-wide`}
                                            whileHover={{ 
                                                scale: 1.05,
                                                boxShadow: "0 0 30px rgba(255,255,255,0.3)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            JOIN NOW - ₹{plan.priceINR.toLocaleString()}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Sign In Link for existing members */}
                        <motion.div
                            className="text-center mt-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isMembershipInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: 0.8 }}
                        >
                            <p className="text-gray-400 text-lg mb-4">
                                Already have a membership?
                            </p>
                            <motion.a
                                href="/login"
                                className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 font-semibold text-lg transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <i className="fas fa-sign-in-alt"></i>
                                <span>Sign In to Your Account</span>
                            </motion.a>
                        </motion.div>
                    </div>
                </section>

                {/* Payment Modal */}
                {selectedPlan && (
                    <PaymentModal
                        isOpen={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        plan={selectedPlan.name}
                        price={selectedPlan.priceINR}
                    />
                )}
            </main>
            <Footer />
        </>
    );
}
