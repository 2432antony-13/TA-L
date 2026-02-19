// Tarot card data structure
export interface TarotCard {
    id: string;
    name: string;
    image: string;
    suit: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
    uprightMeaning: string;
    reversedMeaning: string;
}

export interface DrawnCard {
    card: TarotCard;
    isReversed: boolean;
    isRevealed: boolean;
}

// Major Arcana (m00-m21)
const majorArcana: TarotCard[] = [
    {
        id: 'm00',
        name: '愚者 The Fool',
        image: '/tarot_hd/m00.jpg',
        suit: 'major',
        uprightMeaning: '新的开始，冒险精神，纯真无邪，自由自在',
        reversedMeaning: '鲁莽冲动，缺乏计划，愚蠢行为，错误判断'
    },
    {
        id: 'm01',
        name: '魔术师 The Magician',
        image: '/tarot_hd/m01.jpg',
        suit: 'major',
        uprightMeaning: '创造力，技能展现，意志力，资源运用',
        reversedMeaning: '操纵欺骗，滥用才能，缺乏自信，浪费天赋'
    },
    {
        id: 'm02',
        name: '女祭司 The High Priestess',
        image: '/tarot_hd/m02.jpg',
        suit: 'major',
        uprightMeaning: '直觉智慧，神秘知识，内在声音，潜意识',
        reversedMeaning: '隐藏秘密，缺乏洞察，忽视直觉，表面化'
    },
    {
        id: 'm03',
        name: '皇后 The Empress',
        image: '/tarot_hd/m03.jpg',
        suit: 'major',
        uprightMeaning: '丰饶富足，母性关怀，自然之美，创造力',
        reversedMeaning: '依赖他人，创造力受阻，缺乏关怀，物质主义'
    },
    {
        id: 'm04',
        name: '皇帝 The Emperor',
        image: '/tarot_hd/m04.jpg',
        suit: 'major',
        uprightMeaning: '权威领导，结构秩序，稳定掌控，父性保护',
        reversedMeaning: '专制独裁，缺乏纪律，控制过度，滥用权力'
    },
    {
        id: 'm05',
        name: '教皇 The Hierophant',
        image: '/tarot_hd/m05.jpg',
        suit: 'major',
        uprightMeaning: '传统智慧，精神导师，信仰教诲，遵循规则',
        reversedMeaning: '打破传统，质疑权威，异端思想，自由信仰'
    },
    {
        id: 'm06',
        name: '恋人 The Lovers',
        image: '/tarot_hd/m06.jpg',
        suit: 'major',
        uprightMeaning: '爱情关系，和谐统一，重要选择，价值观一致',
        reversedMeaning: '关系失衡，价值冲突，错误选择，缺乏和谐'
    },
    {
        id: 'm07',
        name: '战车 The Chariot',
        image: '/tarot_hd/m07.jpg',
        suit: 'major',
        uprightMeaning: '胜利成功，意志坚定，自我控制，前进动力',
        reversedMeaning: '失去控制，方向迷失，缺乏意志，侵略性'
    },
    {
        id: 'm08',
        name: '力量 Strength',
        image: '/tarot_hd/m08.jpg',
        suit: 'major',
        uprightMeaning: '内在力量，勇气耐心，温柔控制，克服困难',
        reversedMeaning: '自我怀疑，软弱无力，缺乏自信，内在冲突'
    },
    {
        id: 'm09',
        name: '隐士 The Hermit',
        image: '/tarot_hd/m09.jpg',
        suit: 'major',
        uprightMeaning: '内省寻求，独处智慧，精神指引，深度思考',
        reversedMeaning: '孤独寂寞，拒绝帮助，过度隔离，迷失方向'
    },
    {
        id: 'm10',
        name: '命运之轮 Wheel of Fortune',
        image: '/tarot_hd/m10.jpg',
        suit: 'major',
        uprightMeaning: '转变循环，好运降临，命运转折，积极变化',
        reversedMeaning: '运气不佳，抗拒改变，失控局面，负面循环'
    },
    {
        id: 'm11',
        name: '正义 Justice',
        image: '/tarot_hd/m11.jpg',
        suit: 'major',
        uprightMeaning: '公平公正，真理法律，因果报应，诚实决策',
        reversedMeaning: '不公不义，逃避责任，偏见歧视，法律问题'
    },
    {
        id: 'm12',
        name: '倒吊人 The Hanged Man',
        image: '/tarot_hd/m12.jpg',
        suit: 'major',
        uprightMeaning: '换位思考，暂时牺牲，新的视角，精神觉醒',
        reversedMeaning: '无谓牺牲，拖延停滞，固执己见，抗拒改变'
    },
    {
        id: 'm13',
        name: '死神 Death',
        image: '/tarot_hd/m13.jpg',
        suit: 'major',
        uprightMeaning: '结束转变，重生蜕变，放下过去，新的开始',
        reversedMeaning: '抗拒变化，停滞不前，无法放手，恐惧未知'
    },
    {
        id: 'm14',
        name: '节制 Temperance',
        image: '/tarot_hd/m14.jpg',
        suit: 'major',
        uprightMeaning: '平衡和谐，耐心调和，中庸之道，融合统一',
        reversedMeaning: '失衡过度，缺乏耐心，极端行为，内在冲突'
    },
    {
        id: 'm15',
        name: '恶魔 The Devil',
        image: '/tarot_hd/m15.jpg',
        suit: 'major',
        uprightMeaning: '束缚限制，物质诱惑，上瘾依赖，阴暗面',
        reversedMeaning: '挣脱束缚，克服诱惑，觉醒解脱，打破枷锁'
    },
    {
        id: 'm16',
        name: '高塔 The Tower',
        image: '/tarot_hd/m16.jpg',
        suit: 'major',
        uprightMeaning: '突然改变，崩溃重建，真相揭露，解放启示',
        reversedMeaning: '逃避灾难，恐惧改变，延迟崩溃，小型危机'
    },
    {
        id: 'm17',
        name: '星星 The Star',
        image: '/tarot_hd/m17.jpg',
        suit: 'major',
        uprightMeaning: '希望信念，灵感启发，平静治愈，精神指引',
        reversedMeaning: '失去信心，缺乏灵感，绝望失望，自我怀疑'
    },
    {
        id: 'm18',
        name: '月亮 The Moon',
        image: '/tarot_hd/m18.jpg',
        suit: 'major',
        uprightMeaning: '潜意识，幻觉迷惑，直觉梦境，隐藏恐惧',
        reversedMeaning: '真相显现，克服恐惧，走出迷雾，理性回归'
    },
    {
        id: 'm19',
        name: '太阳 The Sun',
        image: '/tarot_hd/m19.jpg',
        suit: 'major',
        uprightMeaning: '成功喜悦，活力充沛，积极乐观，光明温暖',
        reversedMeaning: '过度乐观，延迟成功，缺乏热情，内在阴郁'
    },
    {
        id: 'm20',
        name: '审判 Judgement',
        image: '/tarot_hd/m20.jpg',
        suit: 'major',
        uprightMeaning: '反思觉醒，宽恕救赎，重大决定，内在召唤',
        reversedMeaning: '自我怀疑，逃避责任，内疚自责，无法前进'
    },
    {
        id: 'm21',
        name: '世界 The World',
        image: '/tarot_hd/m21.jpg',
        suit: 'major',
        uprightMeaning: '完成圆满，成就达成，整合统一，旅程终点',
        reversedMeaning: '未完成，缺乏闭环，停滞不前，寻求完整'
    },
];

// Helper function to generate minor arcana with upright/reversed meanings
const generateMinorArcana = (
    suit: 'wands' | 'cups' | 'swords' | 'pentacles',
    prefix: string,
    suitName: string,
    uprightTheme: string,
    reversedTheme: string
): TarotCard[] => {
    return Array.from({ length: 14 }, (_, i) => ({
        id: `${prefix}${String(i + 1).padStart(2, '0')}`,
        name: `${suitName} ${i + 1}`,
        image: `/tarot_hd/${prefix}${String(i + 1).padStart(2, '0')}.jpg`,
        suit,
        uprightMeaning: `${uprightTheme}的正面展现，积极能量流动`,
        reversedMeaning: `${reversedTheme}的阻碍，能量受阻或过度`,
    }));
};

const wands = generateMinorArcana('wands', 'w', '权杖', '激情创造力', '缺乏动力');
const cups = generateMinorArcana('cups', 'c', '圣杯', '情感关系', '情感失衡');
const swords = generateMinorArcana('swords', 's', '宝剑', '思想理智', '思维混乱');
const pentacles = generateMinorArcana('pentacles', 'p', '星币', '物质财富', '物质匮乏');

export const allCards: TarotCard[] = [
    ...majorArcana,
    ...wands,
    ...cups,
    ...swords,
    ...pentacles,
];

export const CARD_BACK_IMAGE = '/tarot/card-back.png';

// Shuffle and draw a card with random orientation
export const drawRandomCard = (): DrawnCard => {
    const card = allCards[Math.floor(Math.random() * allCards.length)];
    const isReversed = Math.random() > 0.5; // 50% chance of reversed

    return {
        card,
        isReversed,
        isRevealed: false,
    };
};
