// PersonalitySelector.tsx - MBTI T/F 性格选择组件
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProfileModal } from './ProfileModal'
import { useLanguage } from '../i18n/LanguageContext'

export type PersonalityType = 'T' | 'F'

interface PersonalitySelectorProps {
    onSelect: (type: PersonalityType) => void
    onStartInterview?: (type: PersonalityType) => void
    existingProfile?: string | null
}

export function PersonalitySelector({ onSelect, onStartInterview, existingProfile }: PersonalitySelectorProps) {
    const { t } = useLanguage()
    const [selectedType, setSelectedType] = useState<PersonalityType | null>(null)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

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
                <AnimatePresence mode="wait">
                    {!selectedType ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -30 }}
                        >
                            {/* 标题 */}
                            <div className="text-center mb-10">
                                <motion.h2
                                    className="text-2xl md:text-3xl font-bold text-neon-gold mb-3"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {t('selectStyle')}
                                </motion.h2>
                                <motion.p
                                    className="text-gray-400 text-sm md:text-base"
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {t('selectStyleHint')}
                                </motion.p>
                            </div>

                            {/* T/F 选择卡片 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* T 型 - 理性思考 */}
                                <motion.button
                                    onClick={() => setSelectedType('T')}
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
                                            <h3 className="text-xl font-bold text-cyan-300">{t('thinkingType')}</h3>
                                            <p className="text-xs text-cyan-500/70">Thinking</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                        {t('thinkingDesc')}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 text-xs bg-cyan-900/50 text-cyan-300 rounded-full">{t('logicAnalysis')}</span>
                                        <span className="px-2 py-1 text-xs bg-cyan-900/50 text-cyan-300 rounded-full">{t('directAdvice')}</span>
                                        <span className="px-2 py-1 text-xs bg-cyan-900/50 text-cyan-300 rounded-full">{t('actionOriented')}</span>
                                    </div>
                                    {/* 悬停指示 */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-cyan-400 text-sm">{t('choose')} →</span>
                                    </div>
                                </motion.button>

                                {/* F 型 - 感性情感 */}
                                <motion.button
                                    onClick={() => setSelectedType('F')}
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
                                            <h3 className="text-xl font-bold text-pink-300">{t('feelingType')}</h3>
                                            <p className="text-xs text-pink-500/70">Feeling</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                        {t('feelingDesc')}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 text-xs bg-pink-900/50 text-pink-300 rounded-full">{t('emotionalResonance')}</span>
                                        <span className="px-2 py-1 text-xs bg-pink-900/50 text-pink-300 rounded-full">{t('gentleSupport')}</span>
                                        <span className="px-2 py-1 text-xs bg-pink-900/50 text-pink-300 rounded-full">{t('innerClarity')}</span>
                                    </div>
                                    {/* 悬停指示 */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-pink-400 text-sm">{t('choose')} →</span>
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* 第二步：选择继续占卜或进入访谈 */}
                            <div className="relative text-center mb-8">
                                {existingProfile && (
                                    <button 
                                        onClick={() => setIsProfileModalOpen(true)}
                                        className="absolute -top-4 right-0 px-3 py-1.5 bg-white/5 border border-neon-gold/30 rounded-full text-xs text-neon-gold hover:bg-neon-gold/10 hover:border-neon-gold/60 transition-all flex items-center gap-1"
                                    >
                                        <span className="text-sm">👁️</span> 
                                        {t('myProfile')}
                                    </button>
                                )}
                                <motion.h2
                                    className="text-2xl md:text-3xl font-bold text-neon-gold mb-3"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {t('selectedStyle', { style: selectedType === 'T' ? t('thinkingType') : t('feelingType') })}
                                </motion.h2>
                                <motion.p
                                    className="text-gray-400 text-sm md:text-base"
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {t('profileQuestion')} {existingProfile ? t('profileExisting') : t('profileNew')}
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* 继续占卜 */}
                                <motion.button
                                    onClick={() => onSelect(selectedType)}
                                    className="group relative p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/15 rounded-2xl hover:border-white/30 transition-all duration-300 text-left"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">🔮</span>
                                        <h3 className="text-lg font-bold text-starlight">{t('directReading')}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {existingProfile
                                            ? t('directReadingExisting')
                                            : t('directReadingNew')
                                        }
                                    </p>
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-gray-400 text-sm">{t('continue')} →</span>
                                    </div>
                                </motion.button>

                                {/* ENTJ 人格访谈 */}
                                {onStartInterview && (
                                    <motion.button
                                        onClick={() => onStartInterview(selectedType)}
                                        className="group relative p-6 bg-gradient-to-br from-purple-900/40 to-amber-900/30 border border-neon-gold/30 rounded-2xl hover:border-neon-gold/60 transition-all duration-300 text-left"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)' }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl">{existingProfile ? '🔄' : '🪞'}</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-neon-gold">{existingProfile ? t('retake') : t('interview')}</h3>
                                                <p className="text-xs text-neon-gold/50">{existingProfile ? t('regenerateProfile') : t('quickQuestions')}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {existingProfile
                                                ? t('retakeDescription')
                                                : t('interviewDescription')
                                            }
                                        </p>
                                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-neon-gold text-sm">{t('begin')} →</span>
                                        </div>
                                    </motion.button>
                                )}
                            </div>

                            {/* 返回重选 */}
                            <div className="text-center">
                                <button
                                    onClick={() => setSelectedType(null)}
                                    className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                                >
                                    ← {t('reselectStyle')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* 历史画像模态框 */}
            {existingProfile && (
                <ProfileModal 
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    profileText={existingProfile}
                />
            )}
        </motion.div>
    )
}

export default PersonalitySelector
