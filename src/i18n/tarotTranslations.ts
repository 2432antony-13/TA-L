import type { TarotCard } from '../data/tarotCards'
import type { Language } from './LanguageContext'

type MeaningPair = readonly [upright: string, reversed: string]

const englishMeanings: Record<string, MeaningPair> = {
  m00: ['New beginnings, freedom, curiosity, and a leap into the unknown.', 'Recklessness, poor preparation, or fear of taking the next step.'],
  m01: ['Skill, initiative, focused will, and making good use of available resources.', 'Manipulation, scattered ability, or potential left unused.'],
  m02: ['Intuition, inner knowledge, mystery, and attention to what is unspoken.', 'Ignoring intuition, hidden information, or a surface-level reading of events.'],
  m03: ['Creativity, abundance, nurture, sensuality, and growth.', 'Creative blockage, dependence, overgiving, or neglect of your own needs.'],
  m04: ['Structure, leadership, stability, boundaries, and responsible authority.', 'Rigidity, control, poor discipline, or authority used without care.'],
  m05: ['Tradition, shared values, guidance, learning, and established practice.', 'Questioning convention, choosing an independent path, or rigid dogma.'],
  m06: ['Connection, alignment of values, intimacy, and a meaningful choice.', 'Misalignment, conflict in values, imbalance, or a difficult decision.'],
  m07: ['Direction, determination, self-command, and purposeful movement.', 'Loss of direction, aggression, or competing impulses pulling apart.'],
  m08: ['Quiet courage, patience, compassion, and steady inner strength.', 'Self-doubt, depleted confidence, or emotions that feel hard to contain.'],
  m09: ['Reflection, solitude, careful searching, and guidance from within.', 'Isolation, withdrawal, or refusing insight and support.'],
  m10: ['Cycles, turning points, changing conditions, and unexpected opportunity.', 'Resistance to change, repeated patterns, or a temporary loss of control.'],
  m11: ['Fairness, truth, accountability, and decisions based on clear evidence.', 'Bias, avoidance of responsibility, or an outcome that feels unfair.'],
  m12: ['A pause, surrender, changed perspective, and seeing from another angle.', 'Stagnation, needless sacrifice, delay, or refusal to reconsider.'],
  m13: ['An ending that makes transformation, release, and renewal possible.', 'Clinging to the past, fear of transition, or a change being postponed.'],
  m14: ['Balance, moderation, integration, patience, and thoughtful adjustment.', 'Excess, poor coordination, impatience, or inner imbalance.'],
  m15: ['Attachment, temptation, limiting patterns, and confronting the shadow.', 'Breaking a dependency, reclaiming choice, and loosening old restraints.'],
  m16: ['Sudden truth, disruption, collapse of a false structure, and liberation.', 'Avoided upheaval, delayed change, or fear of an uncomfortable truth.'],
  m17: ['Hope, renewal, inspiration, calm, and trust in a longer horizon.', 'Discouragement, lost confidence, or difficulty reconnecting with purpose.'],
  m18: ['Uncertainty, dreams, intuition, projection, and what remains unclear.', 'Confusion lifting, fear becoming visible, and reality returning to focus.'],
  m19: ['Clarity, vitality, warmth, success, and uncomplicated joy.', 'Delayed success, dimmed enthusiasm, or optimism that needs grounding.'],
  m20: ['Awakening, review, forgiveness, a calling, and a consequential choice.', 'Harsh self-judgment, avoidance, or reluctance to answer an inner call.'],
  m21: ['Completion, integration, accomplishment, and the close of a cycle.', 'Unfinished business, lack of closure, or one final step still required.'],
  w01: ['A spark of inspiration, creative energy, and the start of action.', 'Low energy, delayed plans, or an idea that has not found its form.'],
  w02: ['Planning, foresight, personal power, and choosing a direction.', 'Fear of the unknown, narrow options, or hesitation over the next move.'],
  w03: ['Expansion, progress, preparation, and looking toward a wider horizon.', 'Limited foresight, delay, or an opportunity constrained by poor coordination.'],
  w04: ['Celebration, belonging, stability, and a milestone worth recognizing.', 'Tension at home, unstable foundations, or a celebration being postponed.'],
  w05: ['Competition, friction, debate, and growth through differing views.', 'Unproductive conflict, avoidance, or energy lost to internal struggle.'],
  w06: ['Recognition, confidence, progress, and a visible achievement.', 'A setback, damaged confidence, or dependence on outside approval.'],
  w07: ['Defending your position, persistence, courage, and healthy boundaries.', 'Feeling overwhelmed, giving ground too soon, or losing confidence.'],
  w08: ['Momentum, rapid communication, movement, and events gathering speed.', 'Delay, misdirected energy, impulsiveness, or crossed messages.'],
  w09: ['Resilience, vigilance, recovery, and one last sustained effort.', 'Exhaustion, defensiveness, or difficulty believing the effort is worthwhile.'],
  w10: ['Responsibility, pressure, hard work, and carrying too much alone.', 'Releasing a burden, delegating, or being unable to sustain the load.'],
  w11: ['Curiosity, fresh enthusiasm, discovery, and an encouraging message.', 'Restlessness, immature action, or inspiration without follow-through.'],
  w12: ['Adventure, bold movement, passion, and decisive action.', 'Haste, anger, scattered energy, or action without regard for consequences.'],
  w13: ['Confidence, independence, warmth, charisma, and creative leadership.', 'Jealousy, insecurity, volatility, or confidence becoming self-absorption.'],
  w14: ['Vision, enterprise, mature leadership, and inspiring others to act.', 'Domineering behavior, impatience, or expectations imposed too forcefully.'],
  c01: ['Emotional openness, new affection, intuition, and a heart ready to receive.', 'Blocked feeling, emotional depletion, or difficulty accepting connection.'],
  c02: ['Mutual attraction, partnership, reciprocity, and emotional alignment.', 'Disconnection, misunderstanding, imbalance, or a relationship under strain.'],
  c03: ['Friendship, celebration, collaboration, and joy shared with others.', 'Overindulgence, exclusion, gossip, or a social bond losing balance.'],
  c04: ['Withdrawal, contemplation, dissatisfaction, and overlooking an offer.', 'Renewed interest, fresh awareness, and readiness to re-enter life.'],
  c05: ['Grief, regret, disappointment, and attention fixed on what was lost.', 'Acceptance, recovery, and noticing what still remains available.'],
  c06: ['Memory, innocence, kindness, reunion, and comfort from the past.', 'Idealizing the past, dependence, or difficulty growing beyond old patterns.'],
  c07: ['Many possibilities, imagination, temptation, and choices needing clarity.', 'Reality becoming clearer, priorities forming, and a decision being made.'],
  c08: ['Leaving what no longer satisfies, searching, and choosing deeper meaning.', 'Fear of leaving, avoidance, or returning to an unfulfilling situation.'],
  c09: ['Contentment, pleasure, gratitude, and a wish coming within reach.', 'Overindulgence, shallow satisfaction, or an inner need still unmet.'],
  c10: ['Emotional harmony, belonging, shared happiness, and lasting connection.', 'Family tension, broken expectations, or harmony maintained only on the surface.'],
  c11: ['Tender curiosity, intuitive news, creative feeling, and emotional beginnings.', 'Emotional immaturity, oversensitivity, escapism, or blocked intuition.'],
  c12: ['Romance, imagination, charm, and following an emotionally meaningful path.', 'Moodiness, unrealistic promises, emotional manipulation, or avoidance.'],
  c13: ['Compassion, emotional depth, intuition, and calm receptive strength.', 'Emotional overwhelm, dependence, insecurity, or poor boundaries.'],
  c14: ['Emotional steadiness, diplomacy, wisdom, and compassionate self-command.', 'Suppressed feeling, emotional control used manipulatively, or coldness.'],
  s01: ['Mental clarity, truth, a breakthrough, and a decisive new understanding.', 'Confusion, poor judgment, harsh words, or an idea used without care.'],
  s02: ['A stalemate, guardedness, difficult choice, and temporary balance.', 'A decision surfacing, truth revealed, or tension that can no longer be avoided.'],
  s03: ['Heartbreak, painful truth, separation, and grief that needs acknowledgment.', 'Recovery, release, forgiveness, and movement through old pain.'],
  s04: ['Rest, retreat, recovery, and giving the mind space to reset.', 'Restlessness, burnout, or returning before recovery is complete.'],
  s05: ['Conflict, hollow victory, self-interest, and the cost of winning.', 'Reconciliation, making amends, or choosing to leave a conflict behind.'],
  s06: ['Transition, gradual healing, leaving difficulty, and moving toward calm.', 'Unresolved baggage, resistance to transition, or difficulty moving on.'],
  s07: ['Strategy, discretion, independence, and action taken outside the usual path.', 'Exposure, confession, poor strategy, or avoidance becoming unsustainable.'],
  s08: ['Restriction, self-limiting beliefs, uncertainty, and feeling trapped.', 'A new perspective, regained agency, and release from mental restraints.'],
  s09: ['Anxiety, sleeplessness, fear, and distress magnified in the mind.', 'Hope returning, asking for help, and fears beginning to loosen.'],
  s10: ['A painful ending, collapse, finality, and the lowest point before change.', 'Survival, recovery, resisting an ending, or pain beginning to pass.'],
  s11: ['Curiosity, alert thinking, observation, and an eagerness to understand.', 'Gossip, defensiveness, scattered thought, or words used carelessly.'],
  s12: ['Speed, ambition, directness, and pursuing an idea with force.', 'Impulsiveness, aggression, poor timing, or consequences being ignored.'],
  s13: ['Independence, discernment, honesty, and clear boundaries.', 'Bitterness, excessive criticism, isolation, or judgment without compassion.'],
  s14: ['Intellectual authority, reason, ethics, and disciplined judgment.', 'Abuse of power, rigidity, cruelty, or logic detached from humanity.'],
  p01: ['A practical opportunity, material beginning, stability, and tangible value.', 'A missed chance, poor planning, scarcity thinking, or unstable foundations.'],
  p02: ['Adaptability, balance, prioritization, and managing several demands.', 'Overcommitment, disorganization, financial strain, or loss of balance.'],
  p03: ['Craft, teamwork, learning, and recognition for careful contribution.', 'Weak collaboration, uneven quality, or skill that needs development.'],
  p04: ['Security, conservation, control, and protecting what has been built.', 'Possessiveness, fear of loss, or learning to loosen control.'],
  p05: ['Hardship, exclusion, financial or physical strain, and need for support.', 'Recovery, assistance becoming visible, and gradual return to stability.'],
  p06: ['Generosity, exchange, support, fairness, and the balance of giving and receiving.', 'Strings attached, unequal power, debt, or help distributed unfairly.'],
  p07: ['Patience, long-term investment, assessment, and waiting for growth.', 'Impatience, weak returns, poor planning, or effort directed badly.'],
  p08: ['Practice, craftsmanship, diligence, and improvement through repetition.', 'Perfectionism, uninspired work, low standards, or effort without purpose.'],
  p09: ['Independence, refinement, earned comfort, and confidence in your own resources.', 'Overwork, dependence, superficial status, or insecurity behind success.'],
  p10: ['Legacy, long-term security, family resources, and durable achievement.', 'Instability, family conflict, short-term thinking, or a fragile legacy.'],
  p11: ['Study, practical curiosity, a new opportunity, and patient beginnings.', 'Procrastination, poor focus, or an opportunity not taken seriously.'],
  p12: ['Reliability, routine, persistence, and steady progress toward a goal.', 'Stagnation, stubbornness, boredom, or work continuing without direction.'],
  p13: ['Practical care, abundance, resourcefulness, and grounded generosity.', 'Neglect of self, financial dependence, imbalance, or care becoming control.'],
  p14: ['Material stewardship, stability, discipline, and responsible success.', 'Greed, rigidity, possessiveness, or status pursued at too high a cost.'],
}

export function getCardName(card: TarotCard, language: Language): string {
  const englishStart = card.name.search(/[A-Za-z]/)
  if (englishStart < 0) return card.name
  return language === 'en'
    ? card.name.slice(englishStart).trim()
    : card.name.slice(0, englishStart).trim()
}

export function getCardMeaning(card: TarotCard, isReversed: boolean, language: Language): string {
  if (language === 'zh-CN') {
    return isReversed ? card.reversedMeaning : card.uprightMeaning
  }
  const meanings = englishMeanings[card.id]
  return meanings?.[isReversed ? 1 : 0] ?? (isReversed ? 'Reversed meaning.' : 'Upright meaning.')
}
