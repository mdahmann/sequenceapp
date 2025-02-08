'use client'

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowRightIcon, SparklesIcon, BeakerIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Flow & Repetition',
    description: 'Build dynamic sequences with bilateral markers, flow blocks, and build-up progressions.',
    icon: <ArrowRightIcon className="w-6 h-6" />,
    color: 'from-blue-500 to-purple-500'
  },
  {
    title: 'Mini-Sequences',
    description: 'Create and save signature flows, from Sun Salutations to custom vinyasa transitions.',
    icon: <SparklesIcon className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Timing & Rhythm',
    description: 'Add breath markers, set varied paces, and balance holds with flowing movements.',
    icon: <ClockIcon className="w-6 h-6" />,
    color: 'from-pink-500 to-red-500'
  },
  {
    title: 'Teaching Tools',
    description: 'Access pose cues, modifications, and prop suggestions for every level.',
    icon: <UserGroupIcon className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500'
  }
];

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function generatePoints(count: number, width: number, height: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    scale: Math.random() * 0.5 + 0.5,
  }));
}

function CosmicBackground({ progress }: { progress: MotionValue<number> }) {
  const [points, setPoints] = useState<Array<{ x: number; y: number; scale: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setPoints(generatePoints(50, width, height));
    }
  }, []);

  const rotation = useTransform(progress, [0, 1], [0, 180]);
  const scale = useTransform(progress, [0, 0.5, 1], [1, 1.2, 1]);
  
  return (
    <motion.div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Constellation layer */}
      <div className="absolute inset-0">
        {points.map((point, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: point.x,
              top: point.y,
              scale: point.scale,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [point.scale, point.scale * 1.5, point.scale],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Sacred geometry layer */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ rotate: rotation, scale }}
      >
        <motion.div
          className="w-[800px] h-[800px] opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {/* Sacred geometry pattern */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.path
              d="M50 10 L90 90 L10 90 Z"
              stroke="currentColor"
              strokeWidth="0.2"
              fill="none"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="0.2"
              fill="none"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Aurora effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.1) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.1) 0%, transparent 70%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  );
}

function BreatheAnimation() {
  return (
    <>
      {/* Multiple breathing layers with different colors and timing */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent rounded-full blur-2xl"
      />
      <motion.div
        animate={{
          scale: [1.1, 1.3, 1.1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
        className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent rounded-full blur-2xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1.4, 1.2],
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
        className="absolute inset-0 bg-gradient-radial from-pink-500/20 via-transparent to-transparent rounded-full blur-2xl"
      />
    </>
  );
}

function GridBackground({ progress }: { progress: MotionValue<number> }) {
  const rotation = useTransform(progress, [0, 1], [0, 5]);
  const scale = useTransform(progress, [0, 0.5, 1], [1, 1.05, 1]);
  
  return (
    <motion.div 
      className="fixed inset-0 grid-background opacity-20"
      style={{ 
        rotate: rotation,
        scale,
        originX: 0.5,
        originY: 0.5
      }}
    />
  );
}

function ScrollSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);

  return (
    <motion.section
      ref={ref}
      style={{ opacity, y }}
      className={`min-h-screen flex items-center justify-center ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <CosmicBackground progress={scaleProgress} />

      {/* Hero Section */}
      <ScrollSection className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <BreatheAnimation />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 relative">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <motion.h1
                animate={{
                  scale: [1, 1.01, 1],
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-6xl md:text-8xl font-bold tracking-tight"
              >
                Sequence
              </motion.h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
                Create intelligent yoga sequences with AI assistance
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isLoggedIn ? (
                <Link
                  href="/generate"
                  className="brutalist-button-primary text-lg px-8 py-4"
                >
                  Create Sequence
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="brutalist-button-primary text-lg px-8 py-4"
                >
                  Get Started
                </Link>
              )}
              <Link
                href="/discover"
                className="brutalist-button-secondary text-lg px-8 py-4"
              >
                Explore Sequences
              </Link>
            </motion.div>
          </div>
        </div>
      </ScrollSection>

      {/* Features Grid */}
      <ScrollSection className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * index }}
                className="brutalist-card hover:scale-[1.02] transition-transform"
              >
                <div className={`h-2 w-full bg-gradient-to-r ${feature.color} rounded-t-lg`} />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* CTA Section */}
      <ScrollSection className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="brutalist-card text-center py-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join our community of teachers and practitioners creating intelligent, flowing sequences.
            </p>
            {isLoggedIn ? (
              <Link
                href="/generate"
                className="brutalist-button-primary text-lg px-8 py-4"
              >
                Start Creating
              </Link>
            ) : (
              <Link
                href="/signup"
                className="brutalist-button-primary text-lg px-8 py-4"
              >
                Sign Up Free
              </Link>
            )}
          </motion.div>
        </div>
      </ScrollSection>
    </div>
  );
} 