"use client";

import { useEffect, useRef } from "react";

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	opacity: number;
	targetOpacity: number;
	life: number;
	maxLife: number;
	fadeDirection: "in" | "out";
	baseX: number;
	baseY: number;
	depth: number;
}

interface ParticlesProps {
	className?: string;
	particleCount?: number;
	particleColor?: string;
	particleSize?: number;
	speed?: number;
	enableMouseFollow?: boolean;
	parallaxStrength?: number;
}

export default function Particles({
	className = "",
	particleCount = 50,
	particleColor = "#ffffff",
	particleSize = 2,
	speed = 0.5,
	enableMouseFollow = true,
	parallaxStrength = 0.02,
}: ParticlesProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const scrollRef = useRef<number>(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}

		// Get computed color if using currentColor
		const getActualColor = () => {
			if (particleColor === "currentColor") {
				const computedStyle = window.getComputedStyle(canvas);
				return computedStyle.color;
			}
			return particleColor;
		};

		// Detect if we're in dark mode
		const isDarkMode = () => {
			return document.documentElement.classList.contains("dark");
		};

		const resizeCanvas = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
		};

		const createParticle = (): Particle => {
			const targetOpacity = Math.random() * 0.5 + 0.2;
			const maxLife = Math.random() * 300 + 200; // 200-500 frames
			const baseX = Math.random() * canvas.width;
			const baseY = Math.random() * canvas.height;
			const depth = Math.random() * 0.8 + 0.2; // 0.2 to 1.0 depth layers
			return {
				x: baseX,
				y: baseY,
				baseX,
				baseY,
				vx: (Math.random() - 0.5) * speed,
				vy: (Math.random() - 0.5) * speed,
				size: Math.random() * particleSize + 1,
				opacity: 0,
				targetOpacity,
				life: 0,
				maxLife,
				fadeDirection: "in",
				depth,
			};
		};

		const createParticles = () => {
			particlesRef.current = [];
			for (let i = 0; i < particleCount; i++) {
				const particle = createParticle();
				// Stagger initial appearances
				particle.life = Math.random() * particle.maxLife * 0.5;
				if (particle.life > particle.maxLife * 0.3) {
					particle.opacity = particle.targetOpacity;
					particle.fadeDirection = "out";
				}
				particlesRef.current.push(particle);
			}
		};

		const updateParticles = () => {
			particlesRef.current.forEach((particle, index) => {
				// Update base position
				particle.baseX += particle.vx;
				particle.baseY += particle.vy;

				if (particle.baseX < 0 || particle.baseX > canvas.width) {
					particle.vx *= -1;
				}
				if (particle.baseY < 0 || particle.baseY > canvas.height) {
					particle.vy *= -1;
				}

				// Keep base particles within bounds
				particle.baseX = Math.max(0, Math.min(canvas.width, particle.baseX));
				particle.baseY = Math.max(0, Math.min(canvas.height, particle.baseY));

				// Apply parallax effect based on mouse position and scroll position
				if (enableMouseFollow) {
					const parallaxX =
						(mouseRef.current.x - canvas.width / 2) *
						parallaxStrength *
						particle.depth;
					const parallaxY =
						(mouseRef.current.y - canvas.height / 2) *
						parallaxStrength *
						particle.depth;

					// Add scroll-based parallax (different layers move at different speeds)
					// Negative value so particles move up when scrolling down (natural parallax)
					const scrollParallaxY =
						-scrollRef.current * parallaxStrength * particle.depth * 0.5;

					particle.x = particle.baseX + parallaxX;
					particle.y = particle.baseY + parallaxY + scrollParallaxY;
				} else {
					particle.x = particle.baseX;
					particle.y = particle.baseY;
				}

				// Update lifecycle
				particle.life++;

				// Handle fading
				if (particle.fadeDirection === "in") {
					// Fade in phase
					const fadeProgress = Math.min(
						particle.life / (particle.maxLife * 0.2),
						1,
					);
					particle.opacity = fadeProgress * particle.targetOpacity;

					// Switch to fade out when reaching 70% of max life
					if (particle.life > particle.maxLife * 0.7) {
						particle.fadeDirection = "out";
					}
				} else {
					// Fade out phase
					const fadeOutStart = particle.maxLife * 0.7;
					const fadeProgress = Math.max(
						0,
						1 - (particle.life - fadeOutStart) / (particle.maxLife * 0.3),
					);
					particle.opacity = fadeProgress * particle.targetOpacity;
				}

				// Respawn particle when it dies
				if (particle.life >= particle.maxLife) {
					const newParticle = createParticle();
					particlesRef.current[index] = newParticle;
				}
			});
		};

		const drawParticles = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const actualColor = getActualColor();

			particlesRef.current.forEach((particle) => {
				ctx.save();
				ctx.globalAlpha = particle.opacity;
				ctx.fillStyle = actualColor;
				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			});

			// Draw connections between nearby particles
			particlesRef.current.forEach((particle, i) => {
				particlesRef.current.slice(i + 1).forEach((otherParticle) => {
					const dx = particle.x - otherParticle.x;
					const dy = particle.y - otherParticle.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < 100) {
						ctx.save();
						// More prominent in dark mode, subtle in light mode
						const baseOpacity = isDarkMode() ? 0.4 : 0.25;
						const lineWidth = isDarkMode() ? 1.0 : 0.8;
						ctx.globalAlpha = (1 - distance / 100) * baseOpacity;
						ctx.strokeStyle = actualColor;
						ctx.lineWidth = lineWidth;
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(otherParticle.x, otherParticle.y);
						ctx.stroke();
						ctx.restore();
					}
				});
			});
		};

		const animate = () => {
			updateParticles();
			drawParticles();
			animationRef.current = requestAnimationFrame(animate);
		};

		resizeCanvas();
		createParticles();
		animate();

		const handleResize = () => {
			resizeCanvas();
			createParticles();
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (enableMouseFollow) {
				// Use viewport coordinates since particles are fixed positioned
				mouseRef.current = {
					x: e.clientX,
					y: e.clientY,
				};
			}
		};

		const handleScroll = () => {
			if (enableMouseFollow) {
				scrollRef.current = window.scrollY;
			}
		};

		window.addEventListener("resize", handleResize);
		if (enableMouseFollow) {
			// Add mouse listener to document since particles are in a fixed container
			document.addEventListener("mousemove", handleMouseMove);
			// Add scroll listener for scroll-based parallax
			window.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			window.removeEventListener("resize", handleResize);
			if (enableMouseFollow) {
				document.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("scroll", handleScroll);
			}
		};
	}, [
		particleCount,
		particleColor,
		particleSize,
		speed,
		enableMouseFollow,
		parallaxStrength,
	]);

	return (
		<canvas
			className={`absolute inset-0 h-full w-full ${className}`}
			ref={canvasRef}
			style={{ pointerEvents: "none" }}
		/>
	);
}
