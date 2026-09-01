export const STORY_CATEGORIES = [
  'Starting From Zero',
  'No Projects Yet',
  'Assessment Struggles',
  'Career Switchers',
  'Existing AI Trainers',
  'Finding Momentum',
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];

export type StoryIdentityKind =
  | 'newcomer'
  | 'anonymous'
  | 'finance'
  | 'research'
  | 'software'
  | 'writer'
  | 'experienced';

export type StoryIdentity = {
  label: string;
  initials: string;
  kind: StoryIdentityKind;
};

export type StorySections = {
  before: string[];
  turningPoint: string[];
  workedOn: string[];
  whatChanged: string[];
  thankYou: string;
  takeaway: string;
};

export type FounderNote = {
  quote: string;
  author: string;
  role: string;
};

export type Story = {
  slug: string;
  title: string;
  category: StoryCategory;
  quote: string;
  preview: string;
  identity: StoryIdentity;
  name: string;
  location: string;
  status: string;
  verified: boolean;
  featured?: boolean;
  photo?: string;
  results?: string;
  sections: StorySections;
  founderNote: FounderNote;
};

export const ILLUSTRATIVE_DISCLOSURE =
  'Illustrative stories based on common coaching experiences. Names and identifying details may be changed or created to protect privacy.';

export const storyFilters = ['All Stories', ...STORY_CATEGORIES] as const;

export type StoryFilter = (typeof storyFilters)[number];

const coachNote = (quote: string, role: string): FounderNote => ({
  quote,
  author: 'AI Trainers Coaching Team',
  role,
});

export const stories: Story[] = [
  {
    slug: 'account-created-no-idea-what-next',
    title: 'I Had the Account. I Had No Idea What to Do Next.',
    category: 'Starting From Zero',
    quote:
      'Creating the account felt like an achievement — until I realized I had no idea what came next.',
    preview:
      'The login was easy. Understanding what a strong AI trainer was supposed to do was not. Coaching turned the mystery into a process.',
    name: 'Emily Carter',
    location: 'Austin, TX',
    status: 'New to AI Training',
    identity: { label: 'New to AI Training', initials: 'EC', kind: 'newcomer' },
    verified: false,
    sections: {
      before: [
        'When I first discovered AI-training work, I was excited enough to create accounts immediately.',
        'That excitement disappeared pretty quickly.',
        'I logged in, looked around, read different instructions, saw unfamiliar terminology, and realized something uncomfortable:',
        'I had absolutely no idea what a strong AI trainer was supposed to do.',
        'I kept thinking everyone else already understood something I didn’t.',
        'For a while, I avoided doing much at all because I was worried that one bad attempt would ruin my chances.',
      ],
      turningPoint: [
        'What changed for me was having someone actually break the work down.',
        'Instead of telling me to “just practice,” my coach helped me understand how to read tasks, identify what was really being evaluated, slow down when necessary, and review my own work before submitting anything.',
      ],
      workedOn: [
        'Reading tasks and identifying what was actually being evaluated',
        'Slowing down instead of rushing the first attempt',
        'Reviewing work before submitting anything',
      ],
      whatChanged: [
        'The biggest change wasn’t some secret trick.',
        'It was finally having a process.',
        'Once the work stopped feeling mysterious, my confidence changed completely.',
        'I went from being afraid to touch anything to actually understanding why one answer was stronger than another.',
      ],
      thankYou:
        'I’m grateful to the AI Trainers coaching team for making something that initially felt overwhelming feel learnable.',
      takeaway:
        'You don’t need to know everything before you begin. Sometimes you need someone to show you what good work actually looks like.',
    },
    founderNote: coachNote(
      'The hardest part for many newcomers isn’t ability — it’s knowing what to focus on first. Once there is a clear process, the work often becomes much less intimidating.',
      'Newcomer Guidance',
    ),
  },
  {
    slug: 'empty-dashboard-thought-i-failed',
    title: 'My Dashboard Was Empty — and I Thought I Had Failed.',
    category: 'No Projects Yet',
    quote:
      'No projects felt like rejection. I eventually learned that waiting and failing are not the same thing.',
    preview:
      'Refreshing an empty dashboard started to feel personal. Coaching helped turn waiting time into preparation instead of a reason to stop.',
    name: 'Marcus Reed',
    location: 'Atlanta, GA',
    status: 'Waiting for Projects',
    identity: { label: 'Waiting for Projects', initials: 'MR', kind: 'anonymous' },
    verified: false,
    sections: {
      before: [
        'I created my account expecting things to start happening immediately.',
        'They didn’t.',
        'I would log in, refresh the dashboard, check again later, and see basically nothing.',
        'After a while, I started taking it personally.',
        'Maybe my profile wasn’t good enough.',
        'Maybe I had missed my opportunity.',
        'Maybe everyone except me was getting work.',
        'The worst part was that I didn’t know what I should be doing while I waited.',
      ],
      turningPoint: [
        'That was where coaching helped me most.',
        'The AI Trainers team helped me stop treating an empty dashboard as a reason to give up.',
        'My coach helped me realize that waiting becomes much more productive when you’re actually preparing.',
      ],
      workedOn: [
        'Understanding task instructions',
        'Improving research habits',
        'Practicing careful evaluation',
        'Working on accuracy',
        'Preparing for future qualifications',
      ],
      whatChanged: [
        'That completely changed my mindset.',
        'Instead of checking the platform twenty times a day, I started using that time to become better prepared for the next opportunity.',
      ],
      thankYou:
        'The coaching team gave me the structure I had been missing while I waited.',
      takeaway: 'An empty dashboard does not mean there is nothing you can work on.',
    },
    founderNote: coachNote(
      'Waiting is much easier when you are actually preparing. An empty dashboard is not the same thing as having nothing useful to do.',
      'Platform & Progress Guidance',
    ),
  },
  {
    slug: 'thought-i-needed-ai-background',
    title: 'I Thought I Needed an AI Background. I Was Wrong.',
    category: 'Career Switchers',
    quote:
      'I kept focusing on everything I didn’t know about AI instead of everything I already knew about my profession.',
    preview:
      'A finance background felt unrelated to AI training at first. The turning point was learning where existing expertise could actually be useful.',
    name: 'Rachel Kim',
    location: 'Seattle, WA',
    status: 'Career Switcher',
    identity: { label: 'Career Switcher', initials: 'RK', kind: 'finance' },
    verified: false,
    sections: {
      before: [
        'Before speaking with AI Trainers, I assumed these opportunities were mainly for machine-learning engineers.',
        'I’m not one.',
        'My experience came from a completely different professional field, so I almost decided not to pursue AI training at all.',
      ],
      turningPoint: [
        'During my first conversations with the coaching team, something clicked.',
        'AI systems don’t only need people who understand AI.',
        'They also need people who understand the world AI is being asked to reason about.',
        'My professional experience wasn’t something I needed to erase.',
        'It was something I could build from.',
        'My coach at AI Trainers helped me look at my existing knowledge differently.',
        'Instead of asking “How can I become an AI expert overnight?” we started asking “Where can the expertise I already have make me useful?”',
      ],
      workedOn: [
        'Mapping existing professional knowledge to AI-training work',
        'Reframing the starting question from “become an AI expert” to “where am I already useful?”',
        'Finding a clearer first path instead of starting from zero',
      ],
      whatChanged: [
        'That question gave me a much clearer starting point.',
        'I stopped treating my previous career as irrelevant and started seeing it as an advantage.',
      ],
      thankYou:
        'What I appreciated most was finally having someone help me understand how my previous career could be an advantage.',
      takeaway: 'Your path into AI training may begin with what you already know.',
    },
    founderNote: coachNote(
      'AI systems need people who understand the world they are being asked to reason about. Your profession is often the starting point, not the obstacle.',
      'Career Transition Guidance',
    ),
  },
  {
    slug: 'moving-too-fast-ai-training',
    title: 'I Was Moving Too Fast and Calling It Productivity.',
    category: 'Assessment Struggles',
    quote:
      'I thought completing more tasks made me better. My biggest improvement came when I learned to slow down.',
    preview:
      'Speed looked like progress until small requirements started getting missed. The coaches treated quality as a skill that could be practiced.',
    name: 'Daniel Brooks',
    location: 'Chicago, IL',
    status: 'Improving Quality',
    identity: { label: 'Improving Quality', initials: 'DB', kind: 'research' },
    verified: false,
    sections: {
      before: [
        'I used to think speed was one of my biggest strengths.',
        'Give me instructions, and I wanted to finish quickly.',
        'That mindset caused problems in AI-training work.',
        'I would overlook small requirements, assume I understood what a task wanted, and sometimes submit before checking whether my reasoning actually matched the rubric.',
      ],
      turningPoint: [
        'When I started coaching, one of the first things we worked on was slowing the process down.',
        'At first, it felt inefficient.',
        'Then I started noticing mistakes I previously never would have caught.',
        'The coaches taught me to separate understanding the instructions, doing the actual task, and reviewing the result.',
      ],
      workedOn: [
        'Separating instruction-reading from the actual task',
        'Building in a review step before submitting',
        'Checking reasoning against the rubric instead of assuming understanding',
      ],
      whatChanged: [
        'Those sound like simple steps.',
        'For me, they changed everything.',
        'I stopped measuring progress by how quickly I could click Submit.',
        'I started measuring it by whether I could explain why my answer met the requirements.',
      ],
      thankYou:
        'The coaches helped me stop guessing and start working with a clearer plan for quality.',
      takeaway: 'Faster isn’t always better. Strong trainers learn when to slow down.',
    },
    founderNote: coachNote(
      'Speed can hide mistakes. Strong trainers learn to separate reading, doing, and reviewing — even when that feels slower at first.',
      'Performance & Workflow Coaching',
    ),
  },
  {
    slug: 'failed-qualification-almost-quit',
    title: 'I Failed a Qualification and Almost Quit.',
    category: 'Assessment Struggles',
    quote:
      'The hardest part wasn’t failing. It was convincing myself that one result defined my ability.',
    preview:
      'One difficult qualification started to feel like a verdict. Coaching turned it back into information about what to practice next.',
    name: 'Olivia Bennett',
    location: 'Denver, CO',
    status: 'Assessment Struggles',
    identity: { label: 'Assessment Struggles', initials: 'OB', kind: 'anonymous' },
    verified: false,
    sections: {
      before: [
        'My first difficult qualification did not go the way I hoped.',
        'I had prepared.',
        'I thought I understood it.',
        'Then I didn’t get the outcome I wanted.',
        'Immediately, my brain turned one result into a conclusion:',
        'Maybe I’m simply not good at this.',
        'I told my coach I was considering stopping.',
      ],
      turningPoint: [
        'Instead of giving me empty motivation, they helped me examine what had actually happened.',
        'That distinction mattered.',
        'The qualification stopped being a judgment about me and became information about what I needed to improve.',
      ],
      workedOn: [
        'Where instructions had been misunderstood',
        'Where assumptions had replaced checking',
        'Which parts of the reasoning were already solid',
        'What could be practiced differently next time',
      ],
      whatChanged: [
        'That was one of the most valuable lessons I’ve learned from coaching.',
        'A difficult result became something I could study instead of something I had to carry as a verdict.',
      ],
      thankYou:
        'I’m grateful to my coach for helping me look at setbacks analytically instead of emotionally.',
      takeaway: 'A difficult result can be feedback, not a verdict.',
    },
    founderNote: coachNote(
      'One difficult result is information, not a verdict. We look at what happened, then decide what to practice next.',
      'Assessment Preparation',
    ),
  },
  {
    slug: 'multiple-platforms-no-system',
    title: 'I Was on Multiple Platforms but Still Had No System.',
    category: 'Finding Momentum',
    quote:
      'I kept creating more accounts because I thought another platform would solve the problem.',
    preview:
      'More logins looked like progress from the outside. Coaching replaced scattered activity with a simple system for what to prioritize.',
    name: 'Ethan Parker',
    location: 'Raleigh, NC',
    status: 'Finding Focus',
    identity: { label: 'Finding Focus', initials: 'EP', kind: 'software' },
    verified: false,
    sections: {
      before: [
        'At one point, I had accounts on several platforms.',
        'From the outside, it looked like progress.',
        'In reality, I was scattered.',
        'I checked one platform, switched to another, started one qualification, abandoned another, read Reddit discussions, watched videos, changed strategies, and repeated the process.',
        'I was active constantly but progressing very little.',
      ],
      turningPoint: [
        'Coaching helped me see the difference between activity and direction.',
        'The AI Trainers coaches helped me create a simple system.',
        'That structure gave me something I didn’t realize I was missing: focus.',
      ],
      workedOn: [
        'What to prioritize',
        'What to practice',
        'What to track',
        'What to ignore',
        'When to move on',
      ],
      whatChanged: [
        'I stopped chasing every possible opportunity and started becoming better prepared for the right ones.',
      ],
      thankYou:
        'Thank you to the AI Trainers coaching team for helping me turn uncertainty into a process I could follow.',
      takeaway: 'More platforms do not automatically mean more progress. A better system matters.',
    },
    founderNote: coachNote(
      'Activity and direction are not the same thing. A simple system usually beats another new account.',
      'Platform Strategy',
    ),
  },
  {
    slug: 'writing-background-ai-training',
    title: 'I Didn’t Think My Writing Experience Was Technical Enough.',
    category: 'Career Switchers',
    quote:
      'I assumed AI training was all coding. Then I realized how much careful reading, reasoning, and writing mattered.',
    preview:
      'A writing background felt too far from technical work. The coaches helped connect years of editorial skill to a different kind of evaluation.',
    name: 'Maya Thompson',
    location: 'Boston, MA',
    status: 'Writing Professional',
    identity: { label: 'Writing Professional', initials: 'MT', kind: 'writer' },
    verified: false,
    sections: {
      before: [
        'My background was in writing.',
        'When I first looked into AI-training work, I kept seeing technical terminology and assumed I probably wasn’t the kind of person these opportunities were for.',
      ],
      turningPoint: [
        'What surprised me was how often the work depended on skills I had already spent years developing.',
        'The AI Trainers coaches helped me connect those existing skills to a completely new type of work.',
      ],
      workedOn: [
        'Reading carefully',
        'Recognizing ambiguity',
        'Comparing two pieces of writing',
        'Checking whether an answer actually addressed the question',
        'Explaining why something was better or worse',
        'Researching unfamiliar subjects',
        'Following detailed editorial rules',
      ],
      whatChanged: [
        'I still had plenty to learn, but I no longer felt like I was starting with nothing.',
      ],
      thankYou:
        'I’m grateful to my coach for helping me understand that professional skills don’t stop being valuable just because the industry changes.',
      takeaway:
        'AI training can reward abilities you’ve been developing long before you discovered AI training.',
    },
    founderNote: coachNote(
      'Careful reading, comparison, and explanation are technical skills. Many writers already have more of them than they think.',
      'Domain Expertise Guidance',
    ),
  },
  {
    slug: 'existing-ai-trainer-still-guessing',
    title: 'I Was Already an AI Trainer — but I Was Still Guessing.',
    category: 'Existing AI Trainers',
    quote:
      'I had experience, but experience without a repeatable process still felt inconsistent.',
    preview:
      'Coaching did not feel like a beginner move. It became a way to turn uneven experience into a workflow that could actually be refined.',
    name: 'Jordan Lewis',
    location: 'Phoenix, AZ',
    status: 'Experienced AI Trainer',
    identity: { label: 'Experienced AI Trainer', initials: 'JL', kind: 'experienced' },
    verified: false,
    sections: {
      before: [
        'I wasn’t completely new when I came to AI Trainers.',
        'I had already completed AI-training work.',
        'That was actually why asking for help felt strange.',
        'I thought coaching was supposed to be for beginners.',
        'My problem wasn’t understanding what AI training was.',
        'My problem was consistency.',
        'Some tasks went extremely well.',
        'Others took far too long.',
        'Sometimes I understood feedback immediately.',
        'Other times, I didn’t know what I should change.',
      ],
      turningPoint: [
        'The coaches helped me look at my work more systematically.',
        'That helped me replace intuition with a workflow I could actually refine.',
      ],
      workedOn: [
        'Where too much time was being spent',
        'Where checks were being skipped',
        'Which task types consistently caused trouble',
        'Which mistakes kept repeating',
      ],
      whatChanged: [
        'Asking for structure no longer felt like going backwards.',
        'It felt like improving on purpose.',
      ],
      thankYou:
        'Thank you to the AI Trainers coaching team for showing me that asking for structure doesn’t mean you’re a beginner. Sometimes it means you’re ready to improve deliberately.',
      takeaway: 'Experience gets stronger when you can turn it into a repeatable system.',
    },
    founderNote: coachNote(
      'Asking for structure doesn’t mean you’re a beginner. It often means you’re ready to improve on purpose.',
      'Performance & Workflow Coaching',
    ),
  },
  {
    slug: 'nervous-to-book-ai-training-call',
    title: 'I Was Too Nervous to Book the Call.',
    category: 'Starting From Zero',
    quote:
      'I thought I needed experience before talking to a coach. The call was where I learned I didn’t.',
    preview:
      'The tab closed more than once. An account, no projects, and nothing impressive to say felt like a reason to wait. The conversation started there anyway.',
    name: 'Natalie Foster',
    location: 'Tampa, FL',
    status: 'Starting From Zero',
    identity: { label: 'Starting From Zero', initials: 'NF', kind: 'newcomer' },
    verified: false,
    featured: true,
    sections: {
      before: [
        'I visited the AI Trainers website more than once before I booked anything.',
        'I would read the page, look at the platforms, think about it, and close the tab.',
        'My hesitation was simple: What am I going to say?',
        'I had an account.',
        'That was basically it.',
        'No projects.',
        'No AI-training background.',
        'No impressive success story.',
        'I assumed the coaches would expect me to already know something.',
      ],
      turningPoint: [
        'Eventually, I booked the call anyway.',
        'It turned out that my lack of experience was not an awkward problem we had to work around.',
        'It was the starting point of the conversation.',
      ],
      workedOn: [
        'Talking through professional background without pretending it was already an AI-training resume',
        'Looking at which opportunities were realistic to explore',
        'Clarifying what needed to be learned first',
        'Sketching what the next steps could look like',
      ],
      whatChanged: [
        'I left with something I hadn’t had before: clarity.',
        'The first conversation felt like guidance instead of an interview I had to pass.',
      ],
      thankYou:
        'Thank you to the AI Trainers coaching team for making that first conversation feel like guidance instead of an interview I had to pass.',
      takeaway: 'You don’t need experience before asking for direction.',
    },
    founderNote: coachNote(
      'Many newcomers assume they need experience before asking for help. In practice, knowing where to focus first is often exactly what coaching can provide.',
      'Newcomer Guidance',
    ),
  },
  {
    slug: 'biggest-change-was-confidence',
    title: 'The Biggest Change Wasn’t the Platform. It Was My Confidence.',
    category: 'Finding Momentum',
    quote:
      'I stopped opening the platform hoping something would magically make sense. I finally knew how to approach the work.',
    preview:
      'Every new task carried the same worry: What if something obvious is missing? Coaching made those questions internal — and the work less dependent.',
    name: 'Chris Morgan',
    location: 'Columbus, OH',
    status: 'Building Momentum',
    identity: { label: 'Building Momentum', initials: 'CM', kind: 'newcomer' },
    verified: false,
    sections: {
      before: [
        'At the beginning, every new task made me nervous.',
        'Even when I understood most of the instructions, there was always that thought: What if I’m missing something obvious?',
        'That uncertainty made everything take longer.',
        'I second-guessed decisions.',
        'I reread simple instructions repeatedly.',
        'I worried about submitting.',
      ],
      turningPoint: [
        'Over time, coaching changed that.',
        'Not because somebody started giving me answers.',
        'The opposite happened.',
        'The coaches kept making me explain my own reasoning.',
      ],
      workedOn: [
        'Why this choice was made',
        'What requirement supported that decision',
        'What would make the alternative stronger',
        'What should be verified before submitting',
      ],
      whatChanged: [
        'Eventually, those questions became questions I started asking myself.',
        'That was the moment I realized I was becoming more independent.',
      ],
      thankYou:
        'What I appreciated most was finally having someone help me learn how to think through the work myself.',
      takeaway:
        'The goal of good coaching isn’t dependency. It’s helping you develop the judgment to move forward with confidence.',
    },
    founderNote: coachNote(
      'The goal of coaching isn’t to keep giving you answers. It’s to help you ask better questions of your own work.',
      'Trainer Development',
    ),
  },
];

export const featuredStorySlug = 'nervous-to-book-ai-training-call';

export const blogPreviewSlugs = [
  'nervous-to-book-ai-training-call',
  'account-created-no-idea-what-next',
  'empty-dashboard-thought-i-failed',
] as const;

export function getStory(slug: string): Story | undefined {
  return stories.find((story) => story.slug === slug);
}

export function storyStructuredData(story: Story) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.preview,
    author: {
      '@type': 'Organization',
      name: 'AI Trainers Coaching Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Trainers',
    },
  };
}

export function getFeaturedStory(): Story {
  return getStory(featuredStorySlug) ?? stories[0]!;
}

export function getBlogPreviewStories(): Story[] {
  return blogPreviewSlugs
    .map((slug) => getStory(slug))
    .filter((story): story is Story => Boolean(story));
}

export function filterStories(filter: StoryFilter): Story[] {
  if (filter === 'All Stories') {
    return stories;
  }
  return stories.filter((story) => story.category === filter);
}

export function hasUnverifiedStories(list: Story[] = stories): boolean {
  return list.some((story) => !story.verified);
}
