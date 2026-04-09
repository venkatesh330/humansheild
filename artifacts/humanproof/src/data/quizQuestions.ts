export type Dimension = 'empathic' | 'moral' | 'creative' | 'physical' | 'social' | 'contextual';

export interface QuizOption {
  text: string;
  score: number;
}

export interface QuizQuestion {
  id: number;
  dimension: Dimension;
  question: string;
  reverse_scored?: boolean; // Section 3.1 — if true, flip score: adjustedScore = 5 - rawScore
  options: QuizOption[];
}

export const dimensionLabels: Record<Dimension, string> = {
  empathic: 'Empathic Reasoning',
  moral: 'Moral Judgment',
  creative: 'Creative Intuition',
  physical: 'Physical Presence',
  social: 'Social Influence',
  contextual: 'Contextual Trust',
};

export const dimensionDescriptions: Record<Dimension, string> = {
  empathic: 'Reading emotion, building trust',
  moral: 'Ethics in ambiguous situations',
  creative: 'Making leaps without data',
  physical: 'Embodied, tactile skills',
  social: 'Leadership, persuasion, charisma',
  contextual: 'Relationships that cannot be transferred',
};

export const quizQuestions: QuizQuestion[] = [
  // ── EMPATHIC REASONING — 5 questions (3 original + 2 new) ────────────────
  {
    id: 1,
    dimension: 'empathic',
    question: 'A colleague seems distracted in a meeting but isn\'t saying anything. What do you do?',
    options: [
      { text: 'Continue the meeting — not my place to ask', score: 1 },
      { text: 'Note it and check in privately afterwards', score: 3 },
      { text: 'Gently create space for them to speak if they want to', score: 4 },
      { text: 'Pause the meeting and address the room', score: 5 },
    ],
  },
  {
    id: 2,
    dimension: 'empathic',
    question: 'A client delivers harsh feedback in a call. How do you respond in the moment?',
    options: [
      { text: 'Defend my work with facts and data', score: 1 },
      { text: 'Acknowledge their frustration before responding', score: 4 },
      { text: 'Stay quiet and let them finish', score: 2 },
      { text: 'Redirect to solutions immediately', score: 3 },
    ],
  },
  {
    id: 3,
    dimension: 'empathic',
    question: 'You meet someone once at a conference and remember them 2 years later. How do you recall them?',
    options: [
      { text: 'I rarely remember people I\'ve only met once', score: 1 },
      { text: 'I remember their name and what they did', score: 2 },
      { text: 'I remember details about what they said and felt', score: 4 },
      { text: 'I remember them vividly — their energy, concerns, ambitions', score: 5 },
    ],
  },
  {
    id: 17,
    dimension: 'empathic',
    question: 'When someone in your team is struggling personally, what do you typically do?',
    options: [
      { text: 'I focus on the work — personal issues should stay separate', score: 1 },
      { text: 'I acknowledge the situation briefly then redirect to tasks', score: 2 },
      { text: 'I check in genuinely and adjust workload if needed', score: 4 },
      { text: 'I take time to fully understand, adjust plans, and follow up over days', score: 5 },
    ],
  },
  {
    id: 28,
    dimension: 'empathic',
    reverse_scored: true,
    question: 'When someone becomes emotional in a meeting, what is your first instinct?',
    options: [
      { text: 'I feel uncomfortable and want to move past it quickly', score: 4 },
      { text: 'I acknowledge it briefly but steer back to the agenda', score: 3 },
      { text: 'I pause and let them express themselves fully', score: 2 },
      { text: 'I fully engage with what they are feeling before continuing', score: 1 },
    ],
  },

  // ── MORAL JUDGMENT — 5 questions (3 original + 2 new) ───────────────────
  {
    id: 4,
    dimension: 'moral',
    question: 'Your company asks you to omit a risk from a client report to close a deal. You:',
    options: [
      { text: 'Comply — it\'s my manager\'s call, not mine', score: 1 },
      { text: 'Ask clarifying questions before deciding', score: 2 },
      { text: 'Raise it internally before the report goes out', score: 4 },
      { text: 'Refuse and escalate if needed', score: 5 },
    ],
  },
  {
    id: 5,
    dimension: 'moral',
    question: 'Two team members are equally qualified for a promotion. One needs it more personally. You:',
    options: [
      { text: 'Recommend purely on performance metrics', score: 2 },
      { text: 'Consider context alongside performance', score: 4 },
      { text: 'Escalate to HR — this is too complex', score: 1 },
      { text: 'Discuss openly with both before deciding', score: 5 },
    ],
  },
  {
    id: 6,
    dimension: 'moral',
    question: 'An AI tool gives you a decision faster than a human process. How do you use it?',
    options: [
      { text: 'Trust it fully — data is more reliable than gut', score: 1 },
      { text: 'Use it as input, validate with human judgment', score: 5 },
      { text: 'Use it only for low-stakes decisions', score: 3 },
      { text: 'Ignore it — I prefer my own process', score: 2 },
    ],
  },
  {
    id: 18,
    dimension: 'moral',
    question: 'You discover a senior colleague has been subtly taking credit for junior staff\'s work. You:',
    options: [
      { text: 'Stay out of it — not my place to intervene', score: 1 },
      { text: 'Mention it to the junior staff member privately', score: 2 },
      { text: 'Bring it up directly with the senior colleague first', score: 4 },
      { text: 'Raise it formally and advocate for proper attribution', score: 5 },
    ],
  },
  {
    id: 29,
    dimension: 'moral',
    reverse_scored: true,
    question: 'When a project deadline is at risk, how do you typically handle ethical trade-offs?',
    options: [
      { text: 'Cut corners where possible to hit the deadline — results matter most', score: 4 },
      { text: 'Quietly relax some standards but stay within acceptable ranges', score: 3 },
      { text: 'Flag concerns but follow the team\'s decision', score: 2 },
      { text: 'Maintain standards and negotiate deadline or scope instead', score: 1 },
    ],
  },

  // ── CREATIVE INTUITION — 5 questions (2 original + 3 new) ───────────────
  {
    id: 7,
    dimension: 'creative',
    question: 'You need a solution to a problem no one has solved before. Your first instinct is to:',
    options: [
      { text: 'Research what others have done', score: 2 },
      { text: 'Brainstorm independently first, then research', score: 4 },
      { text: 'Trust a sudden mental image or feeling', score: 5 },
      { text: 'Ask a team to ideate with me', score: 3 },
    ],
  },
  {
    id: 8,
    dimension: 'creative',
    question: 'How often do you have ideas that feel "wrong" on paper but right in your gut?',
    options: [
      { text: 'Rarely — I work from evidence', score: 1 },
      { text: 'Sometimes, but I usually dismiss them', score: 2 },
      { text: 'Often — I test them before sharing', score: 4 },
      { text: 'Constantly — my best ideas start this way', score: 5 },
    ],
  },
  {
    id: 19,
    dimension: 'creative',
    question: 'When given a blank canvas for a project, you feel:',
    options: [
      { text: 'Anxious — I prefer clear constraints and direction', score: 1 },
      { text: 'Cautious — I quickly seek a framework to work within', score: 2 },
      { text: 'Energised — I see the space as full of possibility', score: 4 },
      { text: 'Excited — blank canvases are where I do my best work', score: 5 },
    ],
  },
  {
    id: 20,
    dimension: 'creative',
    question: 'How often do you make meaningful connections between things in different fields (art, science, sport, nature)?',
    options: [
      { text: 'Rarely — I focus on my domain', score: 1 },
      { text: 'Occasionally when something obvious clicks', score: 2 },
      { text: 'Frequently — cross-domain thinking comes naturally to me', score: 4 },
      { text: 'Constantly — it\'s the foundation of how I solve problems', score: 5 },
    ],
  },
  {
    id: 21,
    dimension: 'creative',
    question: 'A project brief asks for something "innovative." What actually happens next?',
    options: [
      { text: 'I find the best existing solution and refine it slightly', score: 1 },
      { text: 'I research what\'s out there and iterate on the strongest example', score: 2 },
      { text: 'I generate many directions then pressure-test the most original', score: 4 },
      { text: 'A new direction emerges organically — I trust the process', score: 5 },
    ],
  },

  // ── PHYSICAL PRESENCE — 5 questions (3 original + 2 new) ────────────────
  {
    id: 9,
    dimension: 'physical',
    question: 'In a room full of people, others tend to:',
    options: [
      { text: 'Not notice me particularly', score: 1 },
      { text: 'Notice me when I speak', score: 2 },
      { text: 'Gravitate toward me before I say anything', score: 5 },
      { text: 'Seek my opinion when things get tense', score: 4 },
    ],
  },
  {
    id: 10,
    dimension: 'physical',
    question: 'How important is physical touch (handshakes, presence, gesture) in how you connect professionally?',
    options: [
      { text: 'Irrelevant — I connect just as well digitally', score: 1 },
      { text: 'Helpful but not essential', score: 2 },
      { text: 'Important — I communicate better in person', score: 4 },
      { text: 'Essential — my physicality is a key part of how I lead', score: 5 },
    ],
  },
  {
    id: 16,
    dimension: 'physical',
    question: 'When a situation becomes uncertain or ambiguous in a group setting, how often do colleagues instinctively look to you?',
    options: [
      { text: 'Rarely — people handle it themselves or go to someone more senior', score: 1 },
      { text: 'Occasionally — usually when I happen to be most senior', score: 2 },
      { text: 'Frequently — people naturally defer to me in tense in-person moments', score: 4 },
      { text: 'Almost always — my physical presence itself creates calm and direction', score: 5 },
    ],
  },
  {
    id: 22,
    dimension: 'physical',
    question: 'Your ability to read a room — sensing energy, tension, or enthusiasm — is:',
    options: [
      { text: 'Limited — I miss a lot of non-verbal signals', score: 1 },
      { text: 'Average — I notice obvious cues', score: 2 },
      { text: 'Strong — I pick up subtle signals others miss', score: 4 },
      { text: 'Exceptional — I sense shifts in group energy before they become visible', score: 5 },
    ],
  },
  {
    id: 23,
    dimension: 'physical',
    question: 'How central is your physical presence to the value you deliver professionally?',
    options: [
      { text: 'Minimal — my work is entirely deliverable digitally', score: 1 },
      { text: 'Somewhat — I perform slightly better in person', score: 2 },
      { text: 'Important — my in-person impact is meaningfully different from digital', score: 4 },
      { text: 'Central — my physical presence is the product; it cannot be replicated remotely', score: 5 },
    ],
  },

  // ── SOCIAL INFLUENCE — 5 questions (3 original + 2 new) ─────────────────
  {
    id: 11,
    dimension: 'social',
    question: 'When you present an unpopular idea, you typically:',
    options: [
      { text: 'Back down if there\'s resistance', score: 1 },
      { text: 'Present data to support my view', score: 2 },
      { text: 'Win people over through conversation', score: 5 },
      { text: 'Find allies before the room', score: 4 },
    ],
  },
  {
    id: 12,
    dimension: 'social',
    question: 'People who have worked with you for 5+ years would say:',
    options: [
      { text: 'I was reliable and delivered good work', score: 2 },
      { text: 'I helped them grow professionally', score: 4 },
      { text: 'I changed how they think about their work', score: 5 },
      { text: 'I was knowledgeable and helpful', score: 3 },
    ],
  },
  {
    id: 13,
    dimension: 'social',
    question: 'Your ability to shift group dynamics in a room is:',
    options: [
      { text: 'Something I rarely think about', score: 1 },
      { text: 'Something I observe but don\'t influence much', score: 2 },
      { text: 'A deliberate skill I use regularly', score: 4 },
      { text: 'Natural and effortless for me', score: 5 },
    ],
  },
  {
    id: 24,
    dimension: 'social',
    question: 'How do you approach building trust with a new stakeholder or client?',
    options: [
      { text: 'I deliver results — trust follows naturally from performance', score: 2 },
      { text: 'I invest time learning what they care about before showing my work', score: 3 },
      { text: 'I create small early wins and maintain proactive communication', score: 4 },
      { text: 'I understand their fears, ambitions, and personal style deeply before anything else', score: 5 },
    ],
  },
  {
    id: 25,
    dimension: 'social',
    question: 'When you need to influence someone without formal authority, you:',
    options: [
      { text: 'Present the strongest logical argument and hope for agreement', score: 2 },
      { text: 'Involve them early so they feel ownership of the outcome', score: 4 },
      { text: 'Understand their motivations and frame the idea in their terms', score: 5 },
      { text: 'Rely on my track record — I let results speak', score: 1 },
    ],
  },

  // ── CONTEXTUAL TRUST — 5 questions (2 original + 3 new) ─────────────────
  {
    id: 14,
    dimension: 'contextual',
    question: 'Clients or colleagues who worked with you 3+ years ago:',
    options: [
      { text: 'Probably moved on and don\'t think about me', score: 1 },
      { text: 'Remember me positively', score: 2 },
      { text: 'Still reach out for advice or referrals', score: 4 },
      { text: 'Would drop their current provider to work with me again', score: 5 },
    ],
  },
  {
    id: 15,
    dimension: 'contextual',
    question: 'The trust you\'ve built in your professional relationships is:',
    options: [
      { text: 'Transactional — based on what I deliver', score: 1 },
      { text: 'Based on consistent quality over time', score: 2 },
      { text: 'Built on shared history and deep understanding', score: 4 },
      { text: 'Irreplaceable — people trust me specifically, not my role', score: 5 },
    ],
  },
  {
    id: 26,
    dimension: 'contextual',
    question: 'How much institutional knowledge do you carry that would be very difficult to document or hand over?',
    options: [
      { text: 'Little — my work is well-documented and transferable', score: 1 },
      { text: 'Some — there are a few things only I know well', score: 2 },
      { text: 'Significant — I hold critical relationships and context that can\'t be easily captured', score: 4 },
      { text: 'Substantial — I am a node in networks and systems that depend on me specifically', score: 5 },
    ],
  },
  {
    id: 27,
    dimension: 'contextual',
    question: 'When navigating organisational politics or unwritten rules, you:',
    options: [
      { text: 'Often find them frustrating and try to ignore them', score: 1 },
      { text: 'Know they exist and try to stay out of the way', score: 2 },
      { text: 'Read them accurately and navigate them deliberately', score: 4 },
      { text: 'Shape them — I understand the culture deeply enough to shift dynamics', score: 5 },
    ],
  },
  {
    id: 30,
    dimension: 'contextual',
    reverse_scored: true,
    question: 'If you left your current role tomorrow, how quickly could your organisation replace your specific value?',
    options: [
      { text: 'Immediately — my skills are widely available and well-documented', score: 4 },
      { text: 'Within a few weeks with a competent hire', score: 3 },
      { text: 'It would take months and there would be meaningful disruption', score: 2 },
      { text: 'Parts of what I bring are genuinely irreplaceable for years', score: 1 },
    ],
  },
];
