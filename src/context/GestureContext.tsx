import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useHandGesture, type HandState, type GestureAction, type GestureMode } from '../hooks/useHandGesture'

interface GestureContextValue {
    handState: HandState
    isEnabled: boolean
    isReady: boolean
    error: string | null
    toggleGesture: () => void
    videoRef: React.RefObject<HTMLVideoElement | null>
}

const GestureContext = createContext<GestureContextValue | null>(null)

export function GestureProvider({ children }: { children: ReactNode }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const gesture = useHandGesture(videoRef)
    return <GestureContext.Provider value={{ ...gesture, videoRef }}>{children}</GestureContext.Provider>
}

export function useGesture() {
    const context = useContext(GestureContext)
    if (!context) throw new Error('useGesture must be used within GestureProvider')
    return context
}

export type { HandState, GestureAction, GestureMode }
