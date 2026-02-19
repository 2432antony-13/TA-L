// PersonalitySelector.tsx - MBTI T/F 性格选择组件
import { motion } from 'framer-motion'

export type PersonalityType = 'T' | 'F'

interface PersonalitySelectorProps {
    onSelect: (type: PersonalityType) => void
}

export function PersonalitySelector({ onSelect }: PersonalitySelectorProps) {
    return (
        <motion.div
            className="w-full min-h-screen flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="glass-panel p-8 rounded-3xl w-full max-w-3xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                {/* 标题 */}
                <div className="text-center mb-10">
                    <motion.h2
                        className="text-2xl md:text-3xl font-bold text-neon-gold mb-3"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        🌟 选择你的解读风格
                    </motion.h2>
                    <motion.p
                        className="text-gray-400 text-sm md:text-base"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        你更偏向于理性分析，还是感性共情？
                    </motion.p>
                </div>

                {/* T/F 选择卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* T 型 - 理性思考 */}
                    <motion.button
                        onClick={() => onSelect('T')}
                        className="group relative p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/30 border border-cyan-500/30 rounded-2xl hover:border-cyan-400/60 transition-all duration-300 text-left"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">🧠</span>
                            <div>
                                <h3 className="text-xl font-bold text-cyan-300">T 型 · 理性思考</h3>
                                <p className="text-xs text-cyan-500/70">Thinking</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                            我更喜欢<strong className="text-cyan-200">客观、直接</strong>的分析。
                            <br />
                            告诉我问题在哪，给我<strong className="text-cyan-200">解决方案</strong>。
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 text-xs bg-cyan-900/50 text-cyan-300 rounded-full">逻辑分析</span>
                            <span className="px-2 py-1 text-xs bg-cyan-900/50 text-cyan-300 rounded-full">直球建议</span>
                            <span className="px-2 py-1 text-xs bg-cyan-900/50 text-cyan-300 rounded-full">行动导向</span>
                        </div>
                        {/* 悬停指示 */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-cyan-400 text-sm">选择 →</span>
                        </div>
                    </motion.button>

                    {/* F 型 - 感性情感 */}
                    <motion.button
                        onClick={() => onSelect('F')}
                        className="group relative p-6 bg-gradient-to-br from-pink-900/40 to-rose-900/30 border border-pink-500/30 rounded-2xl hover:border-pink-400/60 transition-all duration-300 text-left"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(244, 114, 182, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">💖</span>
                            <div>
                                <h3 className="text-xl font-bold text-pink-300">F 型 · 感性情感</h3>
                                <p className="text-xs text-pink-500/70">Feeling</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                            我更希望被<strong className="text-pink-200">理解和共情</strong>。
                            <br />
                            用<strong className="text-pink-200">温暖的方式</strong>给我力量和方向。
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 text-xs bg-pink-900/50 text-pink-300 rounded-full">情感共鸣</span>
                            <span className="px-2 py-1 text-xs bg-pink-900/50 text-pink-300 rounded-full">温柔治愈</span>
                            <span className="px-2 py-1 text-xs bg-pink-900/50 text-pink-300 rounded-full">心灵支持</span>
                        </div>
                        {/* 悬停指示 */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-pink-400 text-sm">选择 →</span>
                        </div>
                    </motion.button>
                </div>

                {/* 敬请期待文案 */}
                <motion.div
                    className="text-center pt-6 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <p className="text-xs text-gray-500">
                        ✨ 敬请期待：12星座 & 16种 MBTI 的疗愈正在路上...
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export default PersonalitySelector
