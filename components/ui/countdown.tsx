"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface CountdownProps {
  targetDate: Date
  onComplete?: () => void
  className?: string
}

export function Countdown({ targetDate, onComplete, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true })
        onComplete?.()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds, isComplete: false })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (timeLeft.isComplete) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex gap-2 sm:gap-4 justify-center items-center">
        {timeLeft.days > 0 && (
          <>
            <TimeUnit value={timeLeft.days} label="Days" />
            <Separator />
          </>
        )}
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      key={value}
    >
      <motion.div
        className="text-6xl sm:text-7xl md:text-8xl font-black text-white bg-white/5 border border-white/20 px-4 sm:px-6 py-3 sm:py-4 rounded-lg min-w-[100px] sm:min-w-[140px] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.2, 0, 0.8, 1] }}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <div className="text-base sm:text-lg text-white/70 mt-2 sm:mt-3 font-bold uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  )
}

function Separator() {
  return (
    <div className="text-6xl sm:text-7xl md:text-8xl font-black text-white">:</div>
  )
}
