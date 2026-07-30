// interviewQuestions.ts - 通用人格访谈问题数据 + 画像生成
// 问题来源：docs/mbti_social_interview_templates.md（通用化版本）

export interface InterviewOption {
  text: string
  traitTags: string[]
}

export interface InterviewQuestion {
  id: number
  question: string
  dimension: '社交倾向' | '决策风格' | '情感表达' | '应对方式' | '核心驱动'
  options: InterviewOption[]
}

export interface InterviewAnswer {
  questionId: number
  selectedOption: number
  traitTags: string[]
}

export const interviewQuestions: InterviewQuestion[] = [
  // ---- 暖场 Q1-Q3：轻松有趣，零压力 ----
  {
    id: 1,
    question: '最近有没有什么让你特别有成就感的事？不一定是大事，小事也算。',
    dimension: '核心驱动',
    options: [
      { text: '搞定了一个拖了很久的目标，终于完成了', traitTags: ['成就驱动', '目标导向'] },
      { text: '帮到了一个重要的人，看到对方变好了', traitTags: ['奉献驱动', '利他主义'] },
      { text: '学会了一个新技能，或者想通了一件事', traitTags: ['成长驱动', '自我突破'] },
      { text: '给自己放了个假，终于好好休息了一下', traitTags: ['自由驱动', '自我关怀'] },
    ],
  },
  {
    id: 2,
    question: '你平时休息的时候喜欢干嘛？你会不会是那种休息也闲不下来的人？',
    dimension: '应对方式',
    options: [
      { text: '确实闲不住，休息也在搞点什么事情', traitTags: ['直面型', '行动释压'] },
      { text: '会约朋友出来吃饭聊天，社交就是放松', traitTags: ['倾诉型', '社交疗愈'] },
      { text: '更喜欢一个人待着，看剧听歌发呆', traitTags: ['独处型', '自我修复'] },
      { text: '看心情，有时候很活跃有时候就想躺平', traitTags: ['转移型', '灵活切换'] },
    ],
  },
  {
    id: 3,
    question: '你信星座那些吗？你觉得性格测试这种东西准不准？',
    dimension: '决策风格',
    options: [
      { text: '不太信，但偶尔看看觉得还挺有意思的', traitTags: ['开放协作', '理性好奇'] },
      { text: '有些说法确实挺准的，我觉得有参考价值', traitTags: ['直觉引导', '感性决策'] },
      { text: '完全不信，觉得这些都是巴纳姆效应', traitTags: ['理性缜密', '数据驱动'] },
      { text: '说不上信不信，主要看聊天场景', traitTags: ['灵活适应', '场景切换'] },
    ],
  },

  // ---- 探索 Q4-Q7：了解思维方式和价值观 ----
  {
    id: 4,
    question: '什么样的人会让你觉得「跟这个人聊天不浪费时间」？',
    dimension: '社交倾向',
    options: [
      { text: '有自己想法、能跟我碰撞观点的人', traitTags: ['主动引领', '思想碰撞'] },
      { text: '真诚不装、聊天让人舒服的人', traitTags: ['内敛观察', '真诚至上'] },
      { text: '有趣、脑洞大、能带来新鲜感的人', traitTags: ['活跃外向', '感染力强'] },
      { text: '靠谱踏实、说到做到的人', traitTags: ['稳重观望', '务实可靠'] },
    ],
  },
  {
    id: 5,
    question: '你有没有过那种「所有人都不理解我为什么要做这件事」的时刻？后来怎么样了？',
    dimension: '决策风格',
    options: [
      { text: '经常，但我不太在意，坚持做了就对了', traitTags: ['果断直觉', '效率优先'] },
      { text: '有过，会难受一阵，但还是选择相信自己', traitTags: ['直觉引导', '内心坚定'] },
      { text: '会犹豫，但最后还是用事实证明了自己', traitTags: ['理性缜密', '用结果说话'] },
      { text: '确实动摇过，后来找到了理解我的人才好一些', traitTags: ['开放协作', '需要认同'] },
    ],
  },
  {
    id: 6,
    question: '你觉得你身边的人真的了解你吗？还是大家看到的更多是你「能干」的那一面？',
    dimension: '情感表达',
    options: [
      { text: '大多数人只看到我能干，很少有人看到我的另一面', traitTags: ['外刚内柔', '渴望理解'] },
      { text: '我觉得了解我的人还是有几个的，虽然不多', traitTags: ['内敛深沉', '选择性敞开'] },
      { text: '我其实挺表里如一的，大家看到的就是真实的我', traitTags: ['坦率直接', '勇敢表达'] },
      { text: '说实话我也不确定真正的我是什么样的', traitTags: ['含蓄试探', '自我探索'] },
    ],
  },
  {
    id: 7,
    question: '你有没有那种「别人觉得你不在意、但其实你挺在乎」的事情？',
    dimension: '情感表达',
    options: [
      { text: '有，比如某个人对我的评价或态度', traitTags: ['内敛深沉', '细腻敏感'] },
      { text: '有，一些被忽视的付出或努力', traitTags: ['外刚内柔', '渴望认可'] },
      { text: '不太有，我在意的事一般都会直接说', traitTags: ['坦率直接', '不藏着掖着'] },
      { text: '有一些，但我习惯自己消化，不太想让别人知道', traitTags: ['内省型', '独自消化'] },
    ],
  },

  // ---- 深入 Q8-Q10：触及内心世界，建立更深连接 ----
  {
    id: 8,
    question: '我觉得你是那种外面很果断、但其实内心也有很细腻一面的人。你觉得呢？',
    dimension: '应对方式',
    options: [
      { text: '被你说中了，其实我内心挺敏感的，只是不怎么表现出来', traitTags: ['直面型', '外强内柔'] },
      { text: '还好吧，我觉得我确实比较理性，不太容易动感情', traitTags: ['冷静型', '理性主导'] },
      { text: '看情况，对在意的人会很细腻，对不在意的就无所谓', traitTags: ['和谐型', '选择性温柔'] },
      { text: '我觉得每个人都有细腻的时候吧，不只是我', traitTags: ['内省型', '不愿被标签'] },
    ],
  },
  {
    id: 9,
    question: '最近有什么值得期待的事吗？工作上的、生活上的都算。',
    dimension: '核心驱动',
    options: [
      { text: '有个目标/项目快要达成了，很期待结果', traitTags: ['成就驱动', '目标导向'] },
      { text: '想跟某个人/某些朋友好好聚一聚', traitTags: ['连接驱动', '关系深度'] },
      { text: '计划去旅行或者做一件一直想做的事', traitTags: ['自由驱动', '自我实现'] },
      { text: '没什么特别的，走一步看一步吧', traitTags: ['安全驱动', '顺其自然'] },
    ],
  },
  {
    id: 10,
    question: '什么样的关系会让你愿意卸下那些「随时准备好」的状态？就是可以完全放松的那种。',
    dimension: '社交倾向',
    options: [
      { text: '彼此势均力敌、不用演、可以直说的关系', traitTags: ['主动引领', '对等伙伴'] },
      { text: '对方真的懂我、不用解释太多的关系', traitTags: ['内敛观察', '深度理解'] },
      { text: '不用时刻在线、各自有空间但知道对方在的关系', traitTags: ['灵活适应', '弹性边界'] },
      { text: '在一起就安心、不用刻意维护的关系', traitTags: ['稳重观望', '自然舒适'] },
    ],
  },
]

export const interviewQuestionsEn = [
  {
    question: 'What has made you feel accomplished recently, even if it was something small?',
    options: [
      'I finally completed a goal I had delayed for a long time.',
      'I helped someone important and saw things improve for them.',
      'I learned a skill or reached a new understanding.',
      'I gave myself a real break and finally rested.',
    ],
  },
  {
    question: 'What do you usually do to recharge?',
    options: [
      'I rarely sit still; even rest involves doing something.',
      'I meet friends and recharge through conversation.',
      'I prefer being alone with a show, music, or quiet time.',
      'It depends: sometimes I am active, sometimes I do nothing.',
    ],
  },
  {
    question: 'How do you feel about astrology and personality tests?',
    options: [
      'I do not really believe them, but they can be interesting.',
      'Some descriptions feel accurate enough to be useful.',
      'I do not believe them; they mostly reflect the Barnum effect.',
      'I am undecided and treat them as part of the conversation.',
    ],
  },
  {
    question: 'What kind of person makes a conversation feel worthwhile?',
    options: [
      'Someone with independent ideas who can challenge mine.',
      'Someone genuine who makes conversation feel easy.',
      'Someone imaginative, playful, and full of fresh perspectives.',
      'Someone dependable who does what they say.',
    ],
  },
  {
    question: 'When others do not understand a decision you care about, what tends to happen?',
    options: [
      'It happens often, but I keep going without worrying much.',
      'It hurts for a while, but I still choose to trust myself.',
      'I hesitate, then let evidence and results make the case.',
      'I can lose confidence until I find someone who understands.',
    ],
  },
  {
    question: 'Do the people around you know the whole you, or mostly your capable side?',
    options: [
      'Most people see competence and very few see the other side.',
      'A small number of people know me well.',
      'I am fairly consistent; what people see is the real me.',
      'I am not always sure what the real me looks like.',
    ],
  },
  {
    question: 'Is there anything others think you do not care about, although you actually do?',
    options: [
      'Yes, especially someone’s opinion or attitude toward me.',
      'Yes, effort or contributions that went unnoticed.',
      'Not often; I usually say what matters to me.',
      'Yes, but I tend to process it privately.',
    ],
  },
  {
    question: 'Do you seem decisive on the outside while feeling more sensitive within?',
    options: [
      'Yes. I am quite sensitive but rarely show it.',
      'Not especially. Reason usually leads for me.',
      'It depends. I am tender with people who matter to me.',
      'Everyone has a sensitive side; I resist that kind of label.',
    ],
  },
  {
    question: 'What are you looking forward to at the moment?',
    options: [
      'A goal or project is close to completion.',
      'Spending meaningful time with someone important.',
      'Traveling or finally doing something I have wanted to do.',
      'Nothing specific; I am taking life one step at a time.',
    ],
  },
  {
    question: 'What kind of relationship lets you fully lower your guard?',
    options: [
      'An equal relationship where both people can speak plainly.',
      'One where I feel understood without explaining everything.',
      'One with space and independence, but dependable presence.',
      'One that feels secure without constant maintenance.',
    ],
  },
] as const

// 维度→选项特征的映射关系
interface DimensionProfile {
  label: string
  description: string
}

const dimensionProfiles: Record<string, Record<string, DimensionProfile>> = {
  社交倾向: {
    主动引领: { label: '主动引领型', description: '倾向于在关系中扮演推动者角色，欣赏思想碰撞与对等交锋' },
    活跃外向: { label: '活力感染型', description: '天生的气氛制造者，被有趣和新鲜感所吸引' },
    内敛观察: { label: '静默观察型', description: '更看重真诚和深度理解，不轻易敞开但一旦打开连接极深' },
    灵活适应: { label: '弹性边界型', description: '重视关系中的空间感，在亲密与独立之间找到平衡' },
    稳重观望: { label: '稳重务实型', description: '看重靠谱和踏实，在确认安全后才会真正放松' },
    思想碰撞: { label: '主动引领型', description: '倾向于在关系中扮演推动者角色，欣赏思想碰撞与对等交锋' },
    真诚至上: { label: '静默观察型', description: '更看重真诚和深度理解，不轻易敞开但一旦打开连接极深' },
    感染力强: { label: '活力感染型', description: '天生的气氛制造者，被有趣和新鲜感所吸引' },
    务实可靠: { label: '稳重务实型', description: '看重靠谱和踏实，在确认安全后才会真正放松' },
    对等伙伴: { label: '主动引领型', description: '倾向于在关系中扮演推动者角色，欣赏思想碰撞与对等交锋' },
    深度理解: { label: '静默观察型', description: '更看重真诚和深度理解，不轻易敞开但一旦打开连接极深' },
    弹性边界: { label: '弹性边界型', description: '重视关系中的空间感，在亲密与独立之间找到平衡' },
    自然舒适: { label: '稳重务实型', description: '看重靠谱和踏实，在确认安全后才会真正放松' },
  },
  决策风格: {
    果断直觉: { label: '果断直觉型', description: '做决定时依赖内心判断，注重效率，不太在意外界看法' },
    理性缜密: { label: '理性分析型', description: '重视逻辑和数据，习惯用结果说话' },
    直觉引导: { label: '感性直觉型', description: '相信内心的声音，虽会犹豫但最终跟着感觉走' },
    开放协作: { label: '开放协作型', description: '重视外界反馈和认同，在沟通中确认方向' },
    效率优先: { label: '果断直觉型', description: '做决定时依赖内心判断，注重效率，不太在意外界看法' },
    数据驱动: { label: '理性分析型', description: '重视逻辑和数据，习惯用结果说话' },
    感性决策: { label: '感性直觉型', description: '相信内心的声音，虽会犹豫但最终跟着感觉走' },
    理性好奇: { label: '开放协作型', description: '重视外界反馈和认同，在沟通中确认方向' },
    内心坚定: { label: '果断直觉型', description: '做决定时依赖内心判断，注重效率，不太在意外界看法' },
    用结果说话: { label: '理性分析型', description: '重视逻辑和数据，习惯用结果说话' },
    需要认同: { label: '开放协作型', description: '重视外界反馈和认同，在沟通中确认方向' },
    场景切换: { label: '开放协作型', description: '重视外界反馈和认同，在沟通中确认方向' },
    灵活适应: { label: '开放协作型', description: '重视外界反馈和认同，在沟通中确认方向' },
  },
  情感表达: {
    外刚内柔: { label: '外刚内柔型', description: '外在果断强势，内心有着不常展示的柔软和渴望被理解' },
    内敛深沉: { label: '内敛深沉型', description: '不轻易表露情绪，但对在意的人和事记得清清楚楚' },
    坦率直接: { label: '坦率直接型', description: '表里如一，在意就说在意，不喜欢猜来猜去' },
    含蓄试探: { label: '含蓄探索型', description: '对自我和情感保持探索的姿态，不急于定义' },
    渴望理解: { label: '外刚内柔型', description: '外在果断强势，内心有着不常展示的柔软和渴望被理解' },
    选择性敞开: { label: '内敛深沉型', description: '不轻易表露情绪，但对在意的人和事记得清清楚楚' },
    勇敢表达: { label: '坦率直接型', description: '表里如一，在意就说在意，不喜欢猜来猜去' },
    自我探索: { label: '含蓄探索型', description: '对自我和情感保持探索的姿态，不急于定义' },
    细腻敏感: { label: '内敛深沉型', description: '不轻易表露情绪，但对在意的人和事记得清清楚楚' },
    渴望认可: { label: '外刚内柔型', description: '外在果断强势，内心有着不常展示的柔软和渴望被理解' },
    不藏着掖着: { label: '坦率直接型', description: '表里如一，在意就说在意，不喜欢猜来猜去' },
    独自消化: { label: '内敛深沉型', description: '不轻易表露情绪，但对在意的人和事记得清清楚楚' },
    内省型: { label: '内敛深沉型', description: '不轻易表露情绪，但对在意的人和事记得清清楚楚' },
  },
  应对方式: {
    直面型: { label: '外强内柔型', description: '看似什么都扛得住，其实内心比外表敏感得多' },
    冷静型: { label: '理性主导型', description: '习惯用理性处理一切，不太容易被情绪左右' },
    和谐型: { label: '选择性温柔型', description: '对在意的人会展现柔软的一面，其他时候偏理性' },
    内省型: { label: '内省沉淀型', description: '不愿被轻易定义，习惯在内心深处消化和理解自己' },
    倾诉型: { label: '社交充电型', description: '通过与人相处来释放压力和恢复能量' },
    独处型: { label: '独处充电型', description: '需要安静的空间来恢复能量和整理内心' },
    转移型: { label: '灵活调节型', description: '善于在不同状态间切换，用多样方式平衡自己' },
    行动释压: { label: '外强内柔型', description: '看似什么都扛得住，其实内心比外表敏感得多' },
    社交疗愈: { label: '社交充电型', description: '通过与人相处来释放压力和恢复能量' },
    自我修复: { label: '独处充电型', description: '需要安静的空间来恢复能量和整理内心' },
    灵活切换: { label: '灵活调节型', description: '善于在不同状态间切换，用多样方式平衡自己' },
    外强内柔: { label: '外强内柔型', description: '看似什么都扛得住，其实内心比外表敏感得多' },
    理性主导: { label: '理性主导型', description: '习惯用理性处理一切，不太容易被情绪左右' },
    选择性温柔: { label: '选择性温柔型', description: '对在意的人会展现柔软的一面，其他时候偏理性' },
    不愿被标签: { label: '内省沉淀型', description: '不愿被轻易定义，习惯在内心深处消化和理解自己' },
  },
  核心驱动: {
    成就驱动: { label: '成就与掌控', description: '追求目标感和对生活的主动权，完成挑战是最大的满足' },
    连接驱动: { label: '连接与陪伴', description: '渴望与重要的人有深度的交流和真实的陪伴' },
    奉献驱动: { label: '奉献与价值', description: '在帮助他人中找到自己的意义和满足感' },
    自由驱动: { label: '自由与探索', description: '追寻内心热爱，渴望去做一直想做的事' },
    安全驱动: { label: '安稳与从容', description: '不急于追赶什么，顺其自然是一种智慧' },
    成长驱动: { label: '成长与突破', description: '享受学会新东西、想通一件事的那种通透感' },
    目标导向: { label: '成就与掌控', description: '追求目标感和对生活的主动权，完成挑战是最大的满足' },
    利他主义: { label: '奉献与价值', description: '在帮助他人中找到自己的意义和满足感' },
    自我突破: { label: '成长与突破', description: '享受学会新东西、想通一件事的那种通透感' },
    自我关怀: { label: '自由与探索', description: '追寻内心热爱，渴望去做一直想做的事' },
    自我实现: { label: '自由与探索', description: '追寻内心热爱，渴望去做一直想做的事' },
    关系深度: { label: '连接与陪伴', description: '渴望与重要的人有深度的交流和真实的陪伴' },
    顺其自然: { label: '安稳与从容', description: '不急于追赶什么，顺其自然是一种智慧' },
  },
}

// 综合印象模板——根据维度组合生成
const impressionTemplates: Record<string, string> = {
  '主动引领型+果断直觉型': '这是一个天生的引领者，习惯走在前面为大家开路。做决定果断且有魄力，但内心深处渴望被真正看见和理解。',
  '主动引领型+理性分析型': '外在雷厉风行，内在却有严密的逻辑系统在运转。是那种嘴上说着"无所谓"，心里却记得很清楚的人。',
  '静默观察型+理性分析型': '安静的思考者，在旁人看不到的地方进行着深度的分析和判断。不轻易表态，但一旦开口往往一针见血。',
  '静默观察型+果断直觉型': '表面平静如水，内心却有清晰的判断在引导方向。是被低估的敏锐灵魂，少数被信任的人才能看到真实的一面。',
  '活力感染型+果断直觉型': '充满能量和行动力，凭直觉快速做出判断，是人群中最抢眼的存在。热烈而真诚。',
  '弹性边界型+开放协作型': '是一个高度灵活的人，善于在不同关系和环境中找到最舒适的位置，重视空间感和边界感。',
  '稳重务实型+理性分析型': '脚踏实地、重视结果的人。不会轻易被情绪左右，但内心对关系的品质有很高的要求。',
}

function getDefaultImpression(socialLabel: string, emotionLabel: string, driveLabel: string): string {
  if (emotionLabel.includes('外刚内柔')) {
    return `这是一个外在干练果断、内在细腻敏感的人。习惯扛起责任，渴望被真正理解但不善主动表达需求。在关系中重视${driveLabel.includes('成就') ? '对等和深度' : '真诚和温度'}。`
  }
  if (emotionLabel.includes('内敛深沉')) {
    return `这是一个${socialLabel.includes('主动') ? '外在充满行动力' : '看似平和沉稳'}、内在世界丰富而细腻的人。对在意的人和事记得清清楚楚，只是不轻易说出口。在关系中${driveLabel.includes('连接') ? '渴望真正的灵魂共鸣' : '追求深度而非广度'}。`
  }
  if (emotionLabel.includes('坦率')) {
    return `这是一个真诚而炽热的人，不掩饰自己的情感和想法。${socialLabel.includes('主动') ? '在关系中是推动者和守护者' : '用真诚打动身边每一个人'}，追求${driveLabel.includes('自由') ? '自由而热烈的生活方式' : '深刻而有力量的连接'}。`
  }
  return `这是一个有着丰富内在世界的人，${socialLabel.includes('主动') ? '外在充满行动力' : '外在看似随和'}，内心有着自己清晰的标准和坚持。在关系中${driveLabel.includes('连接') ? '渴望真正的灵魂共鸣' : '追求真实而舒适的相处'}。`
}

export async function generatePersonalityProfileAsync(
  answers: InterviewAnswer[],
  language: 'zh-CN' | 'en' = 'zh-CN',
  onChunk?: (text: string) => void
): Promise<string> {
  const isChinese = language === 'zh-CN'
  const fallbackProfile = isChinese
    ? generatePersonalityProfile(answers)
    : generateEnglishPersonalityProfile(answers)

  // 构建传给 Gemini 的 prompt
  try {
    const qaDetails = answers.map((ans, idx) => {
      const q = interviewQuestions.find(i => i.id === ans.questionId)
      if (!q) return ''
      const localized = interviewQuestionsEn[q.id - 1]
      const questionText = isChinese ? q.question : localized.question
      const selectedText = isChinese ? q.options[ans.selectedOption].text : localized.options[ans.selectedOption]
      return isChinese
        ? `【问题${idx + 1}】：${questionText}\n【用户的选择】：${selectedText}`
        : `Question ${idx + 1}: ${questionText}\nAnswer: ${selectedText}`
    }).join('\n\n')

    const prompt = isChinese
      ? `你是一位擅长沟通偏好分析的助手。用户完成了10道自我观察问题，记录如下：

${qaDetails}

不要输出推理过程，也不要把结果说成心理诊断或客观事实。直接生成一份沟通偏好画像：

[个性画像]
社交倾向: [四字词语] — [一句话解释（15字以内）]
决策风格: [四字词语] — [一句话解释]
情感表达: [四字词语] — [一句话解释]
应对方式: [四字词语] — [一句话解释]
核心驱动: [四字词语] — [一句话解释]

综合印象: [60-80字，基于用户选择，使用克制、尊重且不武断的表达。]
`
      : `You analyze communication preferences. The user answered ten self-reflection questions:

${qaDetails}

Do not reveal hidden reasoning or present this as a diagnosis or objective fact. Return only this plain-text structure:

[Personality Profile]
Social style: [short label] — [one-sentence explanation]
Decision style: [short label] — [one-sentence explanation]
Emotional expression: [short label] — [one-sentence explanation]
Coping style: [short label] — [one-sentence explanation]
Core motivation: [short label] — [one-sentence explanation]

Overall impression: [60-90 words grounded in the selected answers, respectful and appropriately uncertain.]
`

    let deviceId = localStorage.getItem('tarot_device_uuid')
    if (!deviceId) {
      deviceId = crypto.randomUUID()
      localStorage.setItem('tarot_device_uuid', deviceId)
    }

    const response = await fetch('/api/reading?fast=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        language,
      })
    })

    if (!response.body) throw new Error('No body')
    
    // 我们只需要非流式的完整文本，这里简单把流合并
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let text = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()
          if (jsonStr === '[DONE]' || !jsonStr) continue
          try {
            const data = JSON.parse(jsonStr)
            const part = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (part) {
              text += part
              if (onChunk) onChunk(part)
            }
          } catch { /* ignore malformed provider event */ }
        }
      }
    }

    if (text.trim().length > 50 && text.includes(isChinese ? '综合印象' : 'Overall impression')) {
      return text.trim()
    }
    console.warn('Profile output used an unexpected format; using the local fallback.')
    return fallbackProfile

  } catch (error) {
    console.error('Dynamic profile generation failed; using the local fallback:', error)
    return fallbackProfile
  }
}

function generateEnglishPersonalityProfile(answers: InterviewAnswer[]): string {
  const choice = (questionId: number) =>
    answers.find(answer => answer.questionId === questionId)?.selectedOption ?? 0
  const social = ['Engaged challenger', 'Quiet connector', 'Curious catalyst', 'Steady builder'][choice(4)]
  const decision = ['Independent mover', 'Values-led', 'Evidence-led', 'Collaborative'][choice(5)]
  const emotion = ['Private sensitivity', 'Selective openness', 'Direct expression', 'Reflective openness'][choice(6)]
  const coping = ['Action-oriented', 'Analytical', 'Selectively tender', 'Self-reflective'][choice(8)]
  const drive = ['Achievement', 'Connection', 'Freedom', 'Steadiness'][choice(9)]

  return `[Personality Profile]
Social style: ${social} — You value conversations that feel genuine and worthwhile.
Decision style: ${decision} — You tend to move forward in a way that protects both judgment and autonomy.
Emotional expression: ${emotion} — You choose carefully when and how to make inner concerns visible.
Coping style: ${coping} — You restore balance through a pattern that fits the situation.
Core motivation: ${drive} — This theme appears to shape what currently deserves your energy.

Overall impression: Your answers suggest a person who values both self-direction and meaningful connection. You may prefer responses that respect complexity without turning every feeling into a fixed label. Clear options, honest boundaries, and room to make your own judgment are likely to be more useful than certainty or generic reassurance.`
}

export function generatePersonalityProfile(answers: InterviewAnswer[]): string {
  // 按维度统计 traitTags 出现频率
  const dimensionTagCounts: Record<string, Record<string, number>> = {}

  for (const answer of answers) {
    const question = interviewQuestions.find((q) => q.id === answer.questionId)
    if (!question) continue

    const dim = question.dimension
    if (!dimensionTagCounts[dim]) dimensionTagCounts[dim] = {}

    for (const tag of answer.traitTags) {
      dimensionTagCounts[dim][tag] = (dimensionTagCounts[dim][tag] || 0) + 1
    }
  }

  // 每个维度取出现次数最多的 tag
  const dimensionResults: Record<string, DimensionProfile> = {}
  const dimensionLabels: Record<string, string> = {}

  for (const [dim, tags] of Object.entries(dimensionTagCounts)) {
    let topTag = ''
    let topCount = 0
    for (const [tag, count] of Object.entries(tags)) {
      if (count > topCount) {
        topTag = tag
        topCount = count
      }
    }

    const profiles = dimensionProfiles[dim]
    if (profiles && profiles[topTag]) {
      dimensionResults[dim] = profiles[topTag]
      dimensionLabels[dim] = profiles[topTag].label
    } else {
      // fallback: 用第一个 tag
      const firstTag = Object.keys(tags)[0]
      if (profiles && profiles[firstTag]) {
        dimensionResults[dim] = profiles[firstTag]
        dimensionLabels[dim] = profiles[firstTag].label
      } else {
        dimensionResults[dim] = { label: '多元型', description: '兼具多种特质，不拘一格' }
        dimensionLabels[dim] = '多元型'
      }
    }
  }

  // 构建画像文本
  const lines: string[] = ['[用户个性画像]']

  const dimensionOrder: string[] = ['社交倾向', '决策风格', '情感表达', '应对方式', '核心驱动']
  for (const dim of dimensionOrder) {
    const profile = dimensionResults[dim]
    if (profile) {
      lines.push(`${dim}: ${profile.label} — ${profile.description}`)
    }
  }

  // 综合印象
  const socialLabel = dimensionLabels['社交倾向'] || ''
  const decisionLabel = dimensionLabels['决策风格'] || ''
  const emotionLabel = dimensionLabels['情感表达'] || ''
  const driveLabel = dimensionLabels['核心驱动'] || ''

  const key = `${socialLabel}+${decisionLabel}`
  const impression =
    impressionTemplates[key] || getDefaultImpression(socialLabel, emotionLabel, driveLabel)

  lines.push('')
  lines.push(`综合印象: ${impression}`)

  return lines.join('\n')
}
