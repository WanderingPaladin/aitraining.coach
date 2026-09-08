import { Award, BadgeCheck, UserRound } from 'lucide-react';
import { COURSE_TITLE, PASS_SCORE } from '../../../lib/learn/course';

export default function LearnCertificatePreview() {
  return (
    <aside className="learn-cert-preview" aria-hidden="true">
      <div className="learn-cert-frame">
        <p>AITrainers.coach</p>
        <h3>Certificate of Completion</h3>
        <b>{COURSE_TITLE}</b>
        <span>Preview only — not an issued credential</span>
        <ul>
          <li>
            <Award size={14} strokeWidth={2} />
            Pass score {PASS_SCORE}
          </li>
          <li>
            <BadgeCheck size={14} strokeWidth={2} />
            Educational program
          </li>
          <li>
            <UserRound size={14} strokeWidth={2} />
            Stored on your profile
          </li>
        </ul>
      </div>
    </aside>
  );
}
