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
	const lastFrameTimeRef = useRef<number>(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}

		// Respect user/device capabilities
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const isSmallScreen = window.innerWidth < 768;
		const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

		// On small screens, coarse pointers, or reduced motion, we render a
		// simplified, low-cost version (fewer particles, optionally no mouse-follow)
		const effectiveEnableMouseFollow =
			enableMouseFollow && !prefersReducedMotion && !isCoarsePointer;

		// Target a lower frame rate to reduce CPU/GPU load
		// 30fps on normal devices, 20fps when reduced motion is requested
		const targetFps = prefersReducedMotion ? 20 : 30;
		const frameInterval = 1000 / targetFps;

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

			// Fewer particles on small screens or when reduced motion is requested
			const effectiveCount =
				isSmallScreen || prefersReducedMotion
					? Math.max(10, Math.floor(particleCount * 0.4))
					: particleCount;

			for (let i = 0; i < effectiveCount; i++) {
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
				if (effectiveEnableMouseFollow) {
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
			// To avoid O(N^2) work being too heavy, we:
			// - use squared distance (no Math.sqrt in the hot path)
			// - cap the number of connections per particle
			const maxConnectionsPerParticle = 6;
			const maxDistance = 100;
			const maxDistanceSq = maxDistance * maxDistance;

			particlesRef.current.forEach((particle, i) => {
				let connections = 0;
				for (let j = i + 1; j < particlesRef.current.length; j++) {
					const otherParticle = particlesRef.current[j];
					const dx = particle.x - otherParticle.x;
					const dy = particle.y - otherParticle.y;
					const distanceSq = dx * dx + dy * dy;

					if (distanceSq < maxDistanceSq) {
						const distance = Math.sqrt(distanceSq);
						ctx.save();
						// More prominent in dark mode, subtle in light mode
						const baseOpacity = isDarkMode() ? 0.4 : 0.25;
						const lineWidth = isDarkMode() ? 1.0 : 0.8;
						ctx.globalAlpha = (1 - distance / maxDistance) * baseOpacity;
						ctx.strokeStyle = actualColor;
						ctx.lineWidth = lineWidth;
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(otherParticle.x, otherParticle.y);
						ctx.stroke();
						ctx.restore();

						connections++;
						if (connections >= maxConnectionsPerParticle) {
							break;
						}
					}
				}
			});
		};

		const animate = (time: number) => {
			// If user prefers reduced motion, we skip animation entirely.
			if (prefersReducedMotion) {
				return;
			}

			if (!lastFrameTimeRef.current) {
				lastFrameTimeRef.current = time;
			}

			const delta = time - lastFrameTimeRef.current;
			if (delta >= frameInterval) {
				lastFrameTimeRef.current = time;
				updateParticles();
				drawParticles();
			}

			animationRef.current = requestAnimationFrame(animate);
		};

		resizeCanvas();
		createParticles();

		// If reduced motion is enabled, draw a single static frame and skip RAF.
		if (prefersReducedMotion) {
			// Draw once for a subtle, non-animated background.
			const drawOnce = () => {
				// Ensure particles are placed before drawing.
				// No lifecycle updates needed for static render.
				const ctxOnce = canvas.getContext("2d");
				if (!ctxOnce) return;
				// Reuse drawParticles to keep visuals consistent.
				drawParticles();
			};
			drawOnce();
		} else {
			animationRef.current = requestAnimationFrame(animate);
		}

		const handleResize = () => {
			resizeCanvas();
			createParticles();
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (effectiveEnableMouseFollow) {
				// Use viewport coordinates since particles are fixed positioned
				mouseRef.current = {
					x: e.clientX,
					y: e.clientY,
				};
			}
		};

		const handleScroll = () => {
			if (effectiveEnableMouseFollow) {
				scrollRef.current = window.scrollY;
			}
		};

		window.addEventListener("resize", handleResize);
		if (effectiveEnableMouseFollow) {
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
				if (effectiveEnableMouseFollow) {
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
