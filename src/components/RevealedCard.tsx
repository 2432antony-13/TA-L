// RevealedCard.tsx - Display a drawn tarot card with its meaning
import { motion } from 'framer-motion'
import type { DrawnCard } from '../data/tarotCards'

interface RevealedCardProps {
    drawnCard: DrawnCard
    onDrawAgain: () => void
}

export function RevealedCard({ drawnCard, onDrawAgain }: RevealedCardProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
            {/* Status Badge */}
            <motion.div
                className={`mb-6 flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md
          ${drawnCard.isReversed
                        ? 'border-purple-500/30 bg-purple-900/20 text-purple-300'
                        : 'border-neon-gold/30 bg-yellow-900/20 text-neon-gold'
                    }`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <span className="text-sm tracking-[0.2em] font-bold">
                    {drawnCard.isReversed ? '⚠️ REVERSED 逆位' : '✨ UPRIGHT 正位'}
                </span>
            </motion.div>

            {/* Revealed Card Image */}
            <motion.div
                className={`relative rounded-2xl overflow-hidden ${drawnCard.isReversed ? 'rotate-180' : ''}`}
                style={{ width: '300px', height: '460px', boxShadow: 'var(--shadow-neon-glow)' }}
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
            >
                <img
                    src={drawnCard.card.image}
                    alt={drawnCard.card.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                <div className="absolute inset-0 border-[6px] border-double border-white/10 rounded-2xl pointer-events-none mix-blend-overlay" />
            </motion.div>

            {/* Meaning Panel */}
            <motion.div
                className="mt-10 glass-panel p-8 rounded-3xl max-w-2xl w-full text-center relative overflow-hidden"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-neon-gold/50 to-transparent blur-sm" />
                <h3 className="text-4xl font-bold text-white mb-2 drop-shadow-md">
                    {drawnCard.card.name.split(' ')[0]}
                </h3>
                <div className="text-sm text-gray-500 font-serif italic mb-6">
                    {drawnCard.card.name.split(' ').slice(1).join(' ')}
                </div>
                <p className="text-gray-200 text-lg leading-relaxed font-light tracking-wide px-4">
                    "{drawnCard.isReversed ? drawnCard.card.reversedMeaning : drawnCard.card.uprightMeaning}"
                </p>
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                    <motion.button
                        onClick={onDrawAgain}
                        className="px-10 py-3 rounded-full bg-gradient-to-r from-mystic-purple to-mystic-dark border border-white/10 text-white font-medium tracking-widest text-sm"
                        whileHover={{
                            borderColor: 'rgba(255, 215, 0, 0.5)',
                            boxShadow: '0 0 25px rgba(255, 215, 0, 0.2)',
                        }}
                        whileTap={{ scale: 0.97 }}
                    >
                        再次探索
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default RevealedCard
