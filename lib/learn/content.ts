export type LessonBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'callout'; title?: string; text: string; tone?: 'note' | 'tip' | 'warn' }
  | { type: 'list'; items: string[] }
  | { type: 'example'; title?: string; prompt?: string; response?: string; note?: string }
  | { type: 'compare'; prompt?: string; a: string; b: string; correct: 'A' | 'B'; why: string }
  | { type: 'checklist'; title?: string; items: string[] }
  | { type: 'quiz'; id: string; question: string; options: Array<{ id: string; label: string }>; correct: string; explanation: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'cta'; href: string; label: string };

export type ModuleLesson = {
  n: number;
  intro: string;
  blocks: LessonBlock[];
};

export const MODULE_LESSONS: ModuleLesson[] = [
  {
    n: 1,
    intro:
      'AI systems improve through a combination of technology, data, testing, and human feedback. Human judgment still matters when evaluating whether an answer is accurate, useful, and consistent with the user’s instructions.',
    blocks: [
      {
        type: 'h',
        text: 'What AI-training work can look like',
      },
      {
        type: 'list',
        items: [
          'Comparing two AI responses',
          'Judging instruction following',
          'Checking factual accuracy',
          'Identifying unsupported claims',
          'Rating writing quality',
          'Rewriting responses',
          'Categorizing or labeling data',
          'Evaluating coding, math, writing, science, or other domain-specific answers',
        ],
      },
      {
        type: 'h',
        text: 'AI Trainer / Evaluator vs AI Engineer',
      },
      {
        type: 'p',
        text: 'An AI trainer or evaluator often focuses on judgment, writing, research, comparison, and instruction following. An AI engineer usually develops AI systems and may work with Python, machine learning, APIs, models, infrastructure, and deployment. Many training projects do not require programming.',
      },
      {
        type: 'example',
        title: 'A small instruction miss',
        prompt: 'Give me three inexpensive vegetarian dinner ideas.',
        response: '1. Chicken tacos\n2. Vegetable pasta\n3. Lentil soup',
        note: 'The response looks reasonable at first glance, but chicken tacos violate the vegetarian requirement.',
      },
      {
        type: 'callout',
        tone: 'note',
        title: 'A realistic expectation',
        text: 'Getting accepted onto an AI-training platform does not necessarily guarantee immediate or continuous project availability.',
      },
      {
        type: 'quiz',
        id: 'm1q1',
        question: 'Which task is most likely AI-training work?',
        options: [
          { id: 'A', label: 'Installing Windows' },
          { id: 'B', label: 'Comparing two AI responses for accuracy' },
          { id: 'C', label: 'Repairing a router' },
          { id: 'D', label: 'Designing a CPU' },
        ],
        correct: 'B',
        explanation: 'Comparing AI responses is a common evaluation task. The other options are IT or hardware work.',
      },
      {
        type: 'quiz',
        id: 'm1q2',
        question: 'Do all AI trainers need programming experience?',
        options: [
          { id: 'A', label: 'Yes' },
          { id: 'B', label: 'No' },
        ],
        correct: 'B',
        explanation: 'Many projects need writing, research, and domain judgment more than code.',
      },
      {
        type: 'quiz',
        id: 'm1q3',
        question: 'Does completing onboarding guarantee projects?',
        options: [
          { id: 'A', label: 'Yes' },
          { id: 'B', label: 'No' },
        ],
        correct: 'B',
        explanation: 'Onboarding is a starting point. Project availability still varies.',
      },
    ],
  },
  {
    n: 2,
    intro: 'Strong evaluations look at more than whether an answer “sounds good.” Use these six dimensions as a habit.',
    blocks: [
      {
        type: 'list',
        items: [
          'Instruction following — Did the response do what the user asked?',
          'Accuracy — Are the factual claims correct?',
          'Relevance — Does the answer stay focused?',
          'Clarity — Is the response understandable?',
          'Completeness — Did it address all requested parts?',
          'Support for claims — Are factual claims appropriately supported or qualified?',
        ],
      },
      {
        type: 'compare',
        prompt: 'Give me two advantages of working remotely. Keep the answer under 30 words.',
        a: 'Remote work can reduce commuting time and provide greater flexibility in where employees perform their work.',
        b: 'Remote work has many benefits. First, it eliminates commuting. Second, employees may have more scheduling flexibility. Third, it can reduce office expenses. Fourth, workers can live anywhere.',
        correct: 'A',
        why: 'A follows both the requested count and length. B provides more than two advantages.',
      },
      {
        type: 'h',
        text: 'Practical 1',
      },
      {
        type: 'compare',
        prompt: 'Recommend three inexpensive activities for a rainy day at home. Keep the entire response under 50 words.',
        a: 'Read a book, try a simple home workout, or cook something using ingredients you already have.',
        b: 'There are many things you can do on a rainy day. You could read a book, watch movies, cook, exercise, drive somewhere, visit friends, play video games, or start a new hobby.',
        correct: 'A',
        why: 'A gives exactly three appropriate at-home activities and stays concise. B lists extra options and includes leaving the house.',
      },
      {
        type: 'quiz',
        id: 'm2q1',
        question: 'Can a correct answer still be poor if it ignores an explicit formatting requirement?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correct: 'yes',
        explanation: 'Formatting and count constraints are part of the task, not extras.',
      },
      {
        type: 'quiz',
        id: 'm2q2',
        question: 'What matters more when you evaluate an AI response?',
        options: [
          { id: 'A', label: 'Confidence' },
          { id: 'B', label: 'Correctness and instruction following' },
        ],
        correct: 'B',
        explanation: 'Confident writing is not a substitute for doing what was asked and getting the facts right.',
      },
    ],
  },
  {
    n: 3,
    intro: 'When a prompt is detailed, convert it into a checklist before you judge the answer.',
    blocks: [
      {
        type: 'example',
        title: 'Turn the prompt into checks',
        prompt: 'Give exactly three benefits of exercise. Each benefit must be no more than six words. Do not mention weight loss.',
      },
      {
        type: 'checklist',
        title: 'Checklist',
        items: ['Exactly three benefits', 'Max six words each', 'No weight-loss reference'],
      },
      {
        type: 'compare',
        a: '- Improves cardiovascular health\n- Supports better sleep quality\n- Can help people lose weight',
        b: '- Improves cardiovascular health\n- Supports better sleep\n- May improve mood',
        correct: 'B',
        why: 'B meets the count, word limit, and banned-topic rules. A mentions weight loss.',
      },
      {
        type: 'example',
        title: 'Another checklist',
        prompt: 'Write a friendly email declining a meeting. Keep it under 60 words and suggest Tuesday afternoon instead.',
      },
      {
        type: 'checklist',
        items: ['Friendly tone', 'Declines the meeting', 'Under 60 words', 'Suggests Tuesday afternoon'],
      },
      {
        type: 'h',
        text: 'Practice',
      },
      {
        type: 'example',
        prompt: 'Recommend two free activities in New York City. Use bullet points. Do not recommend museums.',
        response: '- Walk through Central Park\n- Visit the Metropolitan Museum of Art',
        note: 'The second option violates the explicit “no museums” requirement.',
      },
      {
        type: 'quiz',
        id: 'm3q1',
        question: 'When a prompt has multiple constraints, what is the safest evaluation technique?',
        options: [
          { id: 'A', label: 'Judge the overall vibe' },
          { id: 'B', label: 'Convert the prompt into a checklist' },
          { id: 'C', label: 'Focus only on factuality' },
          { id: 'D', label: 'Ignore formatting' },
        ],
        correct: 'B',
        explanation: 'A checklist reduces missed constraints.',
      },
      {
        type: 'quiz',
        id: 'm3q2',
        question: 'If a response is helpful but breaks one explicit constraint, how should you treat it?',
        options: [
          { id: 'A', label: 'Ignore the constraint if the rest is strong' },
          { id: 'B', label: 'Treat the broken constraint as a real evaluation issue' },
        ],
        correct: 'B',
        explanation: 'Explicit constraints are part of the user’s request. Missing one is an instruction-following miss.',
      },
    ],
  },
  {
    n: 4,
    intro:
      'AI can produce statements that sound confident but are false or unsupported. Those are often called hallucinations.',
    blocks: [
      {
        type: 'list',
        items: [
          'Made-up facts',
          'Incorrect statistics',
          'Nonexistent studies',
          'Wrong dates',
          'Fabricated quotations',
          'False descriptions of people or organizations',
        ],
      },
      {
        type: 'h',
        text: 'Factual claim vs opinion',
      },
      {
        type: 'example',
        title: 'Factual claim',
        response: 'The movie was released in 1999.',
        note: 'This can be checked.',
      },
      {
        type: 'example',
        title: 'Opinion',
        response: 'The movie is boring.',
        note: 'This is a preference, not a verifiable fact.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Pay extra attention to',
        text: 'Dates, statistics, names, scientific claims, medical information, legal information, financial information, quotations, and current information.',
      },
      {
        type: 'example',
        title: 'Overly broad claim',
        response:
          'Alexander Graham Bell invented the telephone in 1876 and was the only person developing telephone technology at the time.',
        note: 'The second claim is overly broad and misleading, even if the first date is commonly cited.',
      },
      {
        type: 'h',
        text: 'Practical 2',
      },
      {
        type: 'example',
        prompt: 'Explain why sleep is important in two sentences.',
        response:
          'Sleep is important because it allows your body and brain to recover. Most adults must sleep exactly nine hours every night or they will develop serious health problems.',
        note: 'The second sentence makes an overly absolute and unsupported claim.',
      },
      {
        type: 'quiz',
        id: 'm4q1',
        question: 'Which statement needs verification most?',
        options: [
          { id: 'A', label: 'Blue is a calming color.' },
          { id: 'B', label: 'The unemployment rate was exactly 4.1% in June.' },
          { id: 'C', label: 'I prefer working from home.' },
        ],
        correct: 'B',
        explanation: 'A precise current statistic is a factual claim that should be checked.',
      },
    ],
  },
  {
    n: 5,
    intro: 'Evaluation comments should help a reviewer understand why one response is better—not just which one you picked.',
    blocks: [
      {
        type: 'callout',
        tone: 'warn',
        title: 'Weak',
        text: '“A is better.”  ·  “A sounds better.”',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Strong',
        text: '“Response A is better because it directly answers the user’s question and follows the requested two-item format, while Response B adds an unrelated third recommendation.”',
      },
      {
        type: 'h',
        text: 'Decision → Evidence → Impact',
      },
      {
        type: 'example',
        response:
          'Response A is better because it gives exactly three suggestions as requested, while Response B provides five. Therefore, Response A follows the user’s instructions more closely.',
      },
      {
        type: 'list',
        items: ['Specific', 'Evidence-based', 'Concise', 'Neutral'],
      },
      {
        type: 'compare',
        prompt: 'Explain photosynthesis in one sentence for a 10-year-old.',
        a: 'Photosynthesis is the biochemical process through which photoautotrophic organisms synthesize glucose using electromagnetic radiation.',
        b: 'Photosynthesis is how plants use sunlight to make the food they need to grow.',
        correct: 'B',
        why: 'B uses simple language appropriate for the requested audience.',
      },
      {
        type: 'h',
        text: 'Practical 3',
      },
      {
        type: 'compare',
        prompt: 'Write a professional, friendly one-sentence message declining a meeting tomorrow.',
        a: 'Can’t make it.',
        b: 'Thank you for the invitation, but unfortunately I won’t be available for tomorrow’s meeting.',
        correct: 'B',
        why: 'B is professional, friendly, and one complete sentence. A is too abrupt.',
      },
      {
        type: 'quiz',
        id: 'm5q1',
        question: 'Which comment is stronger?',
        options: [
          { id: 'A', label: 'B is bad.' },
          { id: 'B', label: 'B misses the requested audience because the vocabulary is too technical.' },
        ],
        correct: 'B',
        explanation: 'The stronger comment names the specific problem.',
      },
    ],
  },
  {
    n: 6,
    intro: 'Use the course as a starting map—not a promise of work. Availability changes, and accurate profiles matter more than impressive-sounding ones.',
    blocks: [
      {
        type: 'h',
        text: 'Step 1: Identify your strengths',
      },
      {
        type: 'p',
        text: 'General: writing, reading comprehension, research, critical thinking. Technical: programming, mathematics, engineering, data analysis. Professional/domain: finance, law, healthcare, science, education. Language: some projects require specific languages.',
      },
      {
        type: 'h',
        text: 'Step 2: Create accurate profiles',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Too vague',
        text: '“I know Python.”',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'More useful',
        text: '“2 years using Python for backend development, API integrations, and data-processing scripts.”',
      },
      {
        type: 'list',
        items: ['Be accurate', 'Be specific', 'Keep resume and profile consistent', 'Never fabricate expertise'],
      },
      {
        type: 'h',
        text: 'Step 3: Read assessments carefully',
      },
      {
        type: 'checklist',
        items: [
          'Understand the instructions',
          'Know the time limits',
          'Use stable internet',
          'Remove distractions',
          'Review examples before you start',
        ],
      },
      {
        type: 'h',
        text: 'Step 4: Track applications',
      },
      {
        type: 'table',
        headers: ['Platform', 'Applied', 'Assessment', 'Status'],
        rows: [
          ['Example A', 'Mar 3', 'Invited', 'In review'],
          ['Example B', 'Mar 8', 'Completed', 'Waiting'],
        ],
      },
      {
        type: 'h',
        text: 'Step 5: Do not depend on one platform',
      },
      {
        type: 'p',
        text: 'Legitimate project availability changes over time. A quiet week is not unusual and is not, by itself, a signal that you did something wrong.',
      },
      {
        type: 'h',
        text: 'Step 6: Watch for scams',
      },
      {
        type: 'list',
        items: [
          'Guaranteed employment or guaranteed income',
          'Someone asking to take assessments for you',
          'Selling verified accounts',
          'Requests for passwords',
          'Requests to misrepresent identity',
          'Fake information',
          'Bypassing identity verification',
          'Unusual upfront payment',
          'Guaranteed platform acceptance',
        ],
      },
      {
        type: 'quiz',
        id: 'm6q1',
        question: 'Which profile description is stronger?',
        options: [
          { id: 'A', label: 'I know Python.' },
          { id: 'B', label: 'I have two years of experience using Python for backend APIs and automation scripts.' },
        ],
        correct: 'B',
        explanation: 'Specific, accurate experience is more informative than a vague claim.',
      },
      {
        type: 'cta',
        href: '/learn/ai-training-foundations/assessment',
        label: 'Take Final Assessment',
      },
    ],
  },
];
