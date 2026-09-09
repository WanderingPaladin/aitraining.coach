'use client';

import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import Brand from '../Brand';
import { COURSE_TITLE, LEARN_PATH } from '../../../lib/learn/course';

export type AssessmentSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function AssessmentShell({
  children,
  footer,
  saveStatus = 'idle',
  onSaveExit,
  onRetrySave,
  saveDisabled = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  saveStatus?: AssessmentSaveStatus;
  onSaveExit?: () => void;
  onRetrySave?: () => void;
  saveDisabled?: boolean;
}) {
  return (
    <main className="learn-assess-page" id="top">
      <header className="learn-assess-top">
        <div className="shell learn-assess-top-bar">
          <Brand href="/" />
          <p className="learn-assess-course">{COURSE_TITLE}</p>
          <div className="learn-assess-top-actions">
            <p className="learn-save-status" aria-live="polite">
              {saveStatus === 'saving' ? 'Saving…' : null}
              {saveStatus === 'saved' ? 'Saved' : null}
              {saveStatus === 'error' && onRetrySave ? (
                <button type="button" className="learn-text-retry" onClick={onRetrySave}>
                  <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
                  Not saved — Retry
                </button>
              ) : null}
            </p>
            {onSaveExit ? (
              <button
                type="button"
                className="secondary-button on-light learn-assess-exit"
                onClick={onSaveExit}
                disabled={saveDisabled}
              >
                Save &amp; Exit
              </button>
            ) : (
              <a className="secondary-button on-light learn-assess-exit" href={LEARN_PATH.course}>
                Back to course
              </a>
            )}
          </div>
        </div>
      </header>
      <nav className="shell learn-assess-crumb" aria-label="Breadcrumb">
        <a href={LEARN_PATH.course}>{COURSE_TITLE}</a>
        <span aria-hidden="true"> / </span>
        <span>Final Assessment</span>
      </nav>
      <div className="shell learn-assess-body">{children}</div>
      {footer}
    </main>
  );
}
