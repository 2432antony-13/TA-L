// ProfileModal.tsx - 用户个性画像展示模态框
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    profileText: string
}

export function ProfileModal({ isOpen, onClose, profileText }: ProfileModalProps) {
    if (!profileText) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="relative w-full max-w-2xl bg-[#0a0f1c]/90 border border-neon-gold/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(255,215,0,0.1)] overflow-y-auto max-h-[85vh]"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()} // 阻止点击冒泡关闭
                    >
                        {/* 关闭按钮 */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all z-10"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl md:text-2xl font-bold text-neon-gold text-center mb-6">
                            你的专属个性画像
                        </h3>

                        <div className="bg-white/5 border border-neon-gold/20 rounded-xl p-5 mb-4">
                            {profileText.split('\n').map((line, i) => {
                                if (i === 0 && line.includes('用户个性画像')) {
                                    // [用户个性画像] 标题行，跳过
                                    return null
                                }
                                if (line.trim() === '') return <div key={i} className="h-3" />
                                if (line.startsWith('综合印象:')) {
                                    return (
                                        <p key={i} className="text-sm text-gray-300 leading-relaxed mt-2 italic shadow-sm">
                                            {line}
                                        </p>
                                    )
                                }
                                // 维度行
                                const colonIdx = line.indexOf(':')
                                if (colonIdx > 0 && !line.startsWith('综合印象:')) {
                                    const dim = line.slice(0, colonIdx)
                                    const rest = line.slice(colonIdx + 1).trim()
                                    const dashIdx = rest.indexOf('—')
                                    const label = dashIdx > 0 ? rest.slice(0, dashIdx).trim() : rest
                                    const desc = dashIdx > 0 ? rest.slice(dashIdx + 1).trim() : ''
                                    return (
                                        <div key={i} className="mb-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold tracking-wider text-neon-gold/80">{dim}</span>
                                                <span className="text-sm text-starlight font-bold">{label}</span>
                                            </div>
                                            {desc && (
                                                <span className="text-sm text-gray-400 block pl-1"> {desc}</span>
                                            )}
                                        </div>
                                    )
                                }
                                return (
                                    <p key={i} className="text-sm text-gray-300 leading-relaxed">
                                        {line}
                                    </p>
                                )
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
