// DrawnCardsDisplay.tsx - 左上角已抽牌展示组件
import { motion, AnimatePresence } from 'framer-motion'
import type { DrawnCard } from '../data/tarotCards'

interface DrawnCardsDisplayProps {
    cards: DrawnCard[]
    compact?: boolean
}

export function DrawnCardsDisplay({ cards, compact = true }: DrawnCardsDisplayProps) {
    if (cards.length === 0) return null

    return (
        <motion.div
            className={`fixed ${compact ? 'top-4 left-4' : 'relative'} z-40`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex gap-2">
                <AnimatePresence mode="popLayout">
                    {cards.map((drawnCard, index) => (
                        <motion.div
                            key={`drawn-${drawnCard.card.id}-${index}`}
                            className={`relative ${compact ? 'w-16 h-24' : 'w-32 h-48'} rounded-lg overflow-hidden shadow-lg`}
                            initial={{
                                scale: 0.8,
                                opacity: 0,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                rotate: drawnCard.isReversed ? 180 : 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 25,
                                delay: index * 0.1,
                            }}
                            style={{
                                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                            }}
                        >
                            <img
                                src={drawnCard.card.image}
                                alt={drawnCard.card.name}
                                className="w-full h-full object-cover"
                                draggable={false}
                            />
                            {/* 序号标记 */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-neon-gold rounded-full flex items-center justify-center text-xs font-bold text-black shadow">
                                {index + 1}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* 剩余位置占位 */}
                {compact && Array.from({ length: 3 - cards.length }, (_, i) => (
                    <motion.div
                        key={`placeholder-${i}`}
                        className="w-16 h-24 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                    >
                        <span className="text-white/30 text-xs">{cards.length + i + 1}</span>
                    </motion.div>
                ))}
            </div>

            {/* 提示文字 */}
            {compact && (
                <motion.p
                    className="text-xs text-gray-400 mt-2 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    已抽 {cards.length}/3 张
                </motion.p>
            )}
        </motion.div>
    )
}

export default DrawnCardsDisplay
