// QuestionInput.tsx - 问题输入组件
import { useState } from 'react'
import { motion } from 'framer-motion'

interface QuestionInputProps {
    onSubmit: (question: string) => void
}

export function QuestionInput({ onSubmit }: QuestionInputProps) {
    const [question, setQuestion] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (question.trim()) {
            onSubmit(question.trim())
        }
    }

    return (
        <motion.div
            className="w-full min-h-screen flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="glass-panel p-8 rounded-3xl w-full max-w-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <div className="text-center mb-8">
                    <motion.h2
                        className="text-2xl md:text-3xl font-bold text-neon-gold mb-3"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        ✨ 在心中默念您的问题 ✨
                    </motion.h2>
                    <motion.p
                        className="text-gray-400 text-sm md:text-base"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        西西塔罗给你的生活加点料
                        <br />
                        <span className="text-xs text-gray-500 italic mt-2 block opacity-70">
                            *备注：问题详细，它解读得越贴近，也越能让你感知到“真实感”
                        </span>
                    </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                        className="relative"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="例如：我的事业发展方向是什么？我和TA的关系会如何发展？"
                            className="w-full h-40 px-6 py-4 bg-mystic-dark/80 border border-white/10 rounded-2xl text-starlight placeholder-gray-500 resize-none focus:outline-none focus:border-neon-gold/50 focus:ring-2 focus:ring-neon-gold/30 transition-all text-base pointer-events-auto"
                            autoFocus
                        />
                        {/* 装饰角标 */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-neon-gold/40 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-neon-gold/40 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-neon-gold/40 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-neon-gold/40 rounded-br-xl" />
                    </motion.div>

                    <motion.button
                        type="submit"
                        disabled={!question.trim()}
                        className="w-full py-4 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}
                    >
                        下一步：洗牌 🃏
                    </motion.button>

                </form>
            </motion.div>
        </motion.div>
    )
}

export default QuestionInput
