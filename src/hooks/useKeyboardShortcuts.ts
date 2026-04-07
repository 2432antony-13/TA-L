import { useEffect } from 'react';

type PhaseType = 'IDLE' | 'PERSONALITY_SELECTION' | 'INTERVIEW' | 'QUESTION_INPUT' | 'SHUFFLING' | 'DRAWING' | 'CARD_REVEAL' | 'READING';

export function useKeyboardShortcuts(
  phase: PhaseType,
  handleStartDrawing: () => void,
  handleSelectCard: (index: number) => void,
  handleConfirmCard: () => void
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // 如果焦点在可交互元素上，不拦截
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || target?.isContentEditable) return;
      
      if (phase === 'IDLE' && e.key === ' ') {
        e.preventDefault();
        handleStartDrawing();
      }
      if (phase === 'DRAWING' && e.key === ' ') {
        e.preventDefault();
        handleSelectCard(0);
      }
      if (phase === 'CARD_REVEAL' && e.key === 'Enter') {
        handleConfirmCard();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [phase, handleStartDrawing, handleSelectCard, handleConfirmCard]);
}
