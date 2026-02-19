// TarotCard3D.tsx - A single 3D tarot card with flip capability
import { motion } from 'framer-motion'
import type { TarotCard as TarotCardType } from '../data/tarotCards'

interface TarotCard3DProps {
    card?: TarotCardType
    backImage: string
    isFlipped?: boolean
    isReversed?: boolean
    isCenter?: boolean
    isDragging?: boolean
    width?: number
    height?: number
    onClick?: () => void
}

export function TarotCard3D({
    card,
    backImage,
    isFlipped = false,
    isReversed = false,
    isCenter = false,
    isDragging = false,
    width = 220,
    height = 340,
    onClick,
}: TarotCard3DProps) {
    return (
        <motion.div
            className={`relative rounded-xl overflow-hidden shadow-2xl cursor-pointer ${isCenter ? 'ring-1 ring-neon-gold/20' : ''
                }`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transformStyle: 'preserve-3d',
                boxShadow: isCenter
                    ? '0 0 60px -12px rgba(255, 215, 0, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    : '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
            }}
            whileHover={isCenter && !isDragging ? { scale: 1.03, y: -5 } : {}}
            onClick={onClick}
            animate={{
                rotateY: isFlipped ? 180 : 0,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
            {/* Card Back */}
            <motion.div
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
            >
                <img
                    src={backImage}
                    alt="Card Back"
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                />
                {isCenter && (
                    <motion.div
                        className="absolute inset-0 border border-neon-gold/40 rounded-xl pointer-events-none"
                        animate={{
                            boxShadow: [
                                'inset 0 0 20px rgba(255, 215, 0, 0.1)',
                                'inset 0 0 30px rgba(255, 215, 0, 0.2)',
                                'inset 0 0 20px rgba(255, 215, 0, 0.1)',
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.div>

            {/* Card Front */}
            <motion.div
                className={`absolute inset-0 backface-hidden ${isReversed ? 'rotate-180' : ''}`}
                style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                }}
            >
                {card && (
                    <>
                        <img
                            src={card.image}
                            alt={card.name}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute inset-0 border-[6px] border-double border-white/10 rounded-2xl pointer-events-none mix-blend-overlay" />
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}

export default TarotCard3D
