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
        image: '/tarot/m00.jpg',
        suit: 'major',
        uprightMeaning: '新的开始，冒险精神，纯真无邪，自由自在',
        reversedMeaning: '鲁莽冲动，缺乏计划，愚蠢行为，错误判断'
    },
    {
        id: 'm01',
        name: '魔术师 The Magician',
        image: '/tarot/m01.jpg',
        suit: 'major',
        uprightMeaning: '创造力，技能展现，意志力，资源运用',
        reversedMeaning: '操纵欺骗，滥用才能，缺乏自信，浪费天赋'
    },
    {
        id: 'm02',
        name: '女祭司 The High Priestess',
        image: '/tarot/m02.jpg',
        suit: 'major',
        uprightMeaning: '直觉智慧，神秘知识，内在声音，潜意识',
        reversedMeaning: '隐藏秘密，缺乏洞察，忽视直觉，表面化'
    },
    {
        id: 'm03',
        name: '皇后 The Empress',
        image: '/tarot/m03.jpg',
        suit: 'major',
        uprightMeaning: '丰饶富足，母性关怀，自然之美，创造力',
        reversedMeaning: '依赖他人，创造力受阻，缺乏关怀，物质主义'
    },
    {
        id: 'm04',
        name: '皇帝 The Emperor',
        image: '/tarot/m04.jpg',
        suit: 'major',
        uprightMeaning: '权威领导，结构秩序，稳定掌控，父性保护',
        reversedMeaning: '专制独裁，缺乏纪律，控制过度，滥用权力'
    },
    {
        id: 'm05',
        name: '教皇 The Hierophant',
        image: '/tarot/m05.jpg',
        suit: 'major',
        uprightMeaning: '传统智慧，精神导师，信仰教诲，遵循规则',
        reversedMeaning: '打破传统，质疑权威，异端思想，自由信仰'
    },
    {
        id: 'm06',
        name: '恋人 The Lovers',
        image: '/tarot/m06.jpg',
        suit: 'major',
        uprightMeaning: '爱情关系，和谐统一，重要选择，价值观一致',
        reversedMeaning: '关系失衡，价值冲突，错误选择，缺乏和谐'
    },
    {
        id: 'm07',
        name: '战车 The Chariot',
        image: '/tarot/m07.jpg',
        suit: 'major',
        uprightMeaning: '胜利成功，意志坚定，自我控制，前进动力',
        reversedMeaning: '失去控制，方向迷失，缺乏意志，侵略性'
    },
    {
        id: 'm08',
        name: '力量 Strength',
        image: '/tarot/m08.jpg',
        suit: 'major',
        uprightMeaning: '内在力量，勇气耐心，温柔控制，克服困难',
        reversedMeaning: '自我怀疑，软弱无力，缺乏自信，内在冲突'
    },
    {
        id: 'm09',
        name: '隐士 The Hermit',
        image: '/tarot/m09.jpg',
        suit: 'major',
        uprightMeaning: '内省寻求，独处智慧，精神指引，深度思考',
        reversedMeaning: '孤独寂寞，拒绝帮助，过度隔离，迷失方向'
    },
    {
        id: 'm10',
        name: '命运之轮 Wheel of Fortune',
        image: '/tarot/m10.jpg',
        suit: 'major',
        uprightMeaning: '转变循环，好运降临，命运转折，积极变化',
        reversedMeaning: '运气不佳，抗拒改变，失控局面，负面循环'
    },
    {
        id: 'm11',
        name: '正义 Justice',
        image: '/tarot/m11.jpg',
        suit: 'major',
        uprightMeaning: '公平公正，真理法律，因果报应，诚实决策',
        reversedMeaning: '不公不义，逃避责任，偏见歧视，法律问题'
    },
    {
        id: 'm12',
        name: '倒吊人 The Hanged Man',
        image: '/tarot/m12.jpg',
        suit: 'major',
        uprightMeaning: '换位思考，暂时牺牲，新的视角，精神觉醒',
        reversedMeaning: '无谓牺牲，拖延停滞，固执己见，抗拒改变'
    },
    {
        id: 'm13',
        name: '死神 Death',
        image: '/tarot/m13.jpg',
        suit: 'major',
        uprightMeaning: '结束转变，重生蜕变，放下过去，新的开始',
        reversedMeaning: '抗拒变化，停滞不前，无法放手，恐惧未知'
    },
    {
        id: 'm14',
        name: '节制 Temperance',
        image: '/tarot/m14.jpg',
        suit: 'major',
        uprightMeaning: '平衡和谐，耐心调和，中庸之道，融合统一',
        reversedMeaning: '失衡过度，缺乏耐心，极端行为，内在冲突'
    },
    {
        id: 'm15',
        name: '恶魔 The Devil',
        image: '/tarot/m15.jpg',
        suit: 'major',
        uprightMeaning: '束缚限制，物质诱惑，上瘾依赖，阴暗面',
        reversedMeaning: '挣脱束缚，克服诱惑，觉醒解脱，打破枷锁'
    },
    {
        id: 'm16',
        name: '高塔 The Tower',
        image: '/tarot/m16.jpg',
        suit: 'major',
        uprightMeaning: '突然改变，崩溃重建，真相揭露，解放启示',
        reversedMeaning: '逃避灾难，恐惧改变，延迟崩溃，小型危机'
    },
    {
        id: 'm17',
        name: '星星 The Star',
        image: '/tarot/m17.jpg',
        suit: 'major',
        uprightMeaning: '希望信念，灵感启发，平静治愈，精神指引',
        reversedMeaning: '失去信心，缺乏灵感，绝望失望，自我怀疑'
    },
    {
        id: 'm18',
        name: '月亮 The Moon',
        image: '/tarot/m18.jpg',
        suit: 'major',
        uprightMeaning: '潜意识，幻觉迷惑，直觉梦境，隐藏恐惧',
        reversedMeaning: '真相显现，克服恐惧，走出迷雾，理性回归'
    },
    {
        id: 'm19',
        name: '太阳 The Sun',
        image: '/tarot/m19.jpg',
        suit: 'major',
        uprightMeaning: '成功喜悦，活力充沛，积极乐观，光明温暖',
        reversedMeaning: '过度乐观，延迟成功，缺乏热情，内在阴郁'
    },
    {
        id: 'm20',
        name: '审判 Judgement',
        image: '/tarot/m20.jpg',
        suit: 'major',
        uprightMeaning: '反思觉醒，宽恕救赎，重大决定，内在召唤',
        reversedMeaning: '自我怀疑，逃避责任，内疚自责，无法前进'
    },
    {
        id: 'm21',
        name: '世界 The World',
        image: '/tarot/m21.jpg',
        suit: 'major',
        uprightMeaning: '完成圆满，成就达成，整合统一，旅程终点',
        reversedMeaning: '未完成，缺乏闭环，停滞不前，寻求完整'
    },
];

// Minor Arcana - Wands (Fire, Passion, Action)
const wands: TarotCard[] = [
    { id: 'w01', name: '权杖王牌 Ace of Wands', image: '/tarot/w01.jpg', suit: 'wands', uprightMeaning: '灵感涌现，新计划，创造力源泉，行动开端', reversedMeaning: '缺乏动力，计划推迟，创意枯竭，错失良机' },
    { id: 'w02', name: '权杖二 Two of Wands', image: '/tarot/w02.jpg', suit: 'wands', uprightMeaning: '规划未来，决定方向，统筹全局，因势利导', reversedMeaning: '犹豫不决，恐惧未知，方向错误，画地为牢' },
    { id: 'w03', name: '权杖三 Three of Wands', image: '/tarot/w03.jpg', suit: 'wands', uprightMeaning: '展望远景，准备出发，探索未知，初步成果', reversedMeaning: '贸易中断，合作失败，缺乏远见，故步自封' },
    { id: 'w04', name: '权杖四 Four of Wands', image: '/tarot/w04.jpg', suit: 'wands', uprightMeaning: '庆祝欢呼，和谐安稳，家庭聚会，阶段胜利', reversedMeaning: '家庭不和，庆祝取消，根基不稳，过渡时期' },
    { id: 'w05', name: '权杖五 Five of Wands', image: '/tarot/w05.jpg', suit: 'wands', uprightMeaning: '竞争冲突，头脑风暴，良性比拼，意见分歧', reversedMeaning: '恶性竞争，避免冲突，内耗严重，难以合作' },
    { id: 'w06', name: '权杖六 Six of Wands', image: '/tarot/w06.jpg', suit: 'wands', uprightMeaning: '胜利凯旋，获得认可，自信满满，公众荣誉', reversedMeaning: '骄傲自大，名声受损，失败落选，众叛亲离' },
    { id: 'w07', name: '权杖七 Seven of Wands', image: '/tarot/w07.jpg', suit: 'wands', uprightMeaning: '坚持立场，挑战重重，以一敌众，勇气抗争', reversedMeaning: '放弃抵抗，不堪重负，缺乏自信，临阵退缩' },
    { id: 'w08', name: '权杖八 Eight of Wands', image: '/tarot/w08.jpg', suit: 'wands', uprightMeaning: '迅速行动，消息传来，旅行移动，即刻变化', reversedMeaning: '延误阻碍，方向混乱，冲动鲁莽，欲速不达' },
    { id: 'w09', name: '权杖九 Nine of Wands', image: '/tarot/w09.jpg', suit: 'wands', uprightMeaning: '防御守卫，最后坚持，恢复元气，谨慎小心', reversedMeaning: '防御崩溃，精疲力竭，放弃希望，固执多疑' },
    { id: 'w10', name: '权杖十 Ten of Wands', image: '/tarot/w10.jpg', suit: 'wands', uprightMeaning: '重担责任，压力过大，过度操劳，独自承担', reversedMeaning: '卸下重担，逃避责任，不堪重负，懂得放手' },
    { id: 'w11', name: '权杖侍从 Page of Wands', image: '/tarot/w11.jpg', suit: 'wands', uprightMeaning: '探索新知，热情消息，好奇孩子，灵感火花', reversedMeaning: '好高骛远，消息延迟，缺乏热情，幼稚冲动' },
    { id: 'w12', name: '权杖骑士 Knight of Wands', image: '/tarot/w12.jpg', suit: 'wands', uprightMeaning: '行动迅速，冒险进取，热情冲动，甚至鲁莽', reversedMeaning: '急躁易怒，鲁莽行事，计划受阻，精力分散' },
    { id: 'w13', name: '权杖皇后 Queen of Wands', image: '/tarot/w13.jpg', suit: 'wands', uprightMeaning: '自信魅力，独立坚强，热情慷慨，乐观开朗', reversedMeaning: '嫉妒自大，情绪化，控制欲强，虚荣浮夸' },
    { id: 'w14', name: '权杖国王 King of Wands', image: '/tarot/w14.jpg', suit: 'wands', uprightMeaning: '远见卓识，领导能力，成熟稳重，激励他人', reversedMeaning: '独断专行，傲慢偏执，严厉无情，期望过高' },
];

// Minor Arcana - Cups (Water, Emotions, Relationships)
const cups: TarotCard[] = [
    { id: 'c01', name: '圣杯王牌 Ace of Cups', image: '/tarot/c01.jpg', suit: 'cups', uprightMeaning: '情感涌动，新的爱意，心灵满足，直觉开启', reversedMeaning: '情感压抑，情感空虚，直觉受阻，错失所爱' },
    { id: 'c02', name: '圣杯二 Two of Cups', image: '/tarot/c02.jpg', suit: 'cups', uprightMeaning: '心心相印，平等伴侣，和谐结合，互相吸引', reversedMeaning: '关系破裂，沟通障碍，误解分离，情感不和' },
    { id: 'c03', name: '圣杯三 Three of Cups', image: '/tarot/c03.jpg', suit: 'cups', uprightMeaning: '欢庆聚会，友谊结盟，团队协作，分享喜悦', reversedMeaning: '过度放纵，团体排挤，流言蜚语，乐极生悲' },
    { id: 'c04', name: '圣杯四 Four of Cups', image: '/tarot/c04.jpg', suit: 'cups', uprightMeaning: '冷漠倦怠，错失机会，自我封闭，缺乏动力', reversedMeaning: '抓住机会，走出封闭，重新投入，觉察新机' },
    { id: 'c05', name: '圣杯五 Five of Cups', image: '/tarot/c05.jpg', suit: 'cups', uprightMeaning: '悲伤失落，沉浸过去，遗憾悔恨，只见失去', reversedMeaning: '走出悲伤，重拾希望，接受现实，继续前行' },
    { id: 'c06', name: '圣杯六 Six of Cups', image: '/tarot/c06.jpg', suit: 'cups', uprightMeaning: '童年回忆，纯真怀旧，过去重现，简单快乐', reversedMeaning: '沉溺过去，无法成长，逃避现实，过度依恋' },
    { id: 'c07', name: '圣杯七 Seven of Cups', image: '/tarot/c07.jpg', suit: 'cups', uprightMeaning: '白日梦境，选择繁多，幻象诱惑，缺乏行动', reversedMeaning: '看清现实，做出选择，幻象破灭，明确目标' },
    { id: 'c08', name: '圣杯八 Eight of Cups', image: '/tarot/c08.jpg', suit: 'cups', uprightMeaning: '寻找真理，放弃现状，踏上旅程，心灵追寻', reversedMeaning: '犹豫不决，害怕改变，安于现状，虚假快乐' },
    { id: 'c09', name: '圣杯九 Nine of Cups', image: '/tarot/c09.jpg', suit: 'cups', uprightMeaning: '愿望达成，心满意足，物质享受，美梦成真', reversedMeaning: '贪得无厌，看似满足，内在空虚，自我放纵' },
    { id: 'c10', name: '圣杯十 Ten of Cups', image: '/tarot/c10.jpg', suit: 'cups', uprightMeaning: '家庭幸福，情感圆满，和谐美满，心灵归宿', reversedMeaning: '家庭纷争，情感疏离，表面和谐，破碎关系' },
    { id: 'c11', name: '圣杯侍从 Page of Cups', image: '/tarot/c11.jpg', suit: 'cups', uprightMeaning: '情感萌芽，直觉敏锐，艺术灵感，温柔消息', reversedMeaning: '情绪幼稚，过度敏感，逃避现实，情感依赖' },
    { id: 'c12', name: '圣杯骑士 Knight of Cups', image: '/tarot/c12.jpg', suit: 'cups', uprightMeaning: '浪漫追求，白马王子，跟随这心，理想主义', reversedMeaning: '虚情假意，过度情绪化，不切实际，欺骗诱惑' },
    { id: 'c13', name: '圣杯皇后 Queen of Cups', image: '/tarot/c13.jpg', suit: 'cups', uprightMeaning: '温柔慈悲，直觉敏锐，情感深邃，治愈力量', reversedMeaning: '情绪失控，过度依赖，多愁善感，脱离现实' },
    { id: 'c14', name: '圣杯国王 King of Cups', image: '/tarot/c14.jpg', suit: 'cups', uprightMeaning: '情绪掌控，宽容大度，外交手腕，情感成熟', reversedMeaning: '情绪压抑，冷酷无情，操纵情感，两面三刀' },
];

// Minor Arcana - Swords (Air, Intellect, Conflict)
const swords: TarotCard[] = [
    { id: 's01', name: '宝剑王牌 Ace of Swords', image: '/tarot/s01.jpg', suit: 'swords', uprightMeaning: '思维清晰，重大突破，斩断幻象，绝对真理', reversedMeaning: '思维混乱，判断失误，言语伤人，过度极端' },
    { id: 's02', name: '宝剑二 Two of Swords', image: '/tarot/s02.jpg', suit: 'swords', uprightMeaning: '僵持不下，逃避选择，自我封闭，暂时平衡', reversedMeaning: '做出选择，打破僵局，揭开真相，面对冲突' },
    { id: 's03', name: '宝剑三 Three of Swords', image: '/tarot/s03.jpg', suit: 'swords', uprightMeaning: '心碎悲伤，背叛分离，痛苦真相，情感创伤', reversedMeaning: '走出伤痛，释放悲伤，开始疗愈，原谅宽恕' },
    { id: 's04', name: '宝剑四 Four of Swords', image: '/tarot/s04.jpg', suit: 'swords', uprightMeaning: '休养生息，暂停思考，冥想恢复，暂退战场', reversedMeaning: '重返生活，恢复行动，不安躁动，被迫休息' },
    { id: 's05', name: '宝剑五 Five of Swords', image: '/tarot/s05.jpg', suit: 'swords', uprightMeaning: '空洞胜利，自私自利，不择手段，人际冲突', reversedMeaning: '结束冲突，吸取教训，放下执念，寻求和解' },
    { id: 's06', name: '宝剑六 Six of Swords', image: '/tarot/s06.jpg', suit: 'swords', uprightMeaning: '从容离开，渡过难关，寻求平静，缓慢疗愈', reversedMeaning: '无法摆脱，旧病复发，逃避问题，旅途受阻' },
    { id: 's07', name: '宝剑七 Seven of Swords', image: '/tarot/s07.jpg', suit: 'swords', uprightMeaning: '策略计谋，孤注一掷，隐秘行动，逃避责任', reversedMeaning: '坦白真相，计划败露，面对现实，改邪归正' },
    { id: 's08', name: '宝剑八 Eight of Swords', image: '/tarot/s08.jpg', suit: 'swords', uprightMeaning: '自我束缚，思想受限，无力改变，受害者心态', reversedMeaning: '打破束缚，重获自由，思想觉醒，走出困境' },
    { id: 's09', name: '宝剑九 Nine of Swords', image: '/tarot/s09.jpg', suit: 'swords', uprightMeaning: '焦虑失眠，噩梦缠绕，内心恐惧，精神压力', reversedMeaning: '看见希望，走出阴霾，恐惧消散，寻求帮助' },
    { id: 's10', name: '宝剑十 Ten of Swords', image: '/tarot/s10.jpg', suit: 'swords', uprightMeaning: '彻底结束，痛苦谷底，背叛失败，黎明前夜', reversedMeaning: '否极泰来，伤痛减轻，重新站起，最坏已过' },
    { id: 's11', name: '宝剑侍从 Page of Swords', image: '/tarot/s11.jpg', suit: 'swords', uprightMeaning: '思维敏捷，好奇观察，机智应对，新的想法', reversedMeaning: '言语尖刻，多疑猜忌，流言蜚语，纸上谈兵' },
    { id: 's12', name: '宝剑骑士 Knight of Swords', image: '/tarot/s12.jpg', suit: 'swords', uprightMeaning: '行动迅速，思维锋利，直率果断，追求真理', reversedMeaning: '鲁莽冲动，言语伤人，不顾后果，思维混乱' },
    { id: 's13', name: '宝剑皇后 Queen of Swords', image: '/tarot/s13.jpg', suit: 'swords', uprightMeaning: '独立理智，清晰洞察，公正无私，言辞犀利', reversedMeaning: '尖酸刻薄，冷酷无情，过度批判，封闭内心' },
    { id: 's14', name: '宝剑国王 King of Swords', image: '/tarot/s14.jpg', suit: 'swords', uprightMeaning: '权威理智，公正判断，深思熟虑，逻辑严密', reversedMeaning: '残忍独裁，滥用权力，思想控制，冷漠无情' },
];

// Minor Arcana - Pentacles (Earth, Material, Work)
const pentacles: TarotCard[] = [
    { id: 'p01', name: '星币王牌 Ace of Pentacles', image: '/tarot/p01.jpg', suit: 'pentacles', uprightMeaning: '物质机会，繁荣开端，稳定基础，实际回报', reversedMeaning: '错失机会，贪婪浪费，金钱损失，计划落空' },
    { id: 'p02', name: '星币二 Two of Pentacles', image: '/tarot/p02.jpg', suit: 'pentacles', uprightMeaning: '灵活平衡，适应变化，多线操作，收支平衡', reversedMeaning: '失去平衡，财务混乱，顾此失彼，不堪重负' },
    { id: 'p03', name: '星币三 Three of Pentacles', image: '/tarot/p03.jpg', suit: 'pentacles', uprightMeaning: '团队合作，专业技能，精益求精，获得认可', reversedMeaning: '缺乏协作，工作平庸，技能不足，团队不和' },
    { id: 'p04', name: '星币四 Four of Pentacles', image: '/tarot/p04.jpg', suit: 'pentacles', uprightMeaning: '保守固执，控制占有，财务稳定，缺乏安全感', reversedMeaning: '贪婪自私，松开控制，金钱流失，学会分享' },
    { id: 'p05', name: '星币五 Five of Pentacles', image: '/tarot/p05.jpg', suit: 'pentacles', uprightMeaning: '贫困艰难，孤立无援，身体抱恙，精神匮乏', reversedMeaning: '峰回路转，获得援助，走出困境，重拾希望' },
    { id: 'p06', name: '星币六 Six of Pentacles', image: '/tarot/p06.jpg', suit: 'pentacles', uprightMeaning: '慷慨给予，慈善分享，公平交易，接受帮助', reversedMeaning: '自私吝啬，债务问题，不公待遇，利用关系' },
    { id: 'p07', name: '星币七 Seven of Pentacles', image: '/tarot/p07.jpg', suit: 'pentacles', uprightMeaning: '耐心等待，评估成果，长期投资，思考未来', reversedMeaning: '急功近利，收获甚微，缺乏规划，半途而废' },
    { id: 'p08', name: '星币八 Eight of Pentacles', image: '/tarot/p08.jpg', suit: 'pentacles', uprightMeaning: '专注工匠，勤奋努力，技能提升，细节完美', reversedMeaning: '粗制滥造，缺乏野心，工作枯燥，眼高手低' },
    { id: 'p09', name: '星币九 Nine of Pentacles', image: '/tarot/p09.jpg', suit: 'pentacles', uprightMeaning: '富足独立，享受生活，优雅自信，成果丰硕', reversedMeaning: '依赖他人，财务虚假，表面光鲜，缺乏自律' },
    { id: 'p10', name: '星币十 Ten of Pentacles', image: '/tarot/p10.jpg', suit: 'pentacles', uprightMeaning: '家族传承，长久富足，稳固基础，传统价值', reversedMeaning: '家庭纷争，财务危机，传统束缚，失去根基' },
    { id: 'p11', name: '星币侍从 Page of Pentacles', image: '/tarot/p11.jpg', suit: 'pentacles', uprightMeaning: '勤奋好学，务实专注，新机会，稳步前进', reversedMeaning: '懒惰拖延，缺乏常识，不切实际，浪费机会' },
    { id: 'p12', name: '星币骑士 Knight of Pentacles', image: '/tarot/p12.jpg', suit: 'pentacles', uprightMeaning: '勤劳可靠，按部就班，耐心坚持，注重效率', reversedMeaning: '停滞不前，固执死板，过于保守，工作狂在' },
    { id: 'p13', name: '星币皇后 Queen of Pentacles', image: '/tarot/p13.jpg', suit: 'pentacles', uprightMeaning: '富足慷慨，务实照顾，家庭主妇，自然连结', reversedMeaning: '注重物质，缺乏安全感，工作狂，忽视家庭' },
    { id: 'p14', name: '星币国王 King of Pentacles', image: '/tarot/p14.jpg', suit: 'pentacles', uprightMeaning: '成功富有，商业头脑，稳重可靠，现实主义', reversedMeaning: '贪婪腐败，唯利是图，固执愚蠢，滥用资源' },
];

export const allCards: TarotCard[] = [
    ...majorArcana,
    ...wands,
    ...cups,
    ...swords,
    ...pentacles,
];

export const CARD_BACK_IMAGE = '/tarot/card-back.png';

// Shuffle and draw a card with random orientation
// excludeIds: 已抽出的牌 ID 集合，用于防止抽出重复的牌
export const drawRandomCard = (excludeIds: string[] = []): DrawnCard => {
    const excludeSet = new Set(excludeIds);
    const availableCards = allCards.filter(c => !excludeSet.has(c.id));
    // 容错：如果所有牌都被排除了（理论上不可能），回退到全部牌
    const pool = availableCards.length > 0 ? availableCards : allCards;
    const card = pool[Math.floor(Math.random() * pool.length)];
    const isReversed = Math.random() > 0.5; // 50% chance of reversed

    return {
        card,
        isReversed,
        isRevealed: false,
    };
};
