// ReadingLayout.tsx - 三张牌+问题+解读+追问的布局
import { motion, AnimatePresence } from 'framer-motion'
import type { DrawnCard } from '../data/tarotCards'
import { FollowUpChat } from './FollowUpChat'

interface ReadingLayoutProps {
    cards: DrawnCard[]
    question: string
    reading: string | null
    thinking?: string
    isLoading: boolean
    isStreaming?: boolean
    sessionId: string | null
    personality: 'T' | 'F' | null
    suggestedQuestions?: string[]
    onQuestionSubmit: (question: string) => void
    onReset: () => void
}

export function ReadingLayout({
    cards,
    question,
    reading,
    thinking,
    isLoading,
    isStreaming,
    sessionId,
    personality,
    suggestedQuestions = [],
    onQuestionSubmit,
    onReset,
}: ReadingLayoutProps) {
    const hasReading = reading !== null && reading.length > 0
    const hasThinking = thinking && thinking.length > 0

    return (
        <motion.div
            className="w-full min-h-screen flex flex-col lg:flex-row gap-6 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* 左侧面板：三张牌 + 问题 */}
            <motion.div
                className={`${hasReading ? 'lg:w-1/2' : 'w-full'} flex flex-col items-center justify-center`}
                layout
            >
                {/* 三张牌展示 */}
                {hasReading ? (
                    // 结果展示模式：统一面板
                    <div className="glass-panel p-8 rounded-3xl w-full flex flex-col items-center gap-8">
                        {/* 三张牌展示 */}
                        <motion.div
                            className="flex gap-2 md:gap-4 justify-center"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {cards.map((drawnCard, index) => (
                                <motion.div
                                    key={drawnCard.card.id}
                                    className="relative"
                                    initial={{ scale: 0, rotateY: 180 }}
                                    animate={{ scale: 1, rotateY: 0 }}
                                    transition={{
                                        delay: 0.3 + index * 0.2,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                >
                                    {/* 位置标签 */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neon-gold/70 whitespace-nowrap">
                                        {['过去', '现在', '未来'][index]}
                                    </div>

                                    {/* 卡片 */}
                                    <div
                                        className="w-20 h-32 md:w-28 md:h-44 lg:w-36 lg:h-56 rounded-xl overflow-hidden shadow-2xl"
                                        style={{
                                            boxShadow: '0 0 30px rgba(255, 215, 0, 0.25)',
                                        }}
                                    >
                                        <img
                                            src={drawnCard.card.image}
                                            alt={drawnCard.card.name}
                                            className={`w-full h-full object-contain ${drawnCard.isReversed ? 'rotate-180' : ''}`}
                                        />
                                    </div>

                                    {/* 卡片名称 */}
                                    <div className="mt-3 text-center">
                                        <p className="text-sm font-medium text-starlight">
                                            {drawnCard.card.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {drawnCard.isReversed ? '逆位' : '正位'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* 问题展示 */}
                        <div className="text-center border-t border-white/10 pt-6 w-full">
                            <p className="text-sm text-gray-400 mb-2">您的问题：</p>
                            <p className="text-starlight italic text-lg">"{question}"</p>
                        </div>
                    </div>
                ) : (
                    // 确认模式：显示卡牌和问题，等待用户确认
                    <div className="glass-panel p-8 rounded-3xl w-full flex flex-col items-center gap-8">
                        {/* 三张牌展示 */}
                        <motion.div
                            className="flex gap-2 md:gap-4 justify-center"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {cards.map((drawnCard, index) => (
                                <motion.div
                                    key={drawnCard.card.id}
                                    className="relative"
                                    initial={{ scale: 0, rotateY: 180 }}
                                    animate={{ scale: 1, rotateY: 0 }}
                                    transition={{
                                        delay: 0.3 + index * 0.2,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                >
                                    {/* 位置标签 */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neon-gold/70 whitespace-nowrap">
                                        {['过去', '现在', '未来'][index]}
                                    </div>

                                    {/* 卡片 */}
                                    <div
                                        className="w-20 h-32 md:w-28 md:h-44 lg:w-36 lg:h-56 rounded-xl overflow-hidden shadow-2xl"
                                        style={{
                                            boxShadow: '0 0 30px rgba(255, 215, 0, 0.25)',
                                        }}
                                    >
                                        <img
                                            src={drawnCard.card.image}
                                            alt={drawnCard.card.name}
                                            className={`w-full h-full object-contain ${drawnCard.isReversed ? 'rotate-180' : ''}`}
                                        />
                                    </div>

                                    {/* 卡片名称 */}
                                    <div className="mt-3 text-center">
                                        <p className="text-sm font-medium text-starlight">
                                            {drawnCard.card.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {drawnCard.isReversed ? '逆位' : '正位'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* 问题展示 */}
                        <div className="text-center border-t border-white/10 pt-6 w-full">
                            <p className="text-sm text-gray-400 mb-2">您的问题：</p>
                            <p className="text-starlight italic text-lg">"{question}"</p>
                        </div>

                        {/* 开始解读按钮 */}
                        <motion.button
                            onClick={() => onQuestionSubmit(question)}
                            disabled={isLoading}
                            className="w-full max-w-md py-4 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon transition-all duration-300 transform hover:scale-[1.02]"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        ✨
                                    </motion.span>
                                    解读中...
                                </span>
                            ) : (
                                '🔮 开始解读'
                            )}
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* 右侧面板：AI 解读结果 */}
            <AnimatePresence>
                {hasReading && (
                    <motion.div
                        className="lg:w-1/2 flex flex-col h-auto lg:h-full lg:max-h-[calc(100vh-2rem)]"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    >
                        <div className="glass-panel rounded-2xl p-6 pb-32 lg:pb-6 flex-1 lg:overflow-y-auto">
                            {/* 标题 */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <span className="text-2xl">🔮</span>
                                <h2 className="text-xl text-neon-gold font-light tracking-wide">
                                    命运的指引
                                </h2>
                            </div>

                            {/* 思考过程展示 (AI Thinking) */}
                            {hasThinking && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-8 overflow-hidden"
                                >
                                    <div className="bg-black/30 rounded-lg p-4 border border-neon-gold/20 text-xs text-gray-500 font-mono">
                                        <p className="mb-2 flex items-center gap-2 text-neon-gold/70">
                                            <span className="animate-pulse">🧠</span>
                                            深度思考中...
                                        </p>
                                        <p className="whitespace-pre-wrap leading-tight opacity-80">
                                            {thinking}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* 解读内容 */}
                            <motion.div
                                className="prose prose-invert max-w-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="text-starlight/90 leading-relaxed whitespace-pre-wrap space-y-4">
                                    {reading.split('\n').map((paragraph, i) => (
                                        <motion.p
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + i * 0.1 }}
                                            className={paragraph.startsWith('#') ? 'text-neon-gold font-semibold' : ''}
                                        >
                                            {paragraph}
                                        </motion.p>
                                    ))}
                                </div>
                            </motion.div>

                            {/* 追问区域 — 仅在解读完成且非流式传输时显示 */}
                            {hasReading && !isStreaming && (
                                <FollowUpChat
                                    sessionId={sessionId}
                                    originalQuestion={question}
                                    cards={cards.map(dc => ({ name: dc.card.name, isReversed: dc.isReversed }))}
                                    personality={personality}
                                    initialReading={reading || ''}
                                    initialSuggestions={suggestedQuestions}
                                />
                            )}

                            {/* 重新开始按钮 */}
                            <motion.div
                                className="mt-8 pt-4 border-t border-white/10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                            >
                                <button
                                    onClick={onReset}
                                    className="w-full py-3 border border-neon-gold/50 text-neon-gold rounded-xl hover:bg-neon-gold/10 transition-all duration-300"
                                >
                                    🔄 重新占卜
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ReadingLayout
