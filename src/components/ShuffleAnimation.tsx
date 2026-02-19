// ShuffleAnimation.tsx - 奥术飞舞效果：爆发 -> 漩涡 -> 重组
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CARD_BACK_IMAGE } from '../data/tarotCards'

interface ShuffleAnimationProps {
    isActive: boolean
    onComplete: () => void
}

// 动画阶段
type Phase = 'idle' | 'burst' | 'vortex' | 'merge' | 'done'

// 牌张数量
const CARD_COUNT = 22

// 生成随机位置（圆周分布）
function generateBurstPositions(count: number) {
    return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
        const radius = 200 + Math.random() * 150
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            rotation: Math.random() * 720 - 360,
            scale: 0.6 + Math.random() * 0.4
        }
    })
}

// 生成漩涡轨迹位置
function generateVortexPositions(count: number, frame: number) {
    return Array.from({ length: count }, (_, i) => {
        const progress = (frame % 100) / 100
        const angle = (i / count) * Math.PI * 2 + progress * Math.PI * 4
        const radius = Math.max(10, 180 - frame * 2 + i * 3)
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            rotation: angle * 180 / Math.PI + frame * 5,
            scale: 0.5 + (1 - radius / 200) * 0.5
        }
    })
}

export function ShuffleAnimation({ isActive, onComplete }: ShuffleAnimationProps) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [vortexFrame, setVortexFrame] = useState(0)

    const burstPositions = useMemo(() => generateBurstPositions(CARD_COUNT), [])
    const vortexPositions = useMemo(() => generateVortexPositions(CARD_COUNT, vortexFrame), [vortexFrame])

    // 控制动画阶段
    useEffect(() => {
        if (!isActive) {
            setPhase('idle')
            setVortexFrame(0)
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []

        // 阶段切换时序
        setPhase('burst')
        timers.push(setTimeout(() => setPhase('vortex'), 800))
        timers.push(setTimeout(() => setPhase('merge'), 2500))
        timers.push(setTimeout(() => {
            setPhase('done')
            onComplete()
        }, 3500))

        return () => timers.forEach(t => clearTimeout(t))
    }, [isActive, onComplete])

    // 漩涡动画帧更新
    useEffect(() => {
        if (phase !== 'vortex') return

        const interval = setInterval(() => {
            setVortexFrame(f => f + 1)
        }, 16) // 约 60fps

        return () => clearInterval(interval)
    }, [phase])

    if (!isActive && phase === 'idle') return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* 背景光效 */}
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(138,43,226,0.1) 50%, transparent 70%)'
                    }}
                    animate={{
                        scale: phase === 'burst' ? [1, 1.5, 1.2] : phase === 'vortex' ? [1.2, 1.3, 1.2] : [1.2, 0.8],
                        rotate: phase === 'vortex' ? [0, 360] : 0,
                    }}
                    transition={{
                        duration: phase === 'vortex' ? 2 : 0.8,
                        repeat: phase === 'vortex' ? Infinity : 0,
                        ease: 'linear'
                    }}
                />

                {/* 粒子效果 */}
                {phase === 'burst' && Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute w-1 h-1 rounded-full bg-neon-gold"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                            x: Math.cos(i * 0.2) * (100 + Math.random() * 200),
                            y: Math.sin(i * 0.2) * (100 + Math.random() * 200),
                            opacity: 0,
                            scale: [1, 2, 0]
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                ))}

                {/* 卡牌 */}
                {Array.from({ length: CARD_COUNT }).map((_, i) => {
                    const burstPos = burstPositions[i]
                    const vortexPos = vortexPositions[i]

                    let targetX = 0
                    let targetY = 0
                    let targetRotation = 0
                    let targetScale = 1

                    if (phase === 'burst') {
                        targetX = burstPos.x
                        targetY = burstPos.y
                        targetRotation = burstPos.rotation
                        targetScale = burstPos.scale
                    } else if (phase === 'vortex') {
                        targetX = vortexPos.x
                        targetY = vortexPos.y
                        targetRotation = vortexPos.rotation
                        targetScale = vortexPos.scale
                    } else if (phase === 'merge' || phase === 'done') {
                        targetX = 0
                        targetY = i * 0.5 - CARD_COUNT * 0.25
                        targetRotation = 0
                        targetScale = 1
                    }

                    return (
                        <motion.div
                            key={`card-${i}`}
                            className="absolute w-16 h-24 rounded-lg overflow-hidden"
                            style={{
                                boxShadow: phase === 'vortex'
                                    ? '0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(138,43,226,0.3)'
                                    : '0 4px 20px rgba(0,0,0,0.5)',
                                zIndex: CARD_COUNT - i
                            }}
                            initial={{ x: 0, y: 0, rotate: 0, scale: 0.8 }}
                            animate={{
                                x: targetX,
                                y: targetY,
                                rotate: targetRotation,
                                scale: targetScale
                            }}
                            transition={{
                                type: phase === 'vortex' ? 'tween' : 'spring',
                                duration: phase === 'vortex' ? 0.016 : undefined,
                                stiffness: 200,
                                damping: 20
                            }}
                        >
                            <img
                                src={CARD_BACK_IMAGE}
                                alt="back"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )
                })}

                {/* 中心光点 */}
                {(phase === 'vortex' || phase === 'merge') && (
                    <motion.div
                        className="absolute w-4 h-4 rounded-full bg-white"
                        style={{
                            boxShadow: '0 0 30px 15px rgba(255,255,255,0.6), 0 0 60px 30px rgba(255,215,0,0.4)'
                        }}
                        animate={{
                            scale: phase === 'merge' ? [1, 3, 0] : [1, 1.2, 1],
                        }}
                        transition={{
                            duration: phase === 'merge' ? 0.5 : 0.5,
                            repeat: phase === 'vortex' ? Infinity : 0
                        }}
                    />
                )}

                {/* 提示文字 */}
                <motion.div
                    className="absolute bottom-32 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-neon-gold text-lg font-light tracking-widest">
                        {phase === 'burst' && '✨ 命运之牌散落...'}
                        {phase === 'vortex' && '🌀 能量汇聚中...'}
                        {phase === 'merge' && '🔮 重组完成'}
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ShuffleAnimation
