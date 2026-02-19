// App.tsx - Main application with complete tarot reading flow
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
} from './components'
import { QuestionInput } from './components/QuestionInput'
import { PersonalitySelector, type PersonalityType } from './components/PersonalitySelector'
import { GestureProvider, useGesture } from './context/GestureContext'
import { TarotProvider } from './context/TarotContext'
import { useGeminiAPI } from './hooks/useGeminiAPI'

type AppPhase = 'IDLE' | 'PERSONALITY_SELECTION' | 'QUESTION_INPUT' | 'SHUFFLING' | 'DRAWING' | 'CARD_REVEAL' | 'READING'

function AppContent() {
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

  const inputRef = useRef<HTMLInputElement>(null)
  const jumpToCardRef = useRef<((index: number) => void) | null>(null)
  const { handState, isEnabled } = useGesture()
  // 使用更新后的 hook，解构 result 和 isStreaming
  const { getReading, isLoading, isStreaming, result, resetResult } = useGeminiAPI()

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

  // 处理性格选择
  const handlePersonalitySelect = useCallback((type: PersonalityType) => {
    setPersonality(type)
    setPhase('QUESTION_INPUT')
  }, [])

  // 处理问题提交
  const handleQuestionInputSubmit = useCallback((submittedQuestion: string) => {
    setQuestion(submittedQuestion)
    setPhase('SHUFFLING')
  }, [])

  // 抽牌
  const handleSelectCard = useCallback((_cardIndex: number) => {
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
  }, [isFlipping, drawnCards.length])

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
      const positions = ['过去', '现在', '未来']
      // getReading 现在返回 void，数据通过 result 实时更新
      await getReading({
        cards: drawnCards.map((dc, i) => ({
          name: dc.card.name,
          isReversed: dc.isReversed,
          position: positions[i]
        })),
        question: q,
        personality: personality
      })
      // 流式结束后，生成一个 sessionId 用于追问关联
      setSessionId(crypto.randomUUID())
    } catch (error) {
      console.error('解读失败:', error)
      alert(`API 请求失败: ${error instanceof Error ? error.message : '未知错误'}\n请检查网络或 API Key。`)
    }
  }, [drawnCards, getReading, personality])


  // 重置开始新一轮
  const handleReset = useCallback(() => {
    setPhase('PERSONALITY_SELECTION')
    setDrawnCards([])
    setCurrentRevealedCard(null)
    setQuestion('')
    resetResult()  // 重置 API 结果，避免显示旧数据
    setPersonality(null)
    setSessionId(null)
    shuffleTriggeredRef.current = false
  }, [resetResult])


  // 键盘控制
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (phase === 'CARD_REVEAL' && e.key === 'Enter') {
      handleConfirmCard()
      return
    }
    if (phase === 'DRAWING' && e.key === ' ') {
      e.preventDefault()
      handleSelectCard(0)
    }
    if (phase === 'IDLE' && e.key === ' ') {
      e.preventDefault()
      handleStartDrawing()
    }
  }

  useEffect(() => {
    // READING 和 QUESTION_INPUT 阶段需要让 textarea 获得焦点，不要抢占
    if (phase !== 'READING' && phase !== 'QUESTION_INPUT') {
      inputRef.current?.focus()
    }
  }, [phase])


  // 视频引导逻辑
  const [showIntro, setShowIntro] = useState(true)

  // 用户要求每次进入都显示，移除 localStorage 检查
  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  return (
    <div className={`relative w-full flex flex-col items-center ${phase === 'QUESTION_INPUT' || phase === 'READING' ? '' : 'select-none'} ${phase === 'READING' ? 'h-screen overflow-y-auto overflow-x-hidden' : 'overflow-hidden justify-center h-screen'
      } p-4`}>

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
              塔罗叙事
            </h1>
            <h2 className="font-light tracking-[0.3em] md:tracking-[0.5em] text-neon-gold/70 uppercase text-sm md:text-lg mt-3"
              style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}>
              The Mystic Narrative
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
            <p className="text-gray-400 mb-6">在心中默念你的问题，然后开始占卜</p>

            <button
              onClick={handleStartDrawing}
              className="px-8 py-4 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-semibold rounded-xl hover:shadow-neon transition-all duration-300"
            >
              ✨ 开始占卜
            </button>
            <p className="text-sm text-gray-500 mt-3">或按空格键开始</p>
          </motion.div>
        )}


        {/* PERSONALITY_SELECTION 阶段 - 性格选择 */}
        {phase === 'PERSONALITY_SELECTION' && (
          <PersonalitySelector onSelect={handlePersonalitySelect} />
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
                placeholder="幸运数字~"
                value={luckyNumber}
                onChange={(e) => setLuckyNumber(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleLuckySubmit()}
                className="w-28 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-gold/50 transition-colors"
              />
              <button
                onClick={handleLuckySubmit}
                className="px-4 py-2 text-sm bg-neon-gold/20 hover:bg-neon-gold/40 border border-neon-gold/30 rounded-lg text-neon-gold transition-colors"
              >
                确定
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
                `还需抽取 ${2 - drawnCards.length} 张牌`
              ) : (
                '这是最后一张牌，点击完成占卜'
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
            thinking={result.thinking}
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

      {/* 隐藏输入框 - 键盘控制（仅桌面端，避免手机弹出键盘） */}
      {phase !== 'READING' && phase !== 'QUESTION_INPUT' && phase !== 'DRAWING' && (
        <input
          ref={inputRef}
          autoFocus
          className="hidden md:block absolute opacity-0 pointer-events-none"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          onBlur={() => inputRef.current?.focus()}
        />
      )}

      {/* 手势光标 */}
      <HandCursor />

      {/* 免责声明 Footer - 仅桌面端显示，避免与手势提示重叠 */}
      <div className="hidden md:block absolute bottom-2 left-0 w-full text-center z-40 pointer-events-none px-4">
        <p className="text-[10px] text-white/30">
          * 本应用内容由 AI 生成，仅供娱乐与灵感启发，不构成任何心理咨询、医疗或法律建议。
          <span className="hidden md:inline"> </span>
          请理性对待，相信科学，命运始终掌握在自己手中。
        </p>
      </div>

      {/* 手势开关 */}
      <GestureToggle currentPhase={phase} />

      {/* 首页指引角色 */}
      {phase === 'IDLE' && <GuidanceCharacter />}

      {/* 历史记录按钮 */}
      {/* 历史记录按钮 */}
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed top-6 right-6 z-40 px-6 py-3 flex items-center justify-center gap-3 rounded-full bg-black/40 border border-neon-gold/30 text-neon-gold hover:bg-black/60 hover:border-neon-gold/60 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(255,215,0,0.1)] group"
        title="我的占卜记录"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📜</span>
        <span className="text-lg font-medium tracking-wide">我的记录</span>
      </button>

      {/* 历史记录侧边栏 */}
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  )
}

// 备用解读（当 API 不可用时）
// 备用解读（当 API 不可用时）- 用户要求移除兜底，暂时注释
// function generateFallbackReading(cards: DrawnCard[], question: string): string {
//   const positions = ['过去', '现在', '未来']
// 
//   let reading = `🔮 关于您的问题：「${question}」\n\n`
// 
//   cards.forEach((dc, i) => {
//     const meaning = dc.isReversed ? dc.card.reversedMeaning : dc.card.uprightMeaning
//     reading += `【${positions[i]}】${dc.card.name}（${dc.isReversed ? '逆位' : '正位'}）\n`
//     reading += `${meaning}\n\n`
//   })
// 
//   reading += `✨ 整体指引\n`
//   reading += `三张牌共同揭示了您问题的脉络。过去的经历塑造了现在，而现在的选择将影响未来。请跟随内心的指引，勇敢前行。`
// 
//   return reading
// }

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
