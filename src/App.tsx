// App.tsx - Main application with complete tarot reading flow
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History } from 'lucide-react'
import { allCards, drawRandomCard, type DrawnCard } from './data/tarotCards'
import {
  TarotCarousel,
  RevealedCard,
  HandCursor,
  GestureToggle,
  ShuffleAnimation,
  DrawnCardsDisplay,
  ReadingLayout,
  GuidanceCharacter,
  HistorySidebar,
  VideoOverlay,
  PersonalityInterview,
  LanguageToggle,
} from './components'
import { QuestionInput } from './components/QuestionInput'
import { PersonalitySelector, type PersonalityType } from './components/PersonalitySelector'
import { GestureProvider, useGesture } from './context/GestureContext'
import { TarotProvider } from './context/TarotContext'
import { useAIReading } from './hooks/useAIReading'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useLanguage } from './i18n/LanguageContext'
import { getCardName } from './i18n/tarotTranslations'

type AppPhase = 'IDLE' | 'PERSONALITY_SELECTION' | 'INTERVIEW' | 'QUESTION_INPUT' | 'SHUFFLING' | 'DRAWING' | 'CARD_REVEAL' | 'READING'

function AppContent() {
  const { language, t } = useLanguage()
  const [phase, setPhase] = useState<AppPhase>('IDLE')
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [currentRevealedCard, setCurrentRevealedCard] = useState<DrawnCard | null>(null)
  const [question, setQuestion] = useState('')
  // reading 状态现在由 hook 的 result 对象管理，不再单独维护
  const [isFlipping, setIsFlipping] = useState(false)
  const [personality, setPersonality] = useState<PersonalityType | null>(null)
  const [luckyNumber, setLuckyNumber] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [interviewProfile, setInterviewProfile] = useState<string | null>(() =>
    localStorage.getItem(`tarot_interview_profile_${language}`),
  )

  const jumpToCardRef = useRef<((index: number) => void) | null>(null)
  const { handState, isEnabled } = useGesture()
  const { getReading, isLoading, isStreaming, result, resetResult } = useAIReading()

  useEffect(() => {
    setInterviewProfile(localStorage.getItem(`tarot_interview_profile_${language}`))
  }, [language])

  // 幸运数字提交
  const handleLuckySubmit = useCallback(() => {
    const num = parseInt(luckyNumber, 10)
    if (isNaN(num) || num < 1) return
    const targetIndex = Math.min(num, 78) - 1
    jumpToCardRef.current?.(targetIndex)
    setLuckyNumber('')
  }, [luckyNumber])


  // 检测双手张开触发洗牌
  const shuffleTriggeredRef = useRef(false)

  useEffect(() => {
    if (!isEnabled) return

    // 当手势模式为 BOTH_HANDS_OPEN 且在 QUESTION_INPUT 阶段触发洗牌
    if (handState.action === 'SHUFFLE' && phase === 'QUESTION_INPUT' && !shuffleTriggeredRef.current) {
      shuffleTriggeredRef.current = true
      setPhase('SHUFFLING')
    }
  }, [handState.action, isEnabled, phase])

  // 洗牌完成后进入抽牌阶段
  const handleShuffleComplete = useCallback(() => {
    setPhase('DRAWING')
    shuffleTriggeredRef.current = false
  }, [])

  // 手动开始（如果不使用手势）
  const handleStartDrawing = useCallback(() => {
    if (phase === 'IDLE') {
      setPhase('PERSONALITY_SELECTION')
    }
  }, [phase])

  // 处理性格选择（直接占卜，跳过访谈）
  const handlePersonalitySelect = useCallback((type: PersonalityType) => {
    setPersonality(type)
    setPhase('QUESTION_INPUT')
  }, [])

  // 处理进入人格访谈
  const handleStartInterview = useCallback((type: PersonalityType) => {
    setPersonality(type)
    setPhase('INTERVIEW')
  }, [])

  // 访谈完成，保存画像到 state 和 localStorage
  const handleInterviewComplete = useCallback((profile: string) => {
    setInterviewProfile(profile)
    localStorage.setItem(`tarot_interview_profile_${language}`, profile)
    setPhase('QUESTION_INPUT')
  }, [language])

  // 访谈跳过
  const handleInterviewSkip = useCallback(() => {
    setPhase('QUESTION_INPUT')
  }, [])

  // 处理问题提交
  const handleQuestionInputSubmit = useCallback((submittedQuestion: string) => {
    setQuestion(submittedQuestion)
    setPhase('SHUFFLING')
  }, [])

  // 抽牌
  const handleSelectCard = useCallback(() => {
    if (isFlipping || drawnCards.length >= 3) return

    setIsFlipping(true)
    setTimeout(() => {
      const excludeIds = drawnCards.map(dc => dc.card.id)
      const drawn = drawRandomCard(excludeIds)
      drawn.isRevealed = true

      setCurrentRevealedCard(drawn)
      setPhase('CARD_REVEAL')
      setIsFlipping(false)
    }, 300)
  }, [isFlipping, drawnCards])

  // 确认当前牌，继续抽或进入解读
  const handleConfirmCard = useCallback(() => {
    if (!currentRevealedCard) return

    const newDrawnCards = [...drawnCards, currentRevealedCard]
    setDrawnCards(newDrawnCards)
    setCurrentRevealedCard(null)

    if (newDrawnCards.length >= 3) {
      setPhase('READING')
    } else {
      setPhase('DRAWING')
    }
  }, [currentRevealedCard, drawnCards])

  // 提交问题获取解读
  const handleQuestionSubmit = useCallback(async (q: string) => {
    setQuestion(q)

    try {
      const positions = [t('past'), t('present'), t('future')]
      const savedId = await getReading({
        cards: drawnCards.map((dc, i) => ({
          name: getCardName(dc.card, language),
          isReversed: dc.isReversed,
          position: positions[i]
        })),
        question: q,
        personality: personality,
        interviewProfile: interviewProfile ?? undefined,
        language,
      })
      setSessionId(savedId || crypto.randomUUID())
    } catch (error) {
      console.error('Reading failed:', error)
      alert(t('apiFailed', { message: error instanceof Error ? error.message : t('unknownError') }))
    }
  }, [drawnCards, getReading, personality, interviewProfile, language, t])


  // 重置开始新一轮（保留 interviewProfile，不清除画像）
  const handleReset = useCallback(() => {
    setPhase('PERSONALITY_SELECTION')
    setDrawnCards([])
    setCurrentRevealedCard(null)
    setQuestion('')
    resetResult()  // 重置 API 结果，避免显示旧数据
    setPersonality(null)
    setSessionId(null)
    setLuckyNumber('')
    setIsFlipping(false)
    shuffleTriggeredRef.current = false
  }, [resetResult])


  const [showIntro, setShowIntro] = useState(
    () => localStorage.getItem('ta-l-intro-seen') !== 'true',
  )

  const handleIntroComplete = () => {
    localStorage.setItem('ta-l-intro-seen', 'true')
    setShowIntro(false)
  }

  useKeyboardShortcuts(phase, handleStartDrawing, handleSelectCard, handleConfirmCard)

  return (
    <div className={`relative w-full flex flex-col items-center ${phase === 'QUESTION_INPUT' || phase === 'READING' ? '' : 'select-none'} ${phase === 'READING' ? 'h-screen overflow-y-auto overflow-x-hidden' : 'overflow-hidden justify-center h-screen'
      } p-4`}>
      <LanguageToggle />

      {/* 视频引导遮罩 (仅首次访问显示) */}
      {showIntro && (
        <VideoOverlay
          videoSrc="/gesture-intro.mp4"
          onComplete={handleIntroComplete}
          blendMode="normal"
        />
      )}

      {/* 背景粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-neon-gold rounded-full blur-[1px] animate-float opacity-70" />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-plasma-blue rounded-full blur-[1px] animate-float opacity-50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/5 w-1 h-1 bg-starlight rounded-full blur-[1px] animate-float opacity-40" style={{ animationDelay: '2s' }} />
      </div>

      {/* 洗牌动画 */}
      <ShuffleAnimation
        isActive={phase === 'SHUFFLING'}
        onComplete={handleShuffleComplete}
      />

      {/* 标题 - IDLE 和 DRAWING 阶段显示 */}
      <AnimatePresence>
        {(phase === 'IDLE' || phase === 'DRAWING') && (
          <motion.div
            className="z-10 text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h1 className="font-black text-3xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-starlight via-gray-200 to-gray-500 py-2 leading-relaxed"
              style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
              {t('appTitle')}
            </h1>
            <h2 className="font-light tracking-[0.3em] md:tracking-[0.5em] text-neon-gold/70 uppercase text-sm md:text-lg mt-3"
              style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}>
              {t('appSubtitle')}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 已抽牌展示 */}
      {(phase === 'DRAWING' || phase === 'CARD_REVEAL') && drawnCards.length > 0 && (
        <DrawnCardsDisplay cards={drawnCards} compact={true} />
      )}

      {/* 主内容区域 */}
      <div className="relative w-full max-w-7xl flex flex-col items-center justify-center z-10">
        {/* IDLE 阶段 - 开始按钮 */}
        {phase === 'IDLE' && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-gray-400 mb-6">{t('idlePrompt')}</p>

            <button
              onClick={handleStartDrawing}
              className="px-8 py-4 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-semibold rounded-xl hover:shadow-neon transition-all duration-300"
            >
              {t('startReading')}
            </button>
            <p className="text-sm text-gray-500 mt-3">{t('spaceToStart')}</p>
          </motion.div>
        )}


        {/* PERSONALITY_SELECTION 阶段 - 性格选择 */}
        {phase === 'PERSONALITY_SELECTION' && (
          <PersonalitySelector
            onSelect={handlePersonalitySelect}
            onStartInterview={handleStartInterview}
            existingProfile={interviewProfile}
          />
        )}

        {/* INTERVIEW 阶段 - 人格访谈 */}
        {phase === 'INTERVIEW' && (
          <PersonalityInterview
            onComplete={handleInterviewComplete}
            onSkip={handleInterviewSkip}
          />
        )}

        {/* QUESTION_INPUT 阶段 - 问题输入 */}
        {phase === 'QUESTION_INPUT' && (
          <QuestionInput onSubmit={handleQuestionInputSubmit} />
        )}

        {/* SHUFFLING 阶段 - 洗牌动画 */}
        {phase === 'SHUFFLING' && (
          <ShuffleAnimation isActive={true} onComplete={handleShuffleComplete} />
        )}

        {/* DRAWING 阶段 - 轮播抽牌 */}
        {phase === 'DRAWING' && (
          <>
            {/* 幸运数字输入 - 完全独立的组件 */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder={t('luckyNumber')}
                aria-label={t('luckyNumber')}
                value={luckyNumber}
                onChange={(e) => setLuckyNumber(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleLuckySubmit()}
                className="w-28 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-gold/50 transition-colors"
              />
              <button
                onClick={handleLuckySubmit}
                className="px-4 py-2 text-sm bg-neon-gold/20 hover:bg-neon-gold/40 border border-neon-gold/30 rounded-lg text-neon-gold transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
            <TarotCarousel
              cards={allCards}
              onCardSelect={handleSelectCard}
              handState={isEnabled ? handState : null}
              onJumpToCard={(jumpFn) => { jumpToCardRef.current = jumpFn }}
            />
          </>
        )}

        {/* CARD_REVEAL 阶段 - 翻牌展示 */}
        {phase === 'CARD_REVEAL' && currentRevealedCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <RevealedCard
              drawnCard={currentRevealedCard}
              onDrawAgain={handleConfirmCard}
            />
            <motion.p
              className="mt-4 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {drawnCards.length < 2 ? (
                t('remainingCards', { count: 2 - drawnCards.length })
              ) : (
                t('lastCard')
              )}
            </motion.p>
          </motion.div>
        )}

        {/* READING 阶段 - 解读界面 */}
        {phase === 'READING' && (
          <ReadingLayout
            cards={drawnCards}
            question={question}
            reading={result.reading || null}
            isLoading={isLoading || isStreaming}
            isStreaming={isStreaming}
            sessionId={sessionId}
            personality={personality}
            suggestedQuestions={result.suggestedQuestions}
            onQuestionSubmit={handleQuestionSubmit}
            onReset={handleReset}
          />
        )}
      </div>

      {/* 手势光标 */}
      <HandCursor />

      {/* 免责声明 Footer - 仅桌面端显示，避免与手势提示重叠 */}
      <div className="hidden md:block absolute bottom-2 left-0 w-full text-center z-40 pointer-events-none px-4">
        <p className="text-[10px] text-white/30">
          {t('disclaimer')}
        </p>
      </div>

      {/* 手势开关 */}
      <GestureToggle currentPhase={phase} />

      {/* 首页指引角色 */}
      {phase === 'IDLE' && <GuidanceCharacter />}

      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed top-4 left-4 z-40 h-10 px-3 flex items-center justify-center gap-2 rounded-lg bg-black/50 border border-neon-gold/30 text-neon-gold hover:bg-black/70 hover:border-neon-gold/60 transition-all backdrop-blur-md"
        title={t('historyTitle')}
        aria-label={t('historyTitle')}
      >
        <History size={18} aria-hidden="true" />
        <span className="hidden sm:inline text-sm font-medium">{t('history')}</span>
      </button>

      {/* 历史记录侧边栏 */}
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <GestureProvider>
      <TarotProvider>
        <AppContent />
      </TarotProvider>
    </GestureProvider>
  )
}

export default App
