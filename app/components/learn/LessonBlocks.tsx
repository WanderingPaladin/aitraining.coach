'use client';

import CompareCard from './CompareCard';
import QuizCard from './QuizCard';

export type V2Section = {
  type: string;
  heading?: string;
  body?: string;
  items?: string[];
  left?: { title: string; items: string[] };
  right?: { title: string; items: string[] };
  prompt?: string;
  response?: string;
  analysis?: string;
  a?: string;
  b?: string;
  correct?: string;
  term?: string;
  definition?: string;
};

export type V2QuickCheck = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

function letters(index: number) {
  return String.fromCharCode(65 + index);
}

export default function LessonBlocks({
  sections,
  quickChecks,
  quizResults,
  onQuiz,
}: {
  sections: V2Section[];
  quickChecks: V2QuickCheck[];
  quizResults: Record<string, boolean>;
  onQuiz: (id: string, ok: boolean) => void;
}) {
  return (
    <div className="learn-blocks">
      {sections.map((block, index) => {
        if (block.type === 'intro' || block.type === 'key_point' || block.type === 'mini_scenario' || block.type === 'reflection') {
          return (
            <section key={index}>
              {block.heading ? <h2>{block.heading}</h2> : null}
              {block.body ? <p>{block.body}</p> : null}
            </section>
          );
        }
        if (block.type === 'callout' || block.type === 'warning') {
          return (
            <aside key={index} className={`learn-callout ${block.type === 'warning' ? 'is-warn' : 'is-note'}`}>
              {block.heading ? <strong>{block.heading}</strong> : null}
              <p>{block.body}</p>
            </aside>
          );
        }
        if (block.type === 'bullet_list' || block.type === 'module_summary' || block.type === 'checklist' || block.type === 'rubric' || block.type === 'framework') {
          return (
            <section key={index}>
              {block.heading ? <h2>{block.heading}</h2> : null}
              {block.type === 'module_summary' ? <p className="learn-kicker">Module summary</p> : null}
              <ul className={block.type === 'checklist' || block.type === 'rubric' ? 'learn-checklist' : 'learn-list'}>
                {(block.items ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          );
        }
        if (block.type === 'numbered_steps') {
          return (
            <section key={index}>
              {block.heading ? <h2>{block.heading}</h2> : null}
              <ol className="learn-list">
                {(block.items ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          );
        }
        if (block.type === 'comparison' && block.left && block.right) {
          return (
            <section key={index} className="learn-split">
              {block.heading ? <h2 className="learn-split-title">{block.heading}</h2> : null}
              <article>
                <h3>{block.left.title}</h3>
                <ul className="learn-list">
                  {block.left.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h3>{block.right.title}</h3>
                <ul className="learn-list">
                  {block.right.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </section>
          );
        }
        if (block.type === 'term_definition') {
          return (
            <aside key={index} className="learn-callout is-tip">
              <strong>{block.term}</strong>
              <p>{block.definition}</p>
            </aside>
          );
        }
        if (block.type === 'prompt_example') {
          return (
            <figure key={index} className="learn-example">
              {block.heading ? <figcaption>{block.heading}</figcaption> : null}
              {block.prompt ? (
                <>
                  <p className="learn-prompt-label">Prompt</p>
                  <blockquote className="learn-prompt">{block.prompt}</blockquote>
                </>
              ) : null}
              {block.response ? (
                <>
                  <p className="learn-prompt-label">Response</p>
                  <pre className="learn-response">{String(block.response).replace(/\\n/g, '\n')}</pre>
                </>
              ) : null}
              {block.analysis ? <p className="learn-note">{block.analysis}</p> : null}
            </figure>
          );
        }
        if (block.type === 'response_comparison') {
          return (
            <CompareCard
              key={index}
              prompt={block.prompt}
              a={String(block.a ?? '').replace(/\\n/g, '\n')}
              b={String(block.b ?? '').replace(/\\n/g, '\n')}
              correct={(block.correct === 'B' ? 'B' : 'A') as 'A' | 'B'}
              why={block.analysis ?? ''}
            />
          );
        }
        return block.body ? <p key={index}>{block.body}</p> : null;
      })}
      {quickChecks.map((item, index) => {
        const id = `qc-${index}-${item.q.slice(0, 24)}`;
        const correct = letters(item.answer);
        return (
          <QuizCard
            key={id}
            id={id}
            question={item.q}
            options={item.options.map((label, optionIndex) => ({ id: letters(optionIndex), label }))}
            correct={correct}
            explanation={item.why}
            selected={quizResults[id] ? correct : undefined}
            onAnswer={onQuiz}
          />
        );
      })}
    </div>
  );
}
