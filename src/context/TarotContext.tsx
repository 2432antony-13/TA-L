// TarotContext.tsx - 塔罗牌解读流程的全局状态管理
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { DrawnCard, TarotCard } from '../data/tarotCards'
import { allCards } from '../data/tarotCards'

export type TarotPhase = 'IDLE' | 'SHUFFLING' | 'DRAWING' | 'READING' | 'RESULT'

interface TarotState {
    phase: TarotPhase
    drawnCards: DrawnCard[]
    question: string
    reading: string | null
    isLoading: boolean
}

interface TarotContextValue extends TarotState {
    startShuffle: () => void
    finishShuffle: () => void
    drawCard: (card?: TarotCard) => DrawnCard | null
    setQuestion: (question: string) => void
    setReading: (reading: string) => void
    setLoading: (loading: boolean) => void
    reset: () => void
    canDraw: boolean
    isComplete: boolean
}

const INITIAL_STATE: TarotState = {
    phase: 'IDLE',
    drawnCards: [],
    question: '',
    reading: null,
    isLoading: false,
}

const TarotContext = createContext<TarotContextValue | null>(null)

export function TarotProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<TarotState>(INITIAL_STATE)

    const startShuffle = useCallback(() => {
        setState(prev => ({ ...prev, phase: 'SHUFFLING', drawnCards: [] }))
    }, [])

    const finishShuffle = useCallback(() => {
        setState(prev => ({ ...prev, phase: 'DRAWING' }))
    }, [])

    const drawCard = useCallback((specificCard?: TarotCard): DrawnCard | null => {
        let newCard: DrawnCard | null = null

        setState(prev => {
            if (prev.drawnCards.length >= 3) return prev

            // 获取已抽出的牌 ID 列表，防止重复
            const drawnIds = new Set(prev.drawnCards.map(dc => dc.card.id))

            // 从剩余的牌中随机选择（过滤掉已抽出的牌）
            const availableCards = allCards.filter(c => !drawnIds.has(c.id))

            // 如果没有指定牌，从可用牌堆中随机选取
            const randomCard = availableCards.length > 0
                ? availableCards[Math.floor(Math.random() * availableCards.length)]
                : allCards[0] // 容错：如果剩余为空（理论上不会），使用第一张牌

            const card = specificCard || randomCard
            const isReversed = Math.random() > 0.5

            newCard = {
                card,
                isReversed,
                isRevealed: true,
            }

            const newDrawnCards = [...prev.drawnCards, newCard]
            const newPhase = newDrawnCards.length >= 3 ? 'READING' : 'DRAWING'

            return {
                ...prev,
                drawnCards: newDrawnCards,
                phase: newPhase,
            }
        })

        return newCard
    }, [])

    const setQuestion = useCallback((question: string) => {
        setState(prev => ({ ...prev, question }))
    }, [])

    const setReading = useCallback((reading: string) => {
        setState(prev => ({ ...prev, reading, phase: 'RESULT', isLoading: false }))
    }, [])

    const setLoading = useCallback((isLoading: boolean) => {
        setState(prev => ({ ...prev, isLoading }))
    }, [])

    const reset = useCallback(() => {
        setState(INITIAL_STATE)
    }, [])

    const canDraw = state.drawnCards.length < 3
    const isComplete = state.drawnCards.length >= 3

    return (
        <TarotContext.Provider
            value={{
                ...state,
                startShuffle,
                finishShuffle,
                drawCard,
                setQuestion,
                setReading,
                setLoading,
                reset,
                canDraw,
                isComplete,
            }}
        >
            {children}
        </TarotContext.Provider>
    )
}

export function useTarot() {
    const context = useContext(TarotContext)
    if (!context) throw new Error('useTarot must be used within TarotProvider')
    return context
}
