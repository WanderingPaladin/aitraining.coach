'use client';

import CompareCard from './CompareCard';
import QuizCard from './QuizCard';
import type { LessonBlock } from '../../../lib/learn/content';

export default function LessonBlocks({
  blocks,
  quizResults,
  onQuiz,
}: {
  blocks: LessonBlock[];
  quizResults: Record<string, boolean>;
  onQuiz: (id: string, ok: boolean) => void;
}) {
  return (
    <div className="learn-blocks">
      {blocks.map((block, index) => {
        if (block.type === 'p') return <p key={index}>{block.text}</p>;
        if (block.type === 'h') return <h2 key={index}>{block.text}</h2>;
        if (block.type === 'callout') {
          return (
            <aside key={index} className={`learn-callout is-${block.tone ?? 'note'}`}>
              {block.title ? <strong>{block.title}</strong> : null}
              <p>{block.text}</p>
            </aside>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="learn-list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'example') {
          return (
            <figure key={index} className="learn-example">
              {block.title ? <figcaption>{block.title}</figcaption> : null}
              {block.prompt ? (
                <>
                  <p className="learn-prompt-label">Prompt</p>
                  <blockquote className="learn-prompt">{block.prompt}</blockquote>
                </>
              ) : null}
              {block.response ? (
                <>
                  <p className="learn-prompt-label">Response</p>
                  <pre className="learn-response">{block.response}</pre>
                </>
              ) : null}
              {block.note ? <p className="learn-note">{block.note}</p> : null}
            </figure>
          );
        }
        if (block.type === 'checklist') {
          return (
            <ul key={index} className="learn-checklist">
              {block.title ? <li className="learn-checklist-title">{block.title}</li> : null}
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'compare') {
          return (
            <CompareCard
              key={index}
              prompt={block.prompt}
              a={block.a}
              b={block.b}
              correct={block.correct}
              why={block.why}
            />
          );
        }
        if (block.type === 'quiz') {
          return (
            <QuizCard
              key={block.id}
              id={block.id}
              question={block.question}
              options={block.options}
              correct={block.correct}
              explanation={block.explanation}
              selected={quizResults[block.id] ? block.correct : undefined}
              onAnswer={onQuiz}
            />
          );
        }
        if (block.type === 'table') {
          return (
            <div key={index} className="learn-table-wrap">
              <table className="learn-table">
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header} scope="col">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.join('-')}>
                      {row.map((cell) => (
                        <td key={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={index} className="learn-inline-cta">
            <a className="primary-button" href={block.href}>
              {block.label}
            </a>
          </p>
        );
      })}
    </div>
  );
}
