// RevealedCard.tsx - 展示抽到的塔罗牌及其含义
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { DrawnCard } from '../data/tarotCards'
import { useGesture } from '../context/GestureContext'

// 握拳返回所需时长（毫秒）
const FIST_RETURN_DELAY = 1000

interface RevealedCardProps {
    drawnCard: DrawnCard
    onDrawAgain: () => void
}

export function RevealedCard({ drawnCard, onDrawAgain }: RevealedCardProps) {
    const { handState, isEnabled } = useGesture()
    const [fistProgress, setFistProgress] = useState(0)  // 握拳进度 0-100%
    const hasTriggeredRef = useRef(false)

    // 监听握拳手势：握拳 1 秒返回抽牌
    useEffect(() => {
        if (!isEnabled) {
            setFistProgress(0)
            return
        }

        const { isFist, fistStartTime } = handState

        if (isFist && fistStartTime) {
            const checkProgress = () => {
                const elapsed = Date.now() - fistStartTime
                const progress = Math.min(100, (elapsed / FIST_RETURN_DELAY) * 100)
                setFistProgress(progress)

                // 握拳满 1 秒，触发返回
                if (elapsed >= FIST_RETURN_DELAY && !hasTriggeredRef.current) {
                    hasTriggeredRef.current = true
                    onDrawAgain()
                }
            }

            const interval = setInterval(checkProgress, 50)
            return () => clearInterval(interval)
        } else {
            setFistProgress(0)
            hasTriggeredRef.current = false
        }
    }, [handState.isFist, handState.fistStartTime, isEnabled, onDrawAgain])

    return (
        <motion.div
            className="flex flex-col items-center justify-center w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
            {/* Status Badge */}
            <motion.div
                className={`mb-4 flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md
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
                className={`relative flex items-center justify-center ${drawnCard.isReversed ? 'rotate-180' : ''}`}
                style={{ height: '42vh', maxHeight: '500px', minHeight: '300px' }} // 响应式高度
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
            >
                <img
                    src={drawnCard.card.image}
                    alt={drawnCard.card.name}
                    className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                    draggable={false}
                />
            </motion.div>

            {/* Meaning Panel */}
            <motion.div
                className="mt-6 glass-panel px-8 py-5 rounded-3xl max-w-xl w-full text-center relative overflow-hidden flex flex-col items-center" // 减少上边距
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-neon-gold/50 to-transparent blur-sm" />

                {/* 牌名 */}
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
                    {drawnCard.card.name}
                </h3>

                {/* 序号/牌组 */}
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">
                    {drawnCard.card.id.toUpperCase()} • {drawnCard.card.suit.toUpperCase()}
                </p>

                {/* 释义内容 */}
                <div className="relative mb-4 px-4">
                    <p className={`text-lg font-medium leading-relaxed italic
                        ${drawnCard.isReversed ? 'text-purple-300' : 'text-neon-gold'}
                    `}>
                        "{drawnCard.isReversed ? drawnCard.card.reversedMeaning : drawnCard.card.uprightMeaning}"
                    </p>

                    {/* 装饰引号 - 调小 */}
                    <span className="absolute -top-3 -left-1 text-4xl text-white/10 font-serif">“</span>
                    <span className="absolute -bottom-6 -right-1 text-4xl text-white/10 font-serif">”</span>
                </div>

                {/* 底部提示 */}
                <div className="pt-3 border-t border-white/10 flex flex-col items-center w-full gap-2">
                    <button
                        onClick={onDrawAgain}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-medium tracking-wide"
                    >
                        再次探索
                    </button>

                    {isEnabled && (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            {/* 进度条背景 */}
                            <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${drawnCard.isReversed ? 'bg-purple-500' : 'bg-neon-gold'}`}
                                    style={{ width: `${fistProgress}%` }}
                                />
                            </div>
                            <span>✊ 握拳返回</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default RevealedCard
