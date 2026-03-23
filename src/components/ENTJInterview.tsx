// ENTJInterview.tsx - ENTJ 人格访谈组件
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  interviewQuestions,
  generatePersonalityProfileAsync,
  type InterviewAnswer,
} from '../data/entjInterviewQuestions'

interface ENTJInterviewProps {
  onComplete: (profile: string) => void
  onSkip: () => void
}

export function ENTJInterview({ onComplete, onSkip }: ENTJInterviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<InterviewAnswer[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [profileText, setProfileText] = useState('')

  const currentQuestion = interviewQuestions[currentIndex]
  const progress = ((currentIndex) / interviewQuestions.length) * 100

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)

      const question = interviewQuestions[currentIndex]
      const selectedOption = question.options[optionIndex]

      const newAnswer: InterviewAnswer = {
        questionId: question.id,
        selectedOption: optionIndex,
        traitTags: selectedOption.traitTags,
      }

      const newAnswers = [...answers, newAnswer]
      setAnswers(newAnswers)

      setTimeout(async () => {
        if (currentIndex < interviewQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setIsTransitioning(false)
        } else {
          // 最后一题，生成画像，使用转圈圈等待
          setIsGenerating(true)
          
          try {
            const profile = await generatePersonalityProfileAsync(newAnswers)
            setProfileText(profile)
          } catch (err) {
             console.error(err)
             // 失败可以做本地回退，由于 async 函数里已经做了 fallback 这里直接 set 即可
          } finally {
             setShowResult(true)
             setIsGenerating(false)
             setIsTransitioning(false)
          }
        }
      }, 400)
    },
    [currentIndex, answers, isTransitioning]
  )

  const handleFinish = useCallback(() => {
    onComplete(profileText)
  }, [profileText, onComplete])

  return (
    <motion.div
      className="w-full min-h-screen flex items-center justify-center p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-panel p-6 md:p-8 rounded-3xl w-full max-w-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {isGenerating ? (
          <motion.div 
            className="flex flex-col items-center justify-center p-12 min-h-[300px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-neon-gold animate-spin mb-6"></div>
            <p className="text-neon-gold animate-pulse text-base tracking-widest text-center">
              Gemini 正在深潜你的潜意识<br/>
              <span className="text-xs text-gray-500 mt-2 block">为您提炼您的画像...</span>
            </p>
          </motion.div>
        ) : !showResult ? (
          <>
            {/* 进度条 */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-neon-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* 题号 */}
            <div className="text-center mb-2">
              <span className="text-xs text-neon-gold/60 tracking-wider">
                {currentIndex + 1} / {interviewQuestions.length}
              </span>
            </div>

            {/* 问题 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg md:text-xl text-starlight text-center mb-6 md:mb-8 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* 选项 */}
                <div className="flex flex-col gap-3">
                  {currentQuestion.options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isTransitioning}
                      className="group relative w-full p-4 text-left bg-white/5 border border-white/10 rounded-xl hover:border-neon-gold/50 hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
                      whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <span className="text-sm md:text-base text-gray-300 group-hover:text-starlight transition-colors">
                        {option.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 跳过链接 */}
            <div className="text-center mt-6">
              <button
                onClick={onSkip}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                跳过访谈，直接占卜 →
              </button>
            </div>
          </>
        ) : (
          /* 画像结果展示 */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 完成进度条 */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-neon-gold rounded-full"
                initial={{ width: `${progress}%` }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-neon-gold text-center mb-6">
              你的个性画像
            </h3>

            <div className="bg-white/5 border border-neon-gold/20 rounded-xl p-5 mb-6">
              {profileText.split('\n').map((line, i) => {
                if (i === 0) {
                  // [用户个性画像] 标题行，跳过
                  return null
                }
                if (line.trim() === '') return <div key={i} className="h-3" />
                if (line.startsWith('综合印象:')) {
                  return (
                    <p key={i} className="text-sm text-gray-300 leading-relaxed mt-2 italic">
                      {line}
                    </p>
                  )
                }
                // 维度行
                const colonIdx = line.indexOf(':')
                if (colonIdx > 0) {
                  const dim = line.slice(0, colonIdx)
                  const rest = line.slice(colonIdx + 1).trim()
                  const dashIdx = rest.indexOf('—')
                  const label = dashIdx > 0 ? rest.slice(0, dashIdx).trim() : rest
                  const desc = dashIdx > 0 ? rest.slice(dashIdx + 1).trim() : ''
                  return (
                    <div key={i} className="mb-2">
                      <span className="text-xs text-neon-gold/70">{dim}: </span>
                      <span className="text-sm text-starlight font-medium">{label}</span>
                      {desc && (
                        <span className="text-sm text-gray-400"> — {desc}</span>
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

            <p className="text-xs text-gray-500 text-center mb-6">
              这份画像将融入你的塔罗解读，让 AI 更懂你
            </p>

            <motion.button
              onClick={handleFinish}
              className="w-full py-3 bg-gradient-to-r from-neon-gold-dim to-neon-gold text-black font-semibold rounded-xl hover:shadow-neon transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              开始占卜 ✨
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default ENTJInterview
