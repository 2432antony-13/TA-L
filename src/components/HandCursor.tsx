// HandCursor.tsx - 性能优化版：使用 MotionValue 直接驱动位置
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useGesture } from '../context/GestureContext'

export function HandCursor() {
    const { handState, isEnabled, isReady } = useGesture()
    const lastUpdateRef = useRef<number>(0)

    // 使用 MotionValue 直接驱动位置，避免 React 重渲染
    const rawX = useMotionValue(50)
    const rawY = useMotionValue(50)

    // 平滑弹簧动画
    const springConfig = { stiffness: 400, damping: 30, mass: 0.5 }
    const x = useSpring(rawX, springConfig)
    const y = useSpring(rawY, springConfig)

    // 转换为百分比字符串
    const leftPercent = useTransform(x, (v) => `${v}%`)
    const topPercent = useTransform(y, (v) => `${v}%`)

    // 直接更新 MotionValue，不触发 React 渲染
    useEffect(() => {
        if (!isEnabled || !isReady) return

        const now = performance.now()
        // 节流：至少间隔 16ms（约60fps）
        if (now - lastUpdateRef.current < 16) return
        lastUpdateRef.current = now

        rawX.set(handState.cursor.x * 100)
        rawY.set(handState.cursor.y * 100)
    }, [handState.cursor.x, handState.cursor.y, isEnabled, isReady, rawX, rawY])

    if (!isEnabled || !isReady || handState.mode === 'IDLE') return null

    const { isPointing, isFist, scrollDirection } = handState

    return (
        <AnimatePresence>
            <motion.div
                className="fixed pointer-events-none z-50"
                style={{
                    left: leftPercent,
                    top: topPercent,
                    x: '-50%',
                    y: '-50%'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: 1,
                    scale: isPointing ? 1.2 : isFist ? 0.9 : 1,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {/* Cursor icon */}
                <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                        backgroundColor: isPointing ? 'rgba(255,215,0,0.8)' : isFist ? 'rgba(255,100,100,0.8)' : 'rgba(255,255,255,0.6)',
                        boxShadow: `0 0 30px ${isPointing ? 'rgba(255,215,0,0.6)' : isFist ? 'rgba(255,100,100,0.6)' : 'rgba(255,255,255,0.5)'}`
                    }}
                >
                    {isPointing && <span className="text-lg">☝️</span>}
                    {isFist && <span className="text-lg">✊</span>}
                    {!isPointing && !isFist && scrollDirection === 'left' && <span className="text-lg">👈</span>}
                    {!isPointing && !isFist && scrollDirection === 'right' && <span className="text-lg">👉</span>}
                    {!isPointing && !isFist && scrollDirection === 'center' && <span className="text-lg">🖐️</span>}
                </motion.div>

                {/* Status label */}
                <motion.div
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap px-3 py-1.5 rounded-full"
                    style={{
                        backgroundColor: isPointing ? 'rgba(255,215,0,0.2)' : isFist ? 'rgba(255,100,100,0.2)' : 'rgba(255,255,255,0.1)',
                        color: isPointing ? '#FFD700' : isFist ? '#FF6464' : 'white'
                    }}
                >
                    {isPointing && '☝️ 悬停选牌中...'}
                    {isFist && '✊ 暂停/返回'}
                    {!isPointing && !isFist && scrollDirection === 'left' && '⬅️ 向左滑动'}
                    {!isPointing && !isFist && scrollDirection === 'right' && '➡️ 向右滑动'}
                    {!isPointing && !isFist && scrollDirection === 'center' && '☝️ 食指选牌'}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default HandCursor
