// GestureGuideModal.tsx - 手势操作指引弹窗
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

interface GestureGuideModalProps {
    isOpen: boolean
    onClose: () => void
}

export function GestureGuideModal({ isOpen, onClose }: GestureGuideModalProps) {
    const { t } = useLanguage()
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
                                {t('gestureGuide')}
                            </h2>
                            <p className="text-center text-gray-400 text-sm mb-8">
                                {t('gestureGuideHint')}
                            </p>

                            <div className="space-y-6 mb-8">
                                {/* 1. 浏览 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-gold/30 transition-colors">
                                    <div className="text-4xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-full">
                                        ✋
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{t('browse')}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {t('browseGuide')}
                                        </p>
                                    </div>
                                </div>

                                {/* 2. 选牌 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-gold/30 transition-colors">
                                    <div className="text-4xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-full">
                                        ☝️
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{t('selectCard')}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {t('selectGuide')}
                                        </p>
                                    </div>
                                </div>

                                {/* 3. 握拳返回 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-gold/30 transition-colors">
                                    <div className="text-4xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-full">
                                        ✊
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{t('fist')}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {t('fistGuide')}
                                        </p>
                                    </div>
                                </div>

                                {/* 4. 洗牌 (底部小字) */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        {t('shuffleTip')}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-bold text-lg rounded-xl hover:shadow-neon hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {t('gotIt')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
