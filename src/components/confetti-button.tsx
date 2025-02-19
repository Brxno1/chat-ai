'use client'

import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'

interface ConfettiProps {
  count?: number
}

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min

const Confetti: React.FC<ConfettiProps> = ({ count = 50 }) => {
  const [confetti] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomInRange(0, 100),
      y: randomInRange(-50, -10),
      rotation: randomInRange(0, 360),
      scale: randomInRange(0.5, 1),
    })),
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {confetti.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute h-4 w-4"
          style={{
            left: `${particle.x}%`,
            top: particle.y,
          }}
          animate={{
            y: '120vh',
            rotate: particle.rotation + 360,
          }}
          transition={{
            duration: randomInRange(5, 10),
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
            delay: randomInRange(0, 3),
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: [
                '#ff0000',
                '#00ff00',
                '#0000ff',
                '#ffff00',
                '#ff00ff',
                '#00ffff',
              ][Math.floor(Math.random() * 6)],
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
            }}
            animate={{
              scale: [particle.scale, particle.scale * 1.2, particle.scale],
            }}
            transition={{
              duration: randomInRange(2, 4),
              ease: 'easeInOut',
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default function UpgradeButton() {
  const [showConfetti, setShowConfetti] = useState(false)

  const handleClick = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={handleClick}
        className="text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-teal-400"
      >
        Upgrade!
        <Rocket className="ml-auto h-4 w-4" />
      </button>
      {showConfetti && <Confetti />}
    </div>
  )
}
