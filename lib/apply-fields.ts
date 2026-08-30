export const professions = [
  'Software',
  'Finance',
  'Writing',
  'Science',
  'Legal',
  'Education',
  'Healthcare',
  'Research',
  'Marketing',
  'Other',
] as const;

export type Profession = (typeof professions)[number];

export const experienceYearOptions = [
  { value: '0', label: 'New to AI training' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '3+' },
] as const;

export function isValidExperienceYears(value: string): boolean {
  return experienceYearOptions.some((option) => option.value === value);
}

export const referralSources = [
  { value: 'google', label: 'Google' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'friend', label: 'Friend or colleague' },
  { value: 'ai_platform', label: 'AI training platform' },
  { value: 'other', label: 'Other' },
] as const;

export function isValidReferralSource(value: string): boolean {
  if (!value.trim()) {
    return true;
  }
  return referralSources.some((source) => source.value === value);
}

export function resolveReferralSource(source: string, detail = ''): string | undefined {
  const selected = source.trim();
  if (!selected) {
    return undefined;
  }
  if (selected === 'other') {
    const extra = detail.trim().replace(/\s+/g, ' ').slice(0, 120);
    return extra || 'Other';
  }
  return referralSources.find((option) => option.value === selected)?.label;
}

export const applicantStages = [
  'new_no_account',
  'has_accounts_no_time',
  'working_no_progress',
] as const;

export type ApplicantStage = (typeof applicantStages)[number];

export function isValidApplicantStage(value: string): value is ApplicantStage {
  return (applicantStages as readonly string[]).includes(value);
}

export const usStates = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
] as const;

export const usStateCodes = usStates.map((state) => state.code);

export type PhoneCountry = {
  iso: string;
  name: string;
  dial: string;
  lengths: number[];
};

export const phoneCountries: PhoneCountry[] = [
  { iso: 'US', name: 'United States', dial: '1', lengths: [10] },
  { iso: 'CA', name: 'Canada', dial: '1', lengths: [10] },
  { iso: 'GB', name: 'United Kingdom', dial: '44', lengths: [10] },
  { iso: 'AU', name: 'Australia', dial: '61', lengths: [9] },
  { iso: 'IN', name: 'India', dial: '91', lengths: [10] },
  { iso: 'DE', name: 'Germany', dial: '49', lengths: [10, 11] },
  { iso: 'FR', name: 'France', dial: '33', lengths: [9] },
  { iso: 'ES', name: 'Spain', dial: '34', lengths: [9] },
  { iso: 'IT', name: 'Italy', dial: '39', lengths: [9, 10] },
  { iso: 'NL', name: 'Netherlands', dial: '31', lengths: [9] },
  { iso: 'IE', name: 'Ireland', dial: '353', lengths: [9] },
  { iso: 'MX', name: 'Mexico', dial: '52', lengths: [10] },
  { iso: 'BR', name: 'Brazil', dial: '55', lengths: [10, 11] },
  { iso: 'AR', name: 'Argentina', dial: '54', lengths: [10] },
  { iso: 'CO', name: 'Colombia', dial: '57', lengths: [10] },
  { iso: 'CL', name: 'Chile', dial: '56', lengths: [9] },
  { iso: 'PE', name: 'Peru', dial: '51', lengths: [9] },
  { iso: 'NG', name: 'Nigeria', dial: '234', lengths: [10] },
  { iso: 'ZA', name: 'South Africa', dial: '27', lengths: [9] },
  { iso: 'KE', name: 'Kenya', dial: '254', lengths: [9] },
  { iso: 'GH', name: 'Ghana', dial: '233', lengths: [9] },
  { iso: 'EG', name: 'Egypt', dial: '20', lengths: [10] },
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', lengths: [9] },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', lengths: [9] },
  { iso: 'IL', name: 'Israel', dial: '972', lengths: [9] },
  { iso: 'TR', name: 'Turkey', dial: '90', lengths: [10] },
  { iso: 'PK', name: 'Pakistan', dial: '92', lengths: [10] },
  { iso: 'BD', name: 'Bangladesh', dial: '880', lengths: [10] },
  { iso: 'PH', name: 'Philippines', dial: '63', lengths: [10] },
  { iso: 'ID', name: 'Indonesia', dial: '62', lengths: [10, 11] },
  { iso: 'MY', name: 'Malaysia', dial: '60', lengths: [9, 10] },
  { iso: 'SG', name: 'Singapore', dial: '65', lengths: [8] },
  { iso: 'TH', name: 'Thailand', dial: '66', lengths: [9] },
  { iso: 'VN', name: 'Vietnam', dial: '84', lengths: [9] },
  { iso: 'JP', name: 'Japan', dial: '81', lengths: [10] },
  { iso: 'KR', name: 'South Korea', dial: '82', lengths: [9, 10] },
  { iso: 'CN', name: 'China', dial: '86', lengths: [11] },
  { iso: 'HK', name: 'Hong Kong', dial: '852', lengths: [8] },
  { iso: 'TW', name: 'Taiwan', dial: '886', lengths: [9] },
  { iso: 'NZ', name: 'New Zealand', dial: '64', lengths: [8, 9, 10] },
  { iso: 'PL', name: 'Poland', dial: '48', lengths: [9] },
  { iso: 'SE', name: 'Sweden', dial: '46', lengths: [9] },
  { iso: 'NO', name: 'Norway', dial: '47', lengths: [8] },
  { iso: 'DK', name: 'Denmark', dial: '45', lengths: [8] },
  { iso: 'FI', name: 'Finland', dial: '358', lengths: [9, 10] },
  { iso: 'PT', name: 'Portugal', dial: '351', lengths: [9] },
  { iso: 'CH', name: 'Switzerland', dial: '41', lengths: [9] },
  { iso: 'AT', name: 'Austria', dial: '43', lengths: [10, 11] },
  { iso: 'BE', name: 'Belgium', dial: '32', lengths: [9] },
  { iso: 'CZ', name: 'Czechia', dial: '420', lengths: [9] },
  { iso: 'RO', name: 'Romania', dial: '40', lengths: [9] },
  { iso: 'UA', name: 'Ukraine', dial: '380', lengths: [9] },
];

const CITY_RE = /^[A-Za-z][A-Za-z .'-]{1,78}[A-Za-z.]$|^[A-Za-z]{2,80}$/;

const RESERVED_EMAIL_TLDS = new Set([
  'example',
  'invalid',
  'local',
  'localhost',
  'test',
  'internal',
  'lan',
]);

const RESERVED_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.net',
  'example.org',
  'test.com',
  'invalid.com',
]);

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\-()\s]/g, '').slice(0, 22);
}

export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 254 || email.includes('..') || email.includes(' ')) {
    return false;
  }
  const at = email.indexOf('@');
  if (at < 1 || at !== email.lastIndexOf('@')) {
    return false;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length < 1 || local.length > 64 || domain.length < 4 || domain.length > 253) {
    return false;
  }
  if (!/^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?$/.test(local) && !/^[a-z0-9]$/.test(local)) {
    return false;
  }
  const labels = domain.split('.');
  if (labels.length < 2) {
    return false;
  }
  const tld = labels[labels.length - 1];
  if (!tld || !/^[a-z]{2,63}$/.test(tld) || RESERVED_EMAIL_TLDS.has(tld)) {
    return false;
  }
  if (
    RESERVED_EMAIL_DOMAINS.has(domain) ||
    [...RESERVED_EMAIL_DOMAINS].some((reserved) => domain.endsWith(`.${reserved}`))
  ) {
    return false;
  }
  return labels.slice(0, -1).every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}

function isValidNanpNational(national: string): boolean {
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) {
    return false;
  }
  const area = national.slice(0, 3);
  const exchange = national.slice(3, 6);
  const subscriber = national.slice(6);
  if (area === '555' || (area[1] === '1' && area[2] === '1')) {
    return false;
  }
  if (exchange[1] === '1' && exchange[2] === '1') {
    return false;
  }
  if (exchange === '555' && subscriber.startsWith('01')) {
    return false;
  }
  return new Set(national).size >= 3;
}

function isPlausibleNational(dial: string, national: string): boolean {
  if (national.length < 6 || /^(\d)\1+$/.test(national)) {
    return false;
  }
  if (national.length >= 8 && new Set(national).size < 3) {
    return false;
  }
  if (dial === '1') {
    return isValidNanpNational(national);
  }
  if (dial === '91') {
    return /^[6-9]\d{9}$/.test(national);
  }
  if (dial === '44') {
    return /^[1-9]\d{9}$/.test(national);
  }
  if (dial === '61') {
    return /^[2-478]\d{8}$/.test(national);
  }
  if (dial === '33' || dial === '34' || dial === '39' || dial === '49') {
    return /^[1-9]\d+$/.test(national);
  }
  return true;
}

export function isValidCity(value: string): boolean {
  const city = value.trim().replace(/\s+/g, ' ');
  if (city.length < 2 || city.length > 80) {
    return false;
  }
  if (/\d/.test(city)) {
    return false;
  }
  return CITY_RE.test(city);
}

export function isValidState(value: string): boolean {
  return usStateCodes.includes(value as (typeof usStateCodes)[number]);
}

export function isValidProfession(value: string): value is Profession {
  return (professions as readonly string[]).includes(value);
}

export function findPhoneCountry(iso: string): PhoneCountry | undefined {
  return phoneCountries.find((country) => country.iso === iso);
}

export function findPhoneCountryByName(name: string): PhoneCountry | undefined {
  const normalized = name.trim().toLowerCase();
  return phoneCountries.find(
    (country) =>
      country.name.toLowerCase() === normalized || country.iso.toLowerCase() === normalized,
  );
}

export function normalizeNationalNumber(iso: string, national: string): string {
  let digits = digitsOnly(national);
  const country = findPhoneCountry(iso);
  if (!country || digits.length === 0) {
    return digits;
  }
  if (digits.startsWith(country.dial) && country.lengths.includes(digits.length - country.dial.length)) {
    digits = digits.slice(country.dial.length);
  }
  if (digits.startsWith('0') && country.lengths.includes(digits.length - 1)) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidNationalNumber(iso: string, national: string): boolean {
  const country = findPhoneCountry(iso);
  const digits = normalizeNationalNumber(iso, national);
  if (!country) {
    return false;
  }
  return country.lengths.includes(digits.length) && isPlausibleNational(country.dial, digits);
}

export function toE164(iso: string, national: string): string | null {
  const country = findPhoneCountry(iso);
  const digits = normalizeNationalNumber(iso, national);
  if (!country || !country.lengths.includes(digits.length) || !isPlausibleNational(country.dial, digits)) {
    return null;
  }
  return `+${country.dial}${digits}`;
}

export type ApplyFieldErrors = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  profession: string;
  yearsOfExperience: string;
  applicant_stage: string;
  referral_source: string;
}>;

export function validateApplyFields(input: {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  city: string;
  state: string;
  profession: string;
  yearsOfExperience: string;
  applicant_stage: string;
  referral_source?: string;
  referral_source_detail?: string;
}): ApplyFieldErrors {
  const errors: ApplyFieldErrors = {};

  if (!isValidApplicantStage(input.applicant_stage)) {
    errors.applicant_stage = 'Please select the option that best describes your current situation.';
  }

  if (input.firstName.trim().length < 1) {
    errors.firstName = 'Enter your first name.';
  }
  if (input.lastName.trim().length < 1) {
    errors.lastName = 'Enter your last name.';
  }
  if (!isValidEmail(input.email)) {
    errors.email = 'Enter a valid email address, like you@company.com.';
  }

  if (!toE164(input.phoneCountry, input.phone)) {
    const country = findPhoneCountry(input.phoneCountry);
    const expected = country?.lengths.join(' or ');
    errors.phone = expected
      ? `Enter a real ${expected}-digit phone number for the selected country.`
      : 'Enter a valid phone number.';
  }

  if (!isValidCity(input.city)) {
    errors.city = 'Enter a valid city name.';
  }

  if (!isValidState(input.state)) {
    errors.state = 'Select a state.';
  }

  if (!isValidProfession(input.profession)) {
    errors.profession = 'Select a profession.';
  }

  if (!isValidExperienceYears(input.yearsOfExperience)) {
    errors.yearsOfExperience = 'Select years of AI training.';
  }

  if (!isValidReferralSource(input.referral_source ?? '')) {
    errors.referral_source = 'Select where you found us, or leave this blank.';
  }
  if ((input.referral_source_detail ?? '').trim().length > 120) {
    errors.referral_source = 'Keep this under 120 characters.';
  }

  return errors;
}
