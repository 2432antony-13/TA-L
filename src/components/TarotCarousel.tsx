// TarotCarousel.tsx - 手势控制的塔罗牌轮播（渲染全部牌，流畅滑动）
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, animate, useSpring } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { TarotCard as TarotCardType } from '../data/tarotCards'
import { CARD_BACK_IMAGE } from '../data/tarotCards'
import TarotCard3D from './TarotCard3D'
import type { HandState } from '../context/GestureContext'

// 运行时尺寸判断（手机端显示 5 张牌）
const isMobile = () => window.innerWidth < 768
const HOVER_SELECT_DELAY = 2000  // 悬停 2 秒选中
const SWIPE_UP_THRESHOLD = -80

interface TarotCarouselProps {
    cards: TarotCardType[]
    onCardSelect?: (index: number) => void
    externalIndex?: number
    onIndexChange?: (index: number) => void
    handState?: HandState | null
    onJumpToCard?: (callback: (index: number) => void) => void  // 父组件可调用跳转
}

export function TarotCarousel({
    cards,
    onCardSelect,
    onIndexChange,
    handState,
    onJumpToCard,
}: TarotCarouselProps) {
    // 连续滚动偏移量（像素）
    const scrollOffset = useMotionValue(0)
    // 优化弹簧参数：提高响应速度以配合高频手势更新
    const smoothOffset = useSpring(scrollOffset, {
        stiffness: 150,  // 提高刚度，响应更快
        damping: 20,     // 适中阻尼
        mass: 0.3        // 降低质量，减少惯性延迟
    })

    // 状态
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
    const [hoverProgress, setHoverProgress] = useState(0)
    const [isSelectMode, setIsSelectMode] = useState(false)

    // Refs
    const animationFrameRef = useRef<number | null>(null)
    const hoverStartRef = useRef<{ index: number; time: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const selectModeRef = useRef(false)

    // 计算牌总宽度——运行时计算一次
    const cardW = isMobile() ? 90 : 160
    const cardH = isMobile() ? 140 : 240
    const gap = isMobile() ? 16 : 50
    const cardTotalWidth = cardW + gap

    // 跳转到指定牌的函数（供父组件调用）
    const jumpToCard = useCallback((targetIndex: number) => {
        const clampedIndex = Math.max(0, Math.min(targetIndex, 77))
        const targetOffset = -clampedIndex * cardTotalWidth

        animate(scrollOffset, targetOffset, {
            type: 'spring',
            stiffness: 100,
            damping: 20,
            onComplete: () => {
                onCardSelect?.(clampedIndex)
            }
        })
    }, [cardTotalWidth, scrollOffset, onCardSelect])

    // 将跳转函数暴露给父组件
    useEffect(() => {
        onJumpToCard?.(jumpToCard)
    }, [jumpToCard, onJumpToCard])

    // 根据光标位置计算悬停的牌索引（基于像素位置精确计算）
    const getHoveredCardIndex = useCallback((cursorX: number) => {
        const container = containerRef.current
        if (!container) return 0

        const containerWidth = container.offsetWidth
        const containerCenter = containerWidth / 2

        // 光标的像素位置（相对于容器中心）
        const cursorPixelX = cursorX * containerWidth - containerCenter

        // 当前滚动偏移
        const currentOffset = scrollOffset.get()

        // 计算光标指向的牌索引
        // 公式：牌索引 = (光标像素位置 - 滚动偏移) / 牌宽度
        const rawIndex = Math.round((-currentOffset + cursorPixelX) / cardTotalWidth)

        return Math.max(0, Math.min(cards.length - 1, rawIndex))
    }, [scrollOffset, cards.length, cardTotalWidth, containerRef])

    // 手势控制逻辑
    useEffect(() => {
        if (!handState) return

        const { mode, cursor, isPointing, isOpenPalm } = handState

        // 取消之前的动画帧
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }

        // 只伸出一根手指（食指）：进入选牌模式
        if (isPointing) {
            setIsSelectMode(true)

            // 计算悬停的牌
            const hoveredIndex = getHoveredCardIndex(cursor.x)
            setHighlightedIndex(hoveredIndex)

            const now = Date.now()
            if (hoverStartRef.current && hoverStartRef.current.index === hoveredIndex) {
                const elapsed = now - hoverStartRef.current.time
                const progress = Math.min(100, (elapsed / HOVER_SELECT_DELAY) * 100)
                setHoverProgress(progress)

                if (elapsed >= HOVER_SELECT_DELAY) {
                    onCardSelect?.(hoveredIndex)
                    hoverStartRef.current = null
                    setHoverProgress(0)
                    setIsSelectMode(false)
                    setHighlightedIndex(null)
                }
            } else {
                hoverStartRef.current = { index: hoveredIndex, time: now }
                setHoverProgress(0)
            }
        } else {
            // 非选牌模式：重置选牌状态
            setIsSelectMode(false)
            setHighlightedIndex(null)
            setHoverProgress(0)
            hoverStartRef.current = null
            // 手掌张开：滚动模式（使用 RAF 循环实现连续平滑滚动）
            if (isOpenPalm && mode === 'SCROLLING') {
                // 启动连续滚动循环
                const scrollLoop = () => {
                    // 计算当前速度
                    let scrollVelocity = 0

                    if (cursor.x < 0.35) {
                        const intensity = (0.35 - cursor.x) / 0.35
                        scrollVelocity = intensity * 70  // 每帧移动的像素数
                    } else if (cursor.x > 0.65) {
                        const intensity = (cursor.x - 0.65) / 0.35
                        scrollVelocity = -intensity * 70
                    }

                    if (Math.abs(scrollVelocity) > 0.1) {
                        const currentOffset = scrollOffset.get()
                        const maxOffset = 0
                        const minOffset = -(cards.length - 1) * cardTotalWidth

                        const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + scrollVelocity))
                        scrollOffset.set(newOffset)  // 直接 set，让 smoothOffset 的 spring 处理平滑

                        // 更新索引（降低频率）
                        const newIndex = Math.round(-newOffset / cardTotalWidth)
                        onIndexChange?.(newIndex)
                    }

                    animationFrameRef.current = requestAnimationFrame(scrollLoop)
                }

                scrollLoop()
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [handState, cards.length, onCardSelect, onIndexChange, scrollOffset, getHoveredCardIndex, cardTotalWidth])

    // 鼠标拖拽
    const dragX = useMotionValue(0)
    const dragY = useMotionValue(0)

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y < SWIPE_UP_THRESHOLD) {
            const currentIndex = Math.round(-scrollOffset.get() / cardTotalWidth)
            onCardSelect?.(currentIndex)
            animate(dragY, 0, { type: 'spring', stiffness: 300, damping: 30 })
            return
        }

        const currentOffset = scrollOffset.get()
        const maxOffset = 0
        const minOffset = -(cards.length - 1) * cardTotalWidth

        const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + info.offset.x))
        const snappedOffset = Math.round(newOffset / cardTotalWidth) * cardTotalWidth

        animate(scrollOffset, snappedOffset, { type: 'spring', stiffness: 200, damping: 25 })
        animate(dragX, 0, { type: 'spring', stiffness: 280, damping: 40 })
        animate(dragY, 0, { type: 'spring', stiffness: 280, damping: 40 })

        const newIndex = Math.round(-snappedOffset / cardTotalWidth)
        onIndexChange?.(newIndex)
    }, [cards.length, onCardSelect, onIndexChange, scrollOffset, dragX, dragY, cardTotalWidth])

    // 鼠标滚轮支持
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()

            if (selectModeRef.current || isSelectMode) return

            const delta = e.deltaY || e.deltaX
            const currentOffset = scrollOffset.get()
            const maxOffset = 0
            const minOffset = -(cards.length - 1) * cardTotalWidth

            const scrollAmount = -delta * 1.5

            const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + scrollAmount))
            scrollOffset.set(newOffset)

            const newIndex = Math.round(-newOffset / cardTotalWidth)
            onIndexChange?.(newIndex)
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, [cards.length, isSelectMode, onIndexChange, scrollOffset, cardTotalWidth])

    // 强制更新用于动画
    const [, setTick] = useState(0)
    useEffect(() => {
        const unsubscribe = smoothOffset.on('change', () => {
            setTick(t => t + 1)
        })
        return unsubscribe
    }, [smoothOffset])

    // 计算当前中心索引
    const currentCenterIndex = Math.round(-smoothOffset.get() / cardTotalWidth)

    // 手机端触摸事件：惯性滑动
    const touchStartXRef = useRef(0)
    const touchLastXRef = useRef(0)
    const touchVelocityRef = useRef(0)
    const momentumRef = useRef<number | null>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const stopMomentum = () => {
            if (momentumRef.current) {
                cancelAnimationFrame(momentumRef.current)
                momentumRef.current = null
            }
        }

        const handleTouchStart = (e: TouchEvent) => {
            stopMomentum()
            touchStartXRef.current = e.touches[0].clientX
            touchLastXRef.current = e.touches[0].clientX
            touchVelocityRef.current = 0
        }

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault()
            const currentX = e.touches[0].clientX
            const delta = currentX - touchLastXRef.current
            touchVelocityRef.current = delta // 旧速度
            touchLastXRef.current = currentX

            const currentOffset = scrollOffset.get()
            const maxOffset = 0
            const minOffset = -(cards.length - 1) * cardTotalWidth
            const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + delta))
            scrollOffset.set(newOffset)
        }

        const handleTouchEnd = () => {
            let velocity = touchVelocityRef.current
            const deceleration = 0.92 // 每帧逐渐衰减

            const applyMomentum = () => {
                if (Math.abs(velocity) < 0.5) {
                    // 惯性结束，对齐到近一张牌
                    const currentOffset = scrollOffset.get()
                    const snapped = Math.round(currentOffset / cardTotalWidth) * cardTotalWidth
                    animate(scrollOffset, snapped, { type: 'spring', stiffness: 200, damping: 28 })
                    return
                }
                velocity *= deceleration
                const currentOffset = scrollOffset.get()
                const maxOffset = 0
                const minOffset = -(cards.length - 1) * cardTotalWidth
                const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + velocity))
                scrollOffset.set(newOffset)
                momentumRef.current = requestAnimationFrame(applyMomentum)
            }

            momentumRef.current = requestAnimationFrame(applyMomentum)
        }

        container.addEventListener('touchstart', handleTouchStart, { passive: true })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            stopMomentum()
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [cards.length, scrollOffset, cardTotalWidth])

    return (
        <div className="relative w-full h-[320px] md:h-[480px]">
            {/* 牌索引指示器 */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 z-50">
                {currentCenterIndex + 1} / {cards.length}
            </div>

            <motion.div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing touch-none"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.05}
                style={{ x: dragX, y: dragY }}
                onDragEnd={handleDragEnd}
                // 手机端禁用 framer-motion 拖拽，改用原生 touch 事件
                dragListener={!isMobile()}
            >
                {/* 渲染全部 78 张牌 */}
                <div
                    className="relative flex items-center justify-center"
                    style={{ width: cardW, height: cardH }}
                >
                    {cards.map((card, index) => {
                        const currentOffset = smoothOffset.get()
                        const cardPosition = index * cardTotalWidth + currentOffset

                        // 手机端显示 5 张可见牌，桌面端显示可见范围内
                        const visibleHalf = isMobile()
                            ? cardTotalWidth * 3   // 左右各 2.5 张
                            : window.innerWidth / 2 + cardW
                        if (Math.abs(cardPosition) > visibleHalf) {
                            return null
                        }

                        const distanceFromCenter = Math.abs(index - currentCenterIndex)
                        const zIndex = 100 - distanceFromCenter

                        const isHighlighted = highlightedIndex === index
                        const isCenter = index === currentCenterIndex

                        return (
                            <motion.div
                                key={`card-${index}`}
                                className="absolute"
                                style={{
                                    width: cardW,
                                    height: cardH,
                                    zIndex: isHighlighted ? 200 : zIndex,
                                    x: cardPosition,
                                }}
                                animate={{
                                    scale: isHighlighted ? 1.08 : 1,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 30,
                                }}
                            >
                                <TarotCard3D
                                    card={card}
                                    backImage={CARD_BACK_IMAGE}
                                    isCenter={isCenter || isHighlighted}
                                    onClick={() => onCardSelect?.(index)}
                                    width={cardW}
                                    height={cardH}
                                />

                                {/* 高亮边框 - 完整框住牌 */}
                                {isHighlighted && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl pointer-events-none"
                                        style={{
                                            border: '4px solid rgba(255,215,0,0.9)',
                                            boxShadow: '0 0 30px rgba(255,215,0,0.6), inset 0 0 15px rgba(255,215,0,0.2)'
                                        }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {hoverProgress > 0 && (
                                            <div
                                                className="absolute bottom-0 left-0 h-2 bg-neon-gold rounded-b-lg"
                                                style={{ width: `${hoverProgress}%` }}
                                            />
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* 状态提示 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm z-50 pointer-events-none drop-shadow-lg bg-black/50 px-4 py-2 rounded-full">
                    {isSelectMode ? (
                        <span className="text-neon-gold">
                            ☝️ 选牌模式：悬停 2 秒确认
                            {hoverProgress > 0 && ` (${Math.round(hoverProgress)}%)`}
                        </span>
                    ) : handState?.isFist ? (
                        <span className="text-yellow-400">✊ 握拳进入选牌模式</span>
                    ) : handState ? (
                        <div className="flex items-center gap-4 text-gray-300">
                            <span className={handState.scrollDirection === 'left' ? 'text-neon-gold font-bold' : ''}>
                                ← 向左
                            </span>
                            <span className="text-gray-500">|</span>
                            <span className={handState.scrollDirection === 'right' ? 'text-neon-gold font-bold' : ''}>
                                向右 →
                            </span>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-400">☝️ 食指悬停选牌</span>
                        </div>
                    ) : (
                        <span className="text-gray-400">🖱️ 拖动或滚轮浏览</span>
                    )}
                </div>

            </motion.div>
        </div>
    )
}

export default TarotCarousel
