"use client";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const classesData = [
	{
		id: 1,
		title: "Pilates",
		icon: "🧘‍♀️",
		description:
			"Donec nec sapien in urna fermentum ornare. Morbi vel ultrices leo. Sed eu turpis eu arcu vehicula fringilla ut vitae orci.",
		color: "from-purple-500 to-pink-500",
		bgPattern:
			"bg-gradient-to-br from-purple-900/20 to-pink-900/20",
	},
	{
		id: 2,
		title: "Weight Lifting",
		icon: "🏋️‍♂️",
		description:
			"Donec nec sapien in urna fermentum ornare. Morbi vel ultrices leo. Sed eu turpis eu arcu vehicula fringilla ut vitae orci.",
		color: "from-red-500 to-orange-500",
		bgPattern:
			"bg-gradient-to-br from-red-900/20 to-orange-900/20",
	},
	{
		id: 3,
		title: "Nutrition",
		icon: "🥗",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at vulputate est. Donec tempor felis at nibh eleifend malesuada.",
		color: "from-green-500 to-emerald-500",
		bgPattern:
			"bg-gradient-to-br from-green-900/20 to-emerald-900/20",
	},
	{
		id: 4,
		title: "Bodybuilding",
		icon: "💪",
		description:
			"Donec nec sapien in urna fermentum ornare. Morbi vel ultrices leo. Sed eu turpis eu arcu vehicula fringilla ut vitae orci.",
		color: "from-blue-500 to-cyan-500",
		bgPattern:
			"bg-gradient-to-br from-blue-900/20 to-cyan-900/20",
	},
	{
		id: 5,
		title: "Fitness",
		icon: "⚽",
		description:
			"Vivamus libero mauris, bibendum eget sapien ac, ultrices rhoncus ipsum. Donec nec sapien in urna fermentum ornare.",
		color: "from-yellow-500 to-amber-500",
		bgPattern:
			"bg-gradient-to-br from-yellow-900/20 to-amber-900/20",
	},
	{
		id: 6,
		title: "Aerobics",
		icon: "🏃‍♀️",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at vulputate est. Donec tempor felis at nibh eleifend malesuada.",
		color: "from-indigo-500 to-purple-500",
		bgPattern:
			"bg-gradient-to-br from-indigo-900/20 to-purple-900/20",
	},
];

const ClassCard = ({ classItem, index }) => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 100, rotateX: 45 }}
			animate={
				isInView
					? { opacity: 1, y: 0, rotateX: 0 }
					: { opacity: 0, y: 100, rotateX: 45 }
			}
			transition={{
				duration: 0.8,
				delay: index * 0.15,
				type: "spring",
				stiffness: 100,
			}}
			whileHover={{
				scale: 1.05,
				rotateY: 5,
				boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
				transition: { duration: 0.3 },
			}}
			className={`relative overflow-hidden rounded-xl p-8 text-center shadow-2xl transition-all duration-500 border border-gray-700/50 ${classItem.bgPattern} backdrop-blur-sm`}
			style={{
				background: `linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)`,
			}}
		>
			{/* Animated Background Pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse" />
			</div>

			{/* Glowing Border Effect */}
			<div
				className={`absolute inset-0 rounded-xl bg-gradient-to-r ${classItem.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
			/>

			<motion.div
				initial={{ scale: 0, rotate: -180 }}
				animate={
					isInView
						? { scale: 1, rotate: 0 }
						: { scale: 0, rotate: -180 }
				}
				transition={{
					duration: 0.8,
					delay: index * 0.15 + 0.4,
					type: "spring",
					stiffness: 200,
				}}
				whileHover={{ scale: 1.2, rotate: 360 }}
				className="relative z-10 text-7xl mb-6 filter drop-shadow-2xl"
			>
				{classItem.icon}
			</motion.div>

			<motion.h3
				initial={{ opacity: 0, y: 20 }}
				animate={
					isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
				}
				transition={{ duration: 0.6, delay: index * 0.15 + 0.6 }}
				className={`text-3xl font-bold mb-4 bg-gradient-to-r ${classItem.color} bg-clip-text text-transparent relative z-10`}
			>
				{classItem.title}
			</motion.h3>

			<motion.div
				initial={{ width: 0 }}
				animate={
					isInView ? { width: "60px" } : { width: 0 }
				}
				transition={{
					duration: 0.8,
					delay: index * 0.15 + 0.8,
				}}
				className={`h-1 bg-gradient-to-r ${classItem.color} mx-auto mb-4 rounded-full`}
			/>

			<motion.p
				initial={{ opacity: 0, y: 20 }}
				animate={
					isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
				}
				transition={{ duration: 0.6, delay: index * 0.15 + 1 }}
				className="text-gray-300 leading-relaxed text-sm relative z-10"
			>
				{classItem.description}
			</motion.p>

			{/* Hover Effect Button */}
			<motion.button
				initial={{ opacity: 0, y: 20 }}
				animate={
					isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
				}
				transition={{ duration: 0.6, delay: index * 0.15 + 1.2 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				className={`mt-6 px-6 py-2 rounded-full text-white font-semibold bg-gradient-to-r ${classItem.color} hover:shadow-lg transition-all duration-300 relative z-10 cursor-pointer`}
			>
				Learn More
			</motion.button>
		</motion.div>
	);
};

export default function Classes() {
	const headerRef = useRef(null);
	const isHeaderInView = useInView(headerRef, { once: true });

	return (
		<>
			<Navbar />
			<section className="min-h-screen bg-black text-white relative overflow-hidden pt-20">
				{/* Animated Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

				{/* Floating Particles */}
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

				<div className="relative z-10 container mx-auto px-4 py-20">
					{/* Header Section */}
					<motion.div
						ref={headerRef}
						initial={{ opacity: 0, y: -100 }}
						animate={
							isHeaderInView
								? { opacity: 1, y: 0 }
								: { opacity: 0, y: -100 }
						}
						transition={{ duration: 1, type: "spring", stiffness: 100 }}
						className="text-center mb-20"
					>
						<motion.span
							initial={{ opacity: 0, scale: 0.5 }}
							animate={
								isHeaderInView
									? { opacity: 1, scale: 1 }
									: { opacity: 0, scale: 0.5 }
							}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="text-green-500 font-semibold tracking-widest mb-4 text-lg uppercase block"
						>
							Our Training Programs
						</motion.span>

						<motion.h1
							initial={{ opacity: 0, scale: 0.8 }}
							animate={
								isHeaderInView
									? { opacity: 1, scale: 1 }
									: { opacity: 0, scale: 0.8 }
							}
							transition={{
								duration: 1,
								delay: 0.4,
								type: "spring",
								stiffness: 100,
							}}
							className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-green-200 to-green-500 bg-clip-text text-transparent"
						>
							CLASSES
						</motion.h1>

						<motion.div
							initial={{ width: 0 }}
							animate={
								isHeaderInView
									? { width: "120px" }
									: { width: 0 }
							}
							transition={{ duration: 1, delay: 0.6 }}
							className="h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-6 rounded-full"
						/>

						<motion.p
							initial={{ opacity: 0, y: 30 }}
							animate={
								isHeaderInView
									? { opacity: 1, y: 0 }
									: { opacity: 0, y: 30 }
							}
							transition={{ duration: 0.8, delay: 0.8 }}
							className="text-gray-300 text-lg max-w-2xl mx-auto"
						>
							Transform your body and mind with our diverse range of
							professional fitness classes designed for all levels.
						</motion.p>
					</motion.div>

					{/* Classes Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
						{classesData.map((classItem, index) => (
							<ClassCard key={classItem.id} classItem={classItem} index={index} />
						))}
					</div>

					{/* Call to Action */}
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 2 }}
						className="text-center"
					>
						<Link href="/#membership" passHref>
							<motion.button
								whileHover={{
									scale: 1.05,
									boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
									background: "linear-gradient(45deg, #059669, #10b981)",
								}}
								whileTap={{ scale: 0.95 }}
								className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg text-lg uppercase tracking-wide border border-green-400 cursor-pointer"
							>
								Join Classes
							</motion.button>
						</Link>
					</motion.div>
				</div>
			</section>
			<Footer />
		</>
	);
}