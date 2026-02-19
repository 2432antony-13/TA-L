import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoOverlayProps {
    videoSrc: string
    onComplete: () => void
    blendMode?: 'screen' | 'normal' // screen for black bg, normal for transparent
}

export function VideoOverlay({ videoSrc, onComplete, blendMode = 'screen' }: VideoOverlayProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isVisible, setIsVisible] = useState(true)

    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [isMuted, setIsMuted] = useState(false) // 默认开启声音
    const [isPlaying, setIsPlaying] = useState(false) // 追踪播放状态

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // 设置由于浏览器限制，必须由用户交互才能播放有声视频
        video.volume = 0.4

        const handleEnded = () => {
            handleClose()
        }

        const handleCanPlay = () => {
            setIsLoading(false)
        }

        const handlePlay = () => {
            setIsPlaying(true)
        }

        const handlePause = () => {
            setIsPlaying(false)
        }

        const handleError = (e: any) => {
            console.error("Video Error:", e)
            setHasError(true)
            setIsLoading(false)
        }

        video.addEventListener('ended', handleEnded)
        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('error', handleError)
        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)

        // 尝试自动播放有声视频
        const playPromise = video.play()

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play was prevented. Showing Play button.", error)
                setIsPlaying(false)
                // 不自动静音，而是等待用户点击播放
            })
        }

        return () => {
            video.removeEventListener('ended', handleEnded)
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
        }
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(onComplete, 500)
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-start md:justify-center bg-black/80 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    {/* Loading Spinner */}
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="w-10 h-10 border-4 border-neon-gold border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-neon-gold font-mono text-sm">Loading Video...</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-red-400 pointer-events-none">
                            <p className="text-xl">⚠️ 视频加载失败</p>
                            <p className="text-sm mt-2">请检查 public/gesture-intro.mp4 是否存在</p>
                        </div>
                    )}

                    {/* 视频容器：手机端占上半屏，桌面端居中弹窗 */}
                    <div
                        className="
                            relative flex flex-col items-center
                            w-full h-1/2 md:w-2/3 md:h-auto md:max-h-[80vh]
                            p-3 md:p-4
                            border-b md:border border-neon-gold/30
                            md:rounded-2xl bg-black/40 backdrop-blur-sm
                            md:shadow-[0_0_30px_rgba(255,215,0,0.1)]
                        "
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            ref={videoRef}
                            src={videoSrc}
                            autoPlay
                            muted={isMuted}
                            playsInline
                            preload="metadata"
                            className={`w-full h-full object-contain md:rounded-xl ${blendMode === 'screen' ? 'mix-blend-screen' : ''}`}
                            onClick={togglePlay}
                        />

                        {/* Play Button Overlay */}
                        {!isPlaying && !isLoading && !hasError && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 group"
                                onClick={togglePlay}
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neon-gold/80 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.5)] group-hover:scale-110 transition-transform">
                                    <span className="text-3xl md:text-4xl ml-2 text-black">▶</span>
                                </div>
                            </motion.button>
                        )}
                    </div>

                    {/* 手机端下半区：控制按钮区域 */}
                    <div
                        className="flex flex-col items-center justify-center gap-4 flex-1 md:hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 静音按钮 - 手机端：位于视频下方，不遮挡头像 */}
                        <motion.button
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex items-center gap-2 px-5 py-3 bg-black/50 hover:bg-black/70 text-neon-gold rounded-full backdrop-blur-md border border-neon-gold/30 transition-all"
                            whileTap={{ scale: 0.9 }}
                        >
                            <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
                            <span className="text-sm">{isMuted ? '开启声音' : '静音'}</span>
                        </motion.button>

                        <motion.button
                            onClick={handleClose}
                            className="px-10 py-4 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-bold text-lg rounded-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ✨ 跳过指引
                        </motion.button>
                    </div>

                    {/* 桌面端：跳过 + 静音按钮（保持原样） */}
                    <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
                        <motion.button
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="fixed top-6 left-6 p-3 bg-black/40 hover:bg-black/60 text-neon-gold rounded-full backdrop-blur-md border border-neon-gold/30 transition-all z-20"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isMuted ? '🔇' : '🔊'}
                        </motion.button>
                        <motion.button
                            onClick={handleClose}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-bold text-lg rounded-full hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-105 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                        >
                            ✨ 跳过指引
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
