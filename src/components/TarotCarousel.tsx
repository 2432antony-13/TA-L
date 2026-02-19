// TarotCarousel.tsx - Gesture-driven 3D carousel of tarot cards
import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { TarotCard as TarotCardType } from '../data/tarotCards'
import { CARD_BACK_IMAGE } from '../data/tarotCards'
import TarotCard3D from './TarotCard3D'

// Constants for gesture-driven carousel
const CARD_WIDTH = 220
const CARD_GAP = 30
const CARD_OFFSET = CARD_WIDTH + CARD_GAP
const VISIBLE_CARDS = 5
const DRAG_THRESHOLD = 50
const SWIPE_UP_THRESHOLD = -80

interface TarotCarouselProps {
    cards: TarotCardType[]
    onCardSelect?: (index: number) => void
    // For future hand gesture integration (Module D: The Ritual)
    externalIndex?: number
    onIndexChange?: (index: number) => void
}

export function TarotCarousel({
    cards,
    onCardSelect,
    externalIndex,
    onIndexChange,
}: TarotCarouselProps) {
    const [internalIndex, setInternalIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    // Support both internal and external control (for hand gesture integration)
    const activeIndex = externalIndex ?? internalIndex
    const setActiveIndex = (index: number) => {
        setInternalIndex(index)
        onIndexChange?.(index)
    }

    // Motion values for gesture-driven animations
    const dragX = useMotionValue(0)
    const dragY = useMotionValue(0)

    // Background parallax derived from drag position (can be exposed to parent)
    const backgroundX = useTransform(dragX, [-500, 500], [30, -30])
    const backgroundY = useTransform(dragY, [-200, 200], [15, -15])

    // Handle drag end - snap to nearest card with spring physics
    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false)

        // Check for upward swipe gesture (select card)
        if (info.offset.y < SWIPE_UP_THRESHOLD) {
            onCardSelect?.(activeIndex)
            animate(dragY, 0, { type: 'spring', stiffness: 300, damping: 30 })
            return
        }

        const velocity = info.velocity.x
        const offset = info.offset.x

        let indexDelta = 0
        if (Math.abs(offset) > DRAG_THRESHOLD || Math.abs(velocity) > 500) {
            indexDelta = offset > 0 || velocity > 500 ? -1 : 1
        }

        const newIndex = Math.max(0, Math.min(cards.length - 1, activeIndex + indexDelta))
        setActiveIndex(newIndex)

        animate(dragX, 0, {
            type: 'spring',
            stiffness: 400,
            damping: 35,
            velocity: velocity * 0.1,
        })
        animate(dragY, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }

    const getCardStyle = (offset: number, currentDragX: number) => {
        const dragInfluence = currentDragX / CARD_OFFSET
        const effectiveOffset = offset - dragInfluence

        return {
            x: effectiveOffset * CARD_OFFSET,
            rotateY: effectiveOffset * -20,
            scale: Math.max(0.7, 1 - Math.abs(effectiveOffset) * 0.12),
            opacity: Math.max(0.2, 1 - Math.abs(effectiveOffset) * 0.3),
            brightness: offset === 0 ? 1 : Math.max(0.4, 1 - Math.abs(effectiveOffset) * 0.2),
            zIndex: 50 - Math.abs(offset) * 10,
        }
    }

    return (
        <>
            {/* Parallax Background Layer (for parent to consume if needed) */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                style={{ x: backgroundX, y: backgroundY }}
            >
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-mystic-purple/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/15 rounded-full blur-[100px] mix-blend-screen" />
            </motion.div>

            {/* Gesture-Driven Card Carousel */}
            <motion.div
                className="relative w-full h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x: dragX, y: dragY }}
            >
                <div
                    className="relative flex items-center justify-center"
                    style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
                >
                    {Array.from({ length: VISIBLE_CARDS }, (_, i) => i - Math.floor(VISIBLE_CARDS / 2)).map(
                        (offset) => {
                            const cardIndex = activeIndex + offset
                            if (cardIndex < 0 || cardIndex >= cards.length) return null
                            const isCenter = offset === 0
                            const style = getCardStyle(offset, dragX.get())

                            return (
                                <motion.div
                                    key={`card-${cardIndex}`}
                                    className="absolute"
                                    animate={{
                                        x: style.x,
                                        rotateY: style.rotateY,
                                        scale: style.scale,
                                        opacity: style.opacity,
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                                    style={{
                                        zIndex: style.zIndex,
                                        filter: `brightness(${style.brightness})`,
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <TarotCard3D
                                        backImage={CARD_BACK_IMAGE}
                                        isCenter={isCenter}
                                        isDragging={isDragging}
                                        onClick={() => isCenter && !isDragging && onCardSelect?.(cardIndex)}
                                    />
                                </motion.div>
                            )
                        }
                    )}
                </div>
            </motion.div>

            {/* Gesture Hint Panel */}
            <motion.div
                className="glass-panel px-8 py-6 rounded-2xl max-w-md w-full text-center backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">👈👉</span>
                        <span className="text-xs text-gray-400">滑动浏览</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">👆</span>
                        <span className="text-xs text-gray-400">上滑抽牌</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">👆</span>
                        <span className="text-xs text-gray-400">点击确认</span>
                    </div>
                </div>
                <div className="text-xs text-neon-gold/50 font-mono">
                    CARD {String(activeIndex + 1).padStart(2, '0')} / {cards.length}
                </div>
            </motion.div>
        </>
    )
}

export default TarotCarousel
