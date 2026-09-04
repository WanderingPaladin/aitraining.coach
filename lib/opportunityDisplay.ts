type MatchReason = { kind: 'match' | 'gap' | 'hard'; text: string };

type OpportunityMatch = {
  score: number;
  label: string;
  reasons: MatchReason[];
};

type PublicJobLike = {
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  summary?: string | null;
  descriptionText?: string | null;
  beginnerFriendly?: boolean;
  experienceLevel?: string | null;
};

export const MARKETPLACE_PLATFORMS = [
  { value: 'Snorkel', label: 'Snorkel' },
  { value: 'Handshake', label: 'Handshake' },
  { value: 'Outlier', label: 'Outlier' },
  { value: 'micro1', label: 'Micro1' },
  { value: 'DataAnnotation', label: 'DataAnnotation' },
  { value: 'Mercor', label: 'Mercor' },
] as const;

export const POPULAR_CATEGORIES = [
  { value: 'Coding', label: 'Coding' },
  { value: 'Writing', label: 'Writing' },
  { value: 'Science', label: 'Science' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Legal', label: 'Legal' },
  { value: 'AI Evaluation', label: 'AI Evaluation' },
  { value: 'Data Annotation', label: 'Data Annotation' },
] as const;

export const QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner Friendly' },
  { id: 'Coding', label: 'Coding' },
  { id: 'Writing', label: 'Writing' },
  { id: 'Science', label: 'Science' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Legal', label: 'Legal' },
  { id: 'AI Evaluation', label: 'AI Evaluation' },
  { id: 'remote', label: 'Remote' },
] as const;

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function formatCompensation(job: {
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
}): string | null {
  if (job.salaryMin == null && job.salaryMax == null) {
    return null;
  }
  const currency = (job.salaryCurrency || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[currency] ?? null;
  const period = normalizePayPeriod(job.salaryPeriod);
  const min = job.salaryMin;
  const max = job.salaryMax;

  const formatAmount = (amount: number) => {
    if (Math.abs(amount) >= 1000) {
      const thousands = amount / 1000;
      if (Number.isInteger(thousands) || Math.abs(thousands - Math.round(thousands)) < 0.05) {
        return `${Math.round(thousands)}k`;
      }
      if (amount >= 10_000) {
        return `${Math.round(thousands)}k`;
      }
    }
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
  };

  const withCurrency = (amount: number) =>
    symbol ? `${symbol}${formatAmount(amount)}` : `${currency} ${formatAmount(amount)}`;

  let core: string;
  if (min != null && max != null && min !== max) {
    core = `${withCurrency(min)}–${withCurrency(max)}`;
  } else {
    core = withCurrency(min ?? max ?? 0);
  }

  if (period === 'hourly') return `${core}/hr`;
  if (period === 'annual') return `${core}/yr`;
  return core;
}

function normalizePayPeriod(period?: string | null): 'hourly' | 'annual' | null {
  if (!period) return null;
  if (/\b(hour|hourly|hr)\b/i.test(period)) return 'hourly';
  if (/\b(year|yearly|annual|annually|yr)\b/i.test(period)) return 'annual';
  return null;
}

export function formatEmploymentType(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/[_]+/g, '-').replace(/\s+/g, '-');
  const labels: Record<string, string> = {
    'full-time': 'Full-time',
    fulltime: 'Full-time',
    'part-time': 'Part-time',
    parttime: 'Part-time',
    contract: 'Contract',
    contractor: 'Contract',
    temporary: 'Temporary',
    internship: 'Internship',
    intern: 'Internship',
    flexible: 'Flexible',
  };
  return labels[normalized] ?? value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatWorkplace(remoteType?: string | null): 'Remote' | 'Hybrid' | 'On-site' | null {
  if (!remoteType) return null;
  const value = remoteType.toLowerCase().replace(/\s+/g, '');
  if (value === 'remote') return 'Remote';
  if (value === 'hybrid') return 'Hybrid';
  if (value === 'onsite' || value === 'on-site') return 'On-site';
  return null;
}

export function formatJobLocation(job: {
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  remoteType?: string | null;
}): { place: string | null; workplace: ReturnType<typeof formatWorkplace>; label: string | null } {
  const workplace = formatWorkplace(job.remoteType);
  const structured = [job.city, job.state, job.country].filter(Boolean).join(', ') || null;
  let place = structured;
  if (!place && job.location) {
    const cleaned = job.location
      .replace(/\b(remote|hybrid|on-?site|work from home|wfh|telecommut(?:e|ing)?)\b/gi, '')
      .replace(/[,|/•·]+/g, ', ')
      .replace(/\s+,/g, ',')
      .replace(/,\s*,+/g, ',')
      .replace(/^,\s*|\s*,$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    place = cleaned || null;
  }

  if (place && workplace) {
    if (workplace === 'Remote' && /remote/i.test(place)) {
      return { place, workplace, label: 'Remote' };
    }
    return { place, workplace, label: `${place} · ${workplace}` };
  }
  if (workplace) return { place, workplace, label: workplace };
  if (place) return { place, workplace, label: place };
  return { place: null, workplace: null, label: null };
}

export function formatFreshness(postedAt?: string | null, updatedAt?: string | null): string | null {
  if (postedAt) {
    const days = daysBetween(postedAt);
    if (days == null) return null;
    if (days <= 0) return 'Posted today';
    if (days === 1) return '1d ago';
    if (days < 30) return `${days}d ago`;
    return null;
  }
  if (updatedAt) {
    const days = daysBetween(updatedAt);
    if (days != null && days <= 7) return 'Updated recently';
  }
  return null;
}

function daysBetween(iso: string): number | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const ms = Date.now() - date.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / 86_400_000);
}

export function companyInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'A';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]![0] ?? ''}${words[1]![0] ?? ''}`.toUpperCase();
  }
  return trimmed.slice(0, 1).toUpperCase();
}

export function jobSummary(job: { summary?: string | null; descriptionText?: string | null }): string | null {
  const text = (job.summary || job.descriptionText || '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (/open the listing to read the full employer description/i.test(text)) return null;
  return text.length > 220 ? `${text.slice(0, 217).replace(/\s+\S*$/, '')}…` : text;
}

export function matchChips(match: OpportunityMatch | null | undefined): string[] {
  if (!match) return [];
  return match.reasons
    .filter((reason) => reason.kind === 'match')
    .map((reason) => reason.text.replace(/^(matches?|includes?|has)\s+/i, ''))
    .filter((text) => text.length > 0 && text.length <= 32)
    .slice(0, 3);
}

export function formatPostedDate(postedAt?: string | null): string | null {
  if (!postedAt) return null;
  const date = new Date(postedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function platformOptions(companies: string[]) {
  const known = MARKETPLACE_PLATFORMS.filter((platform) =>
    companies.some((company) => company.toLowerCase() === platform.value.toLowerCase()),
  );
  const knownValues = new Set(known.map((item) => item.value.toLowerCase()));
  const rest = companies.filter((company) => !knownValues.has(company.toLowerCase()));
  const options: Array<{ value: string; label: string }> = [
    { value: '', label: 'All platforms' },
    ...known.map((item) => ({ value: item.value, label: item.label })),
  ];
  if (known.length && rest.length) {
    options.push({ value: 'other', label: 'Other' });
  }
  options.push(...rest.map((name) => ({ value: name, label: name })));
  return options;
}

export type JobSection = {
  id: 'about' | 'responsibilities' | 'requirements' | 'nice' | 'benefits' | 'description';
  title: string;
  html: string;
};

const SECTION_MATCHERS: Array<{ id: JobSection['id']; title: string; pattern: RegExp }> = [
  { id: 'about', title: 'About the role', pattern: /about (the )?(role|job|position)|overview|summary|the role/i },
  { id: 'responsibilities', title: 'Responsibilities', pattern: /responsibilit|what you.?ll do|what you will do|the work|duties/i },
  { id: 'requirements', title: 'Requirements', pattern: /requirement|what you.?ll need|qualif|who you are|must have/i },
  { id: 'nice', title: 'Nice to have', pattern: /nice to have|preferred|bonus|plus/i },
  { id: 'benefits', title: 'Benefits', pattern: /benefit|perk|what we offer|compensation &/i },
];

export function splitJobDescription(html?: string | null, text?: string | null): JobSection[] {
  const source = html?.trim();
  if (source) {
    const parts = source.split(/<(h[1-3])\b[^>]*>/i);
    if (parts.length > 1) {
      const sections: JobSection[] = [];
      let intro = parts[0]?.trim() ?? '';
      for (let index = 1; index < parts.length; index += 2) {
        const headingHtml = parts[index + 1] ?? '';
        const close = headingHtml.match(/^([\s\S]*?)<\/h[1-3]>/i);
        const heading = (close?.[1] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const body = (close ? headingHtml.slice(close[0].length) : headingHtml).trim();
        const matched = SECTION_MATCHERS.find((item) => item.pattern.test(heading));
        if (matched && body) {
          sections.push({ id: matched.id, title: matched.title, html: body });
        } else if (heading && body) {
          sections.push({ id: 'description', title: heading, html: body });
        }
      }
      if (intro && !sections.some((item) => item.id === 'about')) {
        sections.unshift({ id: 'about', title: 'About the role', html: intro });
      }
      if (sections.length) return dedupeSections(sections);
    }
    return [{ id: 'description', title: 'Employer-provided description', html: source }];
  }

  const plain = (text ?? '').trim();
  if (!plain) return [];
  const paragraphs = plain.split(/\n{2,}/).map((item) => `<p>${escapeHtml(item)}</p>`).join('');
  return [{ id: 'description', title: 'Employer-provided description', html: paragraphs }];
}

function dedupeSections(sections: JobSection[]): JobSection[] {
  const seen = new Set<string>();
  return sections.filter((section) => {
    const key = `${section.id}:${section.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(section.html.trim());
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function jobFromOpportunityFields(job: PublicJobLike) {
  return {
    compensationText: formatCompensation(job),
    summary: jobSummary(job) ?? '',
    beginnerFriendly: Boolean(job.beginnerFriendly),
    experienceRequirement: job.experienceLevel ?? null,
  };
}
