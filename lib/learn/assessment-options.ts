export type DisplayOption = {
  internalValue: string;
  optionCode: string | null;
  displayText: string;
};

export type OptionLayout = 'binary' | 'choice' | 'long';
type QuestionKind = 'mcq' | 'yesno' | 'compare' | 'written';

const OPTION_CODE = /^[A-Z]$/;
const SHORT_LABEL = 24;
const LONG_LABEL = 90;

export function displayOption(option: { id: string; label?: string }): DisplayOption {
  const internalValue = String(option.id ?? '');
  const label = String(option.label ?? '').trim();
  const optionCode = OPTION_CODE.test(internalValue) ? internalValue : null;
  let displayText = label;
  if (optionCode && displayText === optionCode) displayText = '';
  if (!displayText && !optionCode) {
    displayText = titleCase(internalValue);
  } else if (
    !optionCode &&
    displayText &&
    displayText.toLowerCase() === internalValue.toLowerCase()
  ) {
    displayText = titleCase(displayText);
  }
  return { internalValue, optionCode, displayText };
}

export function optionLayout(question: { type: QuestionKind }, options: DisplayOption[]): OptionLayout {
  if (question.type === 'yesno') return 'binary';
  if (question.type === 'compare') return 'long';
  if (options.some((option) => option.displayText.includes('\n') || option.displayText.length > LONG_LABEL)) {
    return 'long';
  }
  if (
    options.length === 2 &&
    options.every((option) => !option.optionCode && option.displayText.length <= SHORT_LABEL)
  ) {
    return 'binary';
  }
  return 'choice';
}

function titleCase(value: string) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
