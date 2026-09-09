import { COURSE_TITLE, PASS_SCORE } from '../../../lib/learn/course';

export default function LearnCertificatePreview() {
  return (
    <figure className="learn-cert-preview">
      <div className="learn-cert-sheet">
        <span className="learn-cert-watermark" aria-hidden="true">
          <span className="brand-mark">
            <i />
            <b />
          </span>
        </span>
        <header className="learn-cert-brand">
          <span className="brand-mark learn-cert-mark" aria-hidden="true">
            <i />
            <b />
          </span>
          <p>AI Trainers</p>
          <span>AITrainers.coach</span>
        </header>
        <p className="learn-cert-ribbon" aria-hidden="true" />
        <h3>Certificate of Completion</h3>
        <p className="learn-cert-program">{COURSE_TITLE}</p>
        <p className="learn-cert-preview-label">Preview only — not an issued credential</p>
        <ul className="learn-cert-attrs">
          <li>
            <span>Pass score</span>
            <b>{PASS_SCORE}/100</b>
          </li>
          <li>
            <span>Program type</span>
            <b>Educational</b>
          </li>
          <li>
            <span>Stored on</span>
            <b>Your profile</b>
          </li>
        </ul>
        <footer className="learn-cert-foot">
          <p>Awarded upon course completion and meeting the internal assessment requirement.</p>
          <p>Preview · Issued via AI Trainers profile</p>
        </footer>
      </div>
      <figcaption className="learn-sr">
        Preview of the AI Trainers Certificate of Completion for {COURSE_TITLE}. Pass score {PASS_SCORE}.
        This is not an issued credential.
      </figcaption>
    </figure>
  );
}
