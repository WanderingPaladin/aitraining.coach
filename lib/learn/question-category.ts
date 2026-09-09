import bank from './data/assessment-key.json';

const CATEGORY_LABEL: Record<string, string> = {
  instruction_following: 'Instruction Following',
  response_evaluation: 'Response Evaluation',
  factuality: 'Factuality & Research Judgment',
  written_reasoning: 'Written Reasoning',
  attention_to_detail: 'Attention to Detail',
};

export function questionCategoryLabel(id: string) {
  const item = (bank as Array<{ id: string; category: string }>).find((question) => question.id === id);
  return item ? CATEGORY_LABEL[item.category] ?? null : null;
}
