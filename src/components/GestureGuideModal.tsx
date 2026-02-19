// GestureGuideModal.tsx - 手势操作指引弹窗
import { motion, AnimatePresence } from 'framer-motion'

interface GestureGuideModalProps {
    isOpen: boolean
    onClose: () => void
}

export function GestureGuideModal({ isOpen, onClose }: GestureGuideModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* 背景遮罩 */}
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* 弹窗内容 */}
                    <motion.div
                        className="relative w-full max-w-lg bg-gray-900/90 border border-neon-gold/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* 装饰光效 */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-neon-gold/10 to-transparent pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-center text-neon-gold mb-2">
                                👋 手势控制指引
                            </h2>
                            <p className="text-center text-gray-400 text-sm mb-8">
                                像魔法师一样，隔空掌控命运的牌阵
                            </p>

                            <div className="space-y-6 mb-8">
                                {/* 1. 浏览 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-gold/30 transition-colors">
                                    <div className="text-4xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-full">
                                        ✋
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">浏览 (Browse)</h3>
                                        <p className="text-gray-400 text-sm">
                                            在摄像头范围内，<span className="text-neon-gold font-medium">手掌张开</span>放在<span className="text-neon-gold">右边向右滑牌</span>，<span className="text-neon-gold">左边向左滑牌</span>～
                                        </p>
                                    </div>
                                </div>

                                {/* 2. 选牌 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-gold/30 transition-colors">
                                    <div className="text-4xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-full">
                                        ☝️
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">选牌 (Select)</h3>
                                        <p className="text-gray-400 text-sm">
                                            想选中那张牌？<span className="text-neon-gold font-medium">竖起食指</span>，出现光标即可选牌！悬停 2 秒确认。
                                        </p>
                                    </div>
                                </div>

                                {/* 3. 握拳返回 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-gold/30 transition-colors">
                                    <div className="text-4xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-full">
                                        ✊
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">握拳返回 (Fist)</h3>
                                        <p className="text-gray-400 text-sm">
                                            <span className="text-neon-gold font-medium">握紧拳头</span>回到选牌模式继续抽牌，一共三张牌！
                                        </p>
                                    </div>
                                </div>

                                {/* 4. 洗牌 (底部小字) */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        💡 提示：在输入阶段<span className="text-gray-300">双手张开 👐</span> 可触发自动洗牌
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-bold text-lg rounded-xl hover:shadow-neon hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                我学会了 ✨
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
