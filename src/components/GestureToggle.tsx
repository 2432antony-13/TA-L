// GestureToggle.tsx - Toggle button with camera preview
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGesture } from '../context/GestureContext'
import { GestureGuideModal } from './GestureGuideModal'

const isSecureContext = () => {
    if (typeof window === 'undefined') return false
    return window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
}

interface GestureToggleProps {
    currentPhase?: string
}

export function GestureToggle({ currentPhase }: GestureToggleProps = {}) {
    const { isEnabled, isReady, error, toggleGesture, videoRef } = useGesture()
    const canUseCamera = isSecureContext()
    const [showGuide, setShowGuide] = useState(false)
    const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768)

    // 监听窗口尺寸切换手机/桌面布局
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])


    // 每次开启手势时，都弹出指引
    useEffect(() => {
        if (isEnabled) {
            setShowGuide(true)
        }
    }, [isEnabled])

    const handleCloseGuide = () => {
        setShowGuide(false)
        localStorage.setItem('hasSeenGestureGuide_v2', 'true')
    }

    return (
        <>
            {/* 新手指引弹窗 */}
            <GestureGuideModal isOpen={showGuide} onClose={handleCloseGuide} />

            {/* Camera Preview Window - 单一 video，响应式布局 */}
            <AnimatePresence>
                {isEnabled && (
                    <motion.div
                        className={
                            isMobileView
                                // 手机：顶部较大预览框，可覆盖标题区域
                                ? "fixed top-0 left-0 right-0 z-50 overflow-hidden border-b border-white/20 shadow-2xl"
                                // 桌面：右下角可拖拽
                                : "fixed bottom-24 right-6 z-50 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-move"
                        }
                        {...(isMobileView
                            ? {
                                initial: { opacity: 0, y: -220 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -220 },
                                style: { height: 220 },
                            }
                            : {
                                initial: { opacity: 0, scale: 0.8, x: 20 },
                                animate: { opacity: 1, scale: 1, x: 0 },
                                exit: { opacity: 0, scale: 0.8, x: 20 },
                                style: { width: 320, height: 240 },
                                drag: true,
                                dragMomentum: false,
                                whileDrag: { scale: 1.05 },
                            }
                        )}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <video
                            ref={videoRef}
                            className={`w-full h-full object-cover transform scale-x-[-1] ${isMobileView ? 'brightness-[0.7]' : 'brightness-[0.6] opacity-80'}`}
                            autoPlay
                            playsInline
                            webkit-playsinline="true"
                            muted
                            width="320"
                            height="240"
                        />

                        {/* Overlay */}
                        <div className={`absolute inset-0 pointer-events-none ${isMobileView
                            ? 'bg-gradient-to-r from-black/60 via-transparent to-black/60'
                            : 'bg-gradient-to-t from-black/50 to-transparent'
                            }`} />

                        {/* Status */}
                        <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none">
                            <motion.div
                                className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-yellow-400'}`}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="text-xs text-white/80 font-medium">
                                {isReady ? '手势追踪中' : '摄像头加载中...'}
                            </span>
                        </div>

                        {/* 桌面端才显示拖动提示 */}
                        {!isMobileView && (
                            <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-white/30">
                                按住拖动
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                <p className="text-xs text-red-400 text-center px-4">{error}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 帮助按钮 - 仅在开启时显示 */}
            <AnimatePresence>
                {isEnabled && (
                    <motion.button
                        className="absolute -top-12 right-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-sm text-gray-300 transition-colors"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        onClick={() => setShowGuide(true)}
                        title="查看手势教程"
                    >
                        ?
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Toggle Button Container */}
            <div className="fixed bottom-8 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-4">
                {/* 安全上下文警告 */}
                <AnimatePresence>
                    {!canUseCamera && (
                        <motion.div
                            className="glass-panel px-4 py-3 rounded-xl max-w-[280px] text-right"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <p className="text-xs text-yellow-400 mb-1">⚠️ 摄像头需要安全连接</p>
                            <p className="text-xs text-gray-400">
                                请使用 <span className="text-neon-gold">localhost:5176</span> 访问
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toggle Button */}
                <motion.button
                    onClick={canUseCamera ? toggleGesture : undefined}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl
                        backdrop-blur-xl border-2 transition-colors duration-300
                        ${!canUseCamera
                            ? 'bg-gray-800/50 border-gray-600/50 cursor-not-allowed opacity-50'
                            : isEnabled
                                ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-purple-400/50 shadow-lg shadow-purple-500/30'
                                : 'bg-white/10 border-white/20 hover:bg-white/20'
                        }`}
                    whileHover={canUseCamera ? { scale: 1.1 } : {}}
                    whileTap={canUseCamera ? { scale: 0.95 } : {}}
                >
                    {isEnabled ? '✋' : '🖐️'}

                    {/* Pulse ring when active */}
                    {isEnabled && (
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-purple-400"
                            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}
                </motion.button>

                {/* Hint text - 醒目提醒，只在 IDLE 和 PERSONALITY_SELECTION 阶段显示 */}
                <AnimatePresence>
                    {!isEnabled && canUseCamera &&
                        (currentPhase === 'IDLE' || currentPhase === 'PERSONALITY_SELECTION') && (
                            <motion.div
                                className="flex items-center gap-2 bg-gradient-to-r from-neon-gold/20 to-purple-500/20 border border-neon-gold/40 rounded-full px-4 py-2 shadow-lg"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <motion.span
                                    className="text-neon-gold text-lg"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    👆
                                </motion.span>
                                <span className="text-sm text-white font-medium">
                                    试试<span className="text-neon-gold">手势模式</span>！
                                </span>
                                <motion.span
                                    className="text-neon-gold"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                >
                                    →
                                </motion.span>
                            </motion.div>
                        )}
                </AnimatePresence>
            </div>
        </>
    )
}

export default GestureToggle
