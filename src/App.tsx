// App.tsx - Main application using modular components
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { allCards, drawRandomCard, type DrawnCard } from './data/tarotCards'
import { TarotCarousel, RevealedCard } from './components'

function App() {
  const [currentRevealedCard, setCurrentRevealedCard] = useState<DrawnCard | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentRevealedCard])

  const handleSelectCard = (_cardIndex: number) => {
    if (isFlipping || currentRevealedCard) return
    setIsFlipping(true)
    setTimeout(() => {
      const drawn = drawRandomCard()
      drawn.isRevealed = true
      setCurrentRevealedCard(drawn)
      setIsFlipping(false)
    }, 300)
  }

  const handleDrawAgain = () => {
    setCurrentRevealedCard(null)
    setIsFlipping(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (currentRevealedCard) {
      if (e.key === 'Enter') handleDrawAgain()
      return
    }
    if (e.key === ' ') {
      e.preventDefault()
      handleSelectCard(0)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center p-4 select-none touch-none">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-neon-gold rounded-full blur-[1px] animate-float opacity-70"
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-plasma-blue rounded-full blur-[1px] animate-float opacity-50"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/5 w-1 h-1 bg-starlight rounded-full blur-[1px] animate-float opacity-40"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Title Section */}
      <motion.div
        className="z-10 text-center mb-12"
        animate={{
          scale: currentRevealedCard ? 0.85 : 1,
          marginBottom: currentRevealedCard ? '1rem' : '3rem',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <h1
          className="font-black text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-br from-starlight via-gray-200 to-gray-500"
          style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}
        >
          塔罗叙事
        </h1>
        <h2
          className="font-light tracking-[0.5em] text-neon-gold/70 uppercase text-lg md:text-xl mt-4"
          style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}
        >
          The Mystic Narrative
        </h2>
      </motion.div>

      {/* Main Content Area */}
      <div
        className="relative w-full max-w-7xl flex flex-col items-center justify-center z-10"
        style={{ perspective: '1200px' }}
      >
        {!currentRevealedCard ? (
          <TarotCarousel cards={allCards} onCardSelect={handleSelectCard} />
        ) : (
          <RevealedCard drawnCard={currentRevealedCard} onDrawAgain={handleDrawAgain} />
        )}
      </div>

      {/* Hidden Input for Keyboard Fallback */}
      <input
        ref={inputRef}
        autoFocus
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onBlur={() => inputRef.current?.focus()}
      />
    </div>
  )
}

export default App
