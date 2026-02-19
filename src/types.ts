export type ArcanaType = 'major' | 'minor';

export interface TarotCard {
    id: number;
    name: string;
    arcana: ArcanaType;
    suit?: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
    rank?: string | null;
    meaning_up: string;
    meaning_rev: string;
    image_url: string;
}

export interface HandState {
    cursor: { x: number; y: number }; // Normalized 0-1
    action: 'IDLE' | 'HOVER' | 'SCROLL_LEFT' | 'SCROLL_RIGHT' | 'FLIP' | 'CONFIRM';
    confidence: number;
}
