// HistorySidebar.tsx — 历史记录侧边栏
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HistoryRecord {
    id: string
    timestamp: number
    question: string
    personality: 'T' | 'F' | null
    cards: { name: string; isReversed: boolean }[]
    reading: string
    thinking?: string
    followUps?: { q: string; a: string }[]
}

interface HistorySidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
    const [records, setRecords] = useState<HistoryRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const fetchHistory = useCallback(async () => {
        const deviceId = localStorage.getItem('tarot_device_uuid')
        if (!deviceId) return

        setIsLoading(true)
        try {
            const res = await fetch('/api/history', {
                headers: { 'X-Device-Id': deviceId }
            })
            if (res.ok) {
                const data = await res.json()
                setRecords(data)
            }
        } catch (e) {
            console.error('Failed to fetch history:', e)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) fetchHistory()
    }, [isOpen, fetchHistory])

    const formatDate = (ts: number) => {
        const d = new Date(ts)
        return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 遮罩 */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* 侧边栏 */}
                    <motion.div
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#0a0a1a] to-[#111128] border-l border-white/10 z-50 flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* 头部 */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📜</span>
                                <h2 className="text-lg text-neon-gold font-light">我的占卜记录</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 内容 */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoading ? (
                                <div className="text-center text-gray-500 py-8">
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        ✨ 加载中...
                                    </motion.span>
                                </div>
                            ) : records.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <p className="text-2xl mb-2">🔮</p>
                                    <p>暂无占卜记录</p>
                                    <p className="text-xs mt-1">完成一次占卜后，记录会自动保存在这里</p>
                                </div>
                            ) : (
                                records.map((record) => (
                                    <motion.div
                                        key={record.id}
                                        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                                        layout
                                    >
                                        {/* 摘要行 */}
                                        <button
                                            onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                            className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-starlight truncate">{record.question}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">{formatDate(record.timestamp)}</span>
                                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                                            {record.personality === 'T' ? '理性' : '感性'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1 mt-2">
                                                        {record.cards?.map((card, i) => (
                                                            <span key={i} className="text-xs px-2 py-0.5 bg-neon-gold/10 text-neon-gold/70 rounded-full truncate max-w-[100px]">
                                                                {card.name}{card.isReversed ? '逆' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <motion.span
                                                    animate={{ rotate: expandedId === record.id ? 180 : 0 }}
                                                    className="text-gray-500 text-sm mt-1 flex-shrink-0"
                                                >
                                                    ▼
                                                </motion.span>
                                            </div>
                                        </button>

                                        {/* 展开内容 */}
                                        <AnimatePresence>
                                            {expandedId === record.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/5"
                                                >
                                                    <div className="p-4 text-sm text-starlight/80 whitespace-pre-wrap leading-relaxed">
                                                        {record.reading}
                                                    </div>

                                                    {/* 追问记录 */}
                                                    {record.followUps && record.followUps.length > 0 && (
                                                        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                                                            <p className="text-xs text-purple-300/70 font-bold">—— 深度追问 ——</p>
                                                            {record.followUps.map((fu, i) => (
                                                                <div key={i} className="text-xs space-y-2">
                                                                    <p className="text-purple-200/90 font-medium">Q: {fu.q}</p>
                                                                    <p className="text-gray-300 pl-2 leading-relaxed whitespace-pre-wrap border-l-2 border-purple-500/20">A: {fu.a}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* 底部 */}
                        <div className="p-4 border-t border-white/10 text-center">
                            <p className="text-xs text-gray-500">记录保存在本设备，最多保留 50 条</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default HistorySidebar
