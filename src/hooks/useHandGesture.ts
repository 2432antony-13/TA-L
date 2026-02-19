import { useEffect, useRef, useState, useCallback } from 'react'
import { Hands, type Results, type NormalizedLandmarkList } from '@mediapipe/hands'

export type GestureMode = 'IDLE' | 'POINTING' | 'FIST' | 'SCROLLING' | 'SHUFFLE'
export type GestureAction = 'IDLE' | 'HOVER' | 'SCROLL_LEFT' | 'SCROLL_RIGHT' | 'FIST_HOLD' | 'SHUFFLE'

export interface HandState {
    cursor: { x: number; y: number }
    action: GestureAction
    mode: GestureMode
    confidence: number
    landmarks: NormalizedLandmarkList | null
    isFist: boolean           // 是否握拳
    isPointing: boolean       // 是否只伸出一根手指（选牌模式）
    isOpenPalm: boolean       // 是否手掌张开（滚动模式）
    scrollDirection: 'left' | 'right' | 'center' | null
    handCount: number
    fistStartTime: number | null
}

const INITIAL_STATE: HandState = {
    cursor: { x: 0.5, y: 0.5 },
    action: 'IDLE',
    mode: 'IDLE',
    confidence: 0,
    landmarks: null,
    isFist: false,
    isPointing: false,
    isOpenPalm: false,
    scrollDirection: null,
    handCount: 0,
    fistStartTime: null
}

// Thresholds
const SCROLL_ZONE = 0.35           // Left/right 35% triggers scroll
const SMOOTHING_FACTOR = 0.3
const EPSILON = 0.01

export function useHandGesture(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const [handState, setHandState] = useState<HandState>(INITIAL_STATE)
    const [isEnabled, setIsEnabled] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handsRef = useRef<Hands | null>(null)
    const requestRef = useRef<number | null>(null)
    const modeRef = useRef<GestureMode>('IDLE')
    const smoothedCursorRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 })
    const fistStartTimeRef = useRef<number | null>(null)
    const frameCountRef = useRef(0)

    // ... (检测函数保持不变，detectFist, detectOpenPalm 等) ...
    // 这里需要保留原本的 detectFist/detectOpenPalm/detectOneFingerPointing/getIndexFingerPosition/getScrollDirection/onResults
    // 为了代码简洁，请在实际写入时保留这些 callback 的原有实现，不要删除！
    // ⬇️⬇️⬇️ 以下是需要保留的 callback，为了完整性我这里全部写出来 ⬇️⬇️⬇️

    // 检测握拳：所有手指弯曲
    const detectFist = useCallback((landmarks: NormalizedLandmarkList): boolean => {
        const fingerTips = [8, 12, 16, 20]
        const fingerMids = [6, 10, 14, 18]
        let bentFingers = 0
        for (let i = 0; i < fingerTips.length; i++) {
            if (landmarks[fingerTips[i]].y > landmarks[fingerMids[i]].y) {
                bentFingers++
            }
        }
        return bentFingers >= 4
    }, [])

    // 检测手掌是否张开
    const detectOpenPalm = useCallback((landmarks: NormalizedLandmarkList): boolean => {
        const fingerTips = [8, 12, 16, 20]
        const fingerBases = [6, 10, 14, 18]
        let straightFingers = 0
        for (let i = 0; i < fingerTips.length; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerBases[i]].y) {
                straightFingers++
            }
        }
        return straightFingers >= 4
    }, [])

    // 检测是否只伸出一根手指
    const detectOneFingerPointing = useCallback((landmarks: NormalizedLandmarkList): boolean => {
        const fingerTips = [8, 12, 16, 20]
        const fingerBases = [6, 10, 14, 18]
        let straightFingers = 0
        for (let i = 0; i < fingerTips.length; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerBases[i]].y) {
                straightFingers++
            }
        }
        const indexStraight = landmarks[8].y < landmarks[6].y
        const middleBent = landmarks[12].y >= landmarks[10].y
        const ringBent = landmarks[16].y >= landmarks[14].y
        const pinkyBent = landmarks[20].y >= landmarks[18].y
        return indexStraight && middleBent && ringBent && pinkyBent
    }, [])

    // 获取食指指尖位置
    const getIndexFingerPosition = useCallback((landmarks: NormalizedLandmarkList) => {
        const indexTip = landmarks[8]
        return { x: 1 - indexTip.x, y: indexTip.y }
    }, [])

    // Position-based scroll direction
    const getScrollDirection = useCallback((x: number): 'left' | 'right' | 'center' => {
        if (x < SCROLL_ZONE) return 'left'
        if (x > (1 - SCROLL_ZONE)) return 'right'
        return 'center'
    }, [])

    // Process results
    const onResults = useCallback((results: Results) => {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            modeRef.current = 'IDLE'
            fistStartTimeRef.current = null
            setHandState({
                ...INITIAL_STATE,
                handCount: 0
            })
            return
        }

        const landmarks = results.multiHandLandmarks[0]
        const handCount = results.multiHandLandmarks.length

        // 你的原有逻辑...
        // 获取食指位置
        const rawPos = getIndexFingerPosition(landmarks)

        // Smooth cursor
        const smoothed = {
            x: smoothedCursorRef.current.x + (rawPos.x - smoothedCursorRef.current.x) * SMOOTHING_FACTOR,
            y: smoothedCursorRef.current.y + (rawPos.y - smoothedCursorRef.current.y) * SMOOTHING_FACTOR
        }

        const dx = Math.abs(smoothed.x - smoothedCursorRef.current.x)
        const dy = Math.abs(smoothed.y - smoothedCursorRef.current.y)

        if (dx > EPSILON || dy > EPSILON) {
            smoothedCursorRef.current = smoothed
        }

        // 双手洗牌检测
        if (handCount >= 2) {
            const hand1 = results.multiHandLandmarks[0]
            const hand2 = results.multiHandLandmarks[1]
            if (detectOpenPalm(hand1) && detectOpenPalm(hand2)) {
                modeRef.current = 'SHUFFLE'
                setHandState({
                    cursor: smoothedCursorRef.current,
                    action: 'SHUFFLE',
                    mode: 'SHUFFLE',
                    confidence: 1,
                    landmarks: hand1,
                    isFist: false,
                    isPointing: false,
                    isOpenPalm: true,
                    scrollDirection: null,
                    handCount,
                    fistStartTime: null
                })
                return
            }
        }

        const isFist = detectFist(landmarks)
        const isPointing = detectOneFingerPointing(landmarks)
        const isOpenPalm = detectOpenPalm(landmarks)
        const now = Date.now()

        // 跟踪握拳时间
        if (isFist && fistStartTimeRef.current === null) {
            fistStartTimeRef.current = now
        } else if (!isFist) {
            fistStartTimeRef.current = null
        }

        let mode: GestureMode = 'POINTING'
        let action: GestureAction = 'HOVER'
        const scrollDir = getScrollDirection(smoothedCursorRef.current.x)

        if (isPointing) {
            mode = 'POINTING'
            action = 'HOVER'
        } else if (isOpenPalm) {
            if (scrollDir === 'left') {
                mode = 'SCROLLING'
                action = 'SCROLL_LEFT'
            } else if (scrollDir === 'right') {
                mode = 'SCROLLING'
                action = 'SCROLL_RIGHT'
            } else {
                mode = 'SCROLLING'
                action = 'HOVER'
            }
        } else if (isFist) {
            mode = 'FIST'
            action = 'FIST_HOLD'
        }

        modeRef.current = mode

        setHandState({
            cursor: smoothedCursorRef.current,
            action,
            mode,
            confidence: 1,
            landmarks,
            isFist,
            isPointing,
            isOpenPalm,
            scrollDirection: isOpenPalm ? scrollDir : null,
            handCount,
            fistStartTime: fistStartTimeRef.current
        })
    }, [detectFist, detectOneFingerPointing, detectOpenPalm, getIndexFingerPosition, getScrollDirection])

    // Initialize MediaPipe Hands & Camera (Native)
    useEffect(() => {
        if (!isEnabled || !videoRef.current) return

        let stream: MediaStream | null = null;
        let isActive = true;

        const init = async () => {
            try {
                // 1. 初始化 Hands
                const hands = new Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                })

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 0, // 最轻量
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.5,
                })

                hands.onResults(onResults)
                handsRef.current = hands

                // 2. 获取摄像头流 (原生 API)
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: 'user',
                        width: { ideal: 320 }, // 降低分辨率减少过热
                        height: { ideal: 240 }
                    }
                });

                if (!isActive || !videoRef.current) return;

                const video = videoRef.current;
                video.srcObject = stream;

                // 3. 确保视频播放 (关键：iOS 必须手动触发)
                await new Promise<void>((resolve) => {
                    video.onloadedmetadata = () => {
                        video.play().then(resolve).catch(err => {
                            console.warn("Auto-play failed:", err);
                            resolve(); // 即使失败也继续，可能用户已交互
                        });
                    };
                });

                setIsReady(true);
                setError(null);

                // 4. 启动帧循环 (rAF)
                const processFrame = async () => {
                    if (!isActive || !handsRef.current || !videoRef.current) return;

                    // 限频：每 3 帧处理一次 (约 20 fps)，进一步降低负载
                    frameCountRef.current++;
                    if (frameCountRef.current % 3 === 0) {
                        if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                            await handsRef.current.send({ image: video });
                        }
                    }

                    requestRef.current = requestAnimationFrame(processFrame);
                };

                requestRef.current = requestAnimationFrame(processFrame);

            } catch (err) {
                console.error('Failed to init camera/hands:', err)
                if (isActive) {
                    setError('无法访问摄像头，请检查权限')
                    setIsReady(false)
                }
            }
        }

        init();

        return () => {
            isActive = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
            handsRef.current?.close();
            handsRef.current = null;
            setIsReady(false);
        }
    }, [isEnabled, videoRef, onResults]);

    const toggleGesture = useCallback(() => {
        setIsEnabled((prev) => !prev)
        if (isEnabled) {
            setHandState(INITIAL_STATE)
            modeRef.current = 'IDLE'
            fistStartTimeRef.current = null
        }
    }, [isEnabled])

    return {
        handState,
        isEnabled,
        isReady,
        error,
        toggleGesture,
    }
}
