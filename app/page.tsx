import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  CircleCheckBig,
  ClipboardCheck,
  Code2,
  FileText,
  FlaskConical,
  GraduationCap,
  Headphones,
  Landmark,
  Laptop,
  Minus,
  PenLine,
  Plus,
  Rocket,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import ApplyBooking from './components/ApplyBooking';
import BookIntroCallButton from './components/BookIntroCallButton';
import FeatureIcon, { type FeatureIconVariant } from './components/FeatureIcon';
import HeroCarousel from './components/HeroCarousel';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';

const processSteps: Array<{
  number: string;
  icon: LucideIcon;
  variant: FeatureIconVariant;
  title: string;
  copy: string;
}> = [
  { number: '01', icon: FileText, variant: 'apply', title: 'Apply', copy: 'Submit a short application to tell us about your background and goals.' },
  { number: '02', icon: CalendarDays, variant: 'book', title: 'Book a Call', copy: 'Schedule your free intro call with our team to discuss your fit and questions.' },
  { number: '03', icon: ClipboardCheck, variant: 'review', title: 'Get Reviewed', copy: 'We review your profile and provide personalized feedback and next steps.' },
  { number: '04', icon: Rocket, variant: 'move', title: 'Move Forward', copy: 'Gain access to resources, opportunities, and coaching to launch your AI career.' },
];

const testimonials = [
  ['Priya S.', 'Austin, TX', '“AI Trainers gave me the clarity and confidence I needed to pursue AI training online. The feedback was incredibly helpful and supportive.”', 'PS'],
  ['Daniel R.', 'Seattle, WA', '“The intro call was informative and encouraging. The guidance helped me refine my profile and land my first project within weeks.”', 'DR'],
  ['Maria K.', 'Boston, MA', '“I love the personalized approach. The coaches care about your growth and prepare you for real opportunities.”', 'MK'],
];

const faqs = [
  ['Who can apply to become an AI Trainer?', 'Professionals from any field can apply. Strong subject knowledge, communication skills, and curiosity matter more than a technical job title.'],
  ['Do I need coding experience?', 'No. Many AI training projects need expertise in writing, finance, science, law, research, and other non-coding domains.'],
  ['How does the free intro call work?', 'It is a friendly conversation about your background, goals, and the kind of AI training work that may suit you.'],
  ['How are candidates reviewed?', 'We consider your domain expertise, communication, attention to detail, and readiness to learn the project workflow.'],
  ['What kinds of opportunities are available?', 'Opportunities vary and may include response evaluation, data annotation, domain-specific writing, research, and quality review.'],
  ['Is this a full-time role?', 'Engagements vary. Some are flexible projects and others offer more consistent hours, depending on your fit and availability.'],
];

const professions: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Code2, label: 'Software' },
  { icon: Landmark, label: 'Finance' },
  { icon: PenLine, label: 'Writing' },
  { icon: FlaskConical, label: 'Science' },
  { icon: Scale, label: 'Legal' },
];

const trainingPlatforms: Array<{ name: string; src: string; href: string }> = [
  { name: 'Snorkel', src: '/brands/snorkel-icon.png', href: 'https://snorkel.ai' },
  { name: 'Handshake', src: '/brands/handshake-icon.svg', href: 'https://joinhandshake.com/ai/' },
  { name: 'Outlier', src: '/brands/outlier.svg', href: 'https://outlier.ai/' },
  { name: 'micro1', src: '/brands/micro1.png', href: 'https://www.micro1.ai/experts' },
  { name: 'DataAnnotation', src: '/brands/dataannotation.png', href: 'https://www.dataannotation.tech/' },
];

function PayrollPreview() {
  return (
    <div className="product-stage" aria-label="Example AI trainer earnings dashboard">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="payroll-visual-group">
        <div className="payroll-stage">
          <div className="dashboard">
            <img src="/brands/payroll-overview.png" alt="Snorkel payroll overview dashboard" />
          </div>
          <img className="mascot" src="/brands/snorkel-icon.png" alt="" />
        </div>
        <div className="platform-dock">
          <p className="platform-dock-label">Explore AI Training Platforms</p>
          <div className="platform-dock-row">
            {trainingPlatforms.map((platform) => (
              <a
                key={platform.name}
                className="platform-card"
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.name}
                title={platform.name}
              >
                <img src={platform.src} alt="" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main id="top">
      <section className="hero">
        <div className="hero-glow" />
        <SiteHeader current="home" home />

        <div className="hero-grid shell">
          <div className="hero-copy">
            <HeroCarousel />
            <div className="benefit-chips">
              <span>
                <FeatureIcon icon={ShieldCheck} variant="dark" size={22} tileSize={36} iconClassName="text-[#14C7E5]" />
                No prior AI training<br />experience needed
              </span>
              <span>
                <FeatureIcon icon={GraduationCap} variant="dark" size={22} tileSize={36} iconClassName="text-[#1687FF]" />
                Step-by-step<br />expert coaching
              </span>
              <span>
                <FeatureIcon icon={TrendingUp} variant="dark" size={22} tileSize={36} iconClassName="text-[#A855F7]" />
                Build a clearer<br />path forward
              </span>
            </div>
            <div className="hero-actions">
              <BookIntroCallButton className="primary-button hero-primary-cta" href="#apply" />
              <p className="hero-cta-note">No experience required to start the conversation.</p>
            </div>
            <div className="social-proof">
              <div className="avatar-stack" aria-hidden="true"><img src="/people/priya.jpg" alt="" /><img src="/people/daniel.jpg" alt="" /><img src="/people/maria.jpg" alt="" /><img src="/people/noah.jpg" alt="" /></div>
              <div><strong>★★★★★</strong><p>Trusted by 2,500+ aspiring AI trainers<br />who are building rewarding careers.</p></div>
            </div>
          </div>
          <PayrollPreview />
        </div>
      </section>

      <section className="value-strip shell" aria-label="Program benefits">
        <article>
          <ShieldCheck size={24} strokeWidth={2} className="value-icon" color="#1687FF" />
          <span><strong>Guidance for AI</strong><small>training opportunities</small></span>
        </article>
        <article>
          <Laptop size={24} strokeWidth={2} className="value-icon" color="#14C7E5" />
          <span><strong>Remote-friendly</strong><small>opportunities</small></span>
        </article>
        <article>
          <UsersRound size={24} strokeWidth={2} className="value-icon" color="#4F46E5" />
          <span><strong>Community & expert</strong><small>support</small></span>
        </article>
        <article>
          <Target size={24} strokeWidth={2} className="value-icon" color="#1687FF" />
          <span><strong>Career coaching</strong><small>that empowers</small></span>
        </article>
      </section>

      <section className="section process-section shell" id="how">
        <div className="section-heading">
          <h2>How It Works</h2>
          <p>A simple, supportive process to help you get started.</p>
        </div>
        <div className="process-grid">
          {processSteps.map((step, index) => (
            <article className="process-card" key={step.title}>
              <span className="step-number">{step.number}</span>
              <FeatureIcon icon={step.icon} variant={step.variant} size={30} tileSize={60} />
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
              {index < processSteps.length - 1 && (
                <ChevronRight className="process-arrow" size={28} strokeWidth={2} aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section audience-section shell">
        <div className="section-heading compact">
          <h2>Who Can Join AI Trainers?</h2>
          <p>Whether you are new to AI training or already working in the field, our coaching helps you turn your professional strengths into more stable income opportunities.</p>
        </div>
        <div className="audience-grid">
          <article className="audience-card new-card">
            <img className="profile-photo" src="/people/priya.jpg" alt="Professional exploring AI training opportunities" />
            <div className="audience-copy">
              <div className="audience-support">
                <FeatureIcon icon={GraduationCap} variant="purple" size={30} />
                <BriefcaseBusiness size={16} strokeWidth={2} className="audience-secondary" aria-hidden="true" />
              </div>
              <h3>Professionals New<br />to AI Training</h3>
              <p>You do <strong>not</strong> need prior AI or AI training experience. If you have a professional background, domain knowledge in a field, or want to work on flexible projects, we’ll become your expert guide.</p>
            </div>
            <div className="check-list">
              <span><CircleCheck size={14} strokeWidth={2.2} color="#2563EB" aria-hidden="true" /> No prior AI experience needed</span>
              <span><CircleCheck size={14} strokeWidth={2.2} color="#2563EB" aria-hidden="true" /> Use your profession as a strength</span>
              <span><CircleCheck size={14} strokeWidth={2.2} color="#2563EB" aria-hidden="true" /> Coaching to help you get started</span>
            </div>
            <div className="profession-tags">
              <b>Examples of professions</b>
              {professions.map(({ icon: Icon, label }) => (
                <span key={label}><Icon size={14} strokeWidth={2} aria-hidden="true" /> {label}</span>
              ))}
            </div>
          </article>
          <article className="audience-card current-card">
            <img className="profile-photo" src="/people/amira.jpg" alt="AI trainer working in a modern office" />
            <div className="audience-copy">
              <div className="audience-support">
                <FeatureIcon icon={TrendingUp} variant="blue" size={30} />
                <Headphones size={16} strokeWidth={2} className="audience-secondary" aria-hidden="true" />
              </div>
              <h3>Current AI Trainers<br />Who Need Support</h3>
              <p>You already work as an AI trainer but are struggling with progression, or don’t have enough time or structure to mentor? We’ll help you simplify your systems, improve your strategies, and earn more stable income without burnout.</p>
            </div>
            <div className="check-list">
              <span><CircleCheck size={14} strokeWidth={2.2} color="#2563EB" aria-hidden="true" /> Already working as an AI trainer</span>
              <span><CircleCheck size={14} strokeWidth={2.2} color="#2563EB" aria-hidden="true" /> Struggling to progress consistently</span>
              <span><CircleCheck size={14} strokeWidth={2.2} color="#2563EB" aria-hidden="true" /> Need guidance and direction</span>
            </div>
          </article>
        </div>
      </section>

      <section className="section stories-section shell" id="stories">
        <div className="section-heading">
          <h2>What Candidates Say</h2>
          <p>Stories from people who are building their future with AI Trainers.</p>
        </div>
        <div className="story-grid">
          {testimonials.map(([name, location, quote], index) => (
            <article className="story-card" key={name}>
              <strong className="stars">★★★★★</strong>
              <blockquote>{quote}</blockquote>
              <footer><img src={['/people/priya.jpg', '/people/daniel.jpg', '/people/maria.jpg'][index]} alt="Representative portrait" /><span><b>{name}</b><small>{location}</small></span></footer>
            </article>
          ))}
        </div>
        <p className="stories-more"><a href="/stories">Read coaching journeys <span aria-hidden="true">→</span></a></p>
      </section>

      <section className="section faq-section shell" id="faq">
        <div className="section-heading compact"><h2>Frequently Asked Questions</h2></div>
        <div className="faq-grid">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span className="faq-toggle">
                  <Plus className="faq-plus" size={18} strokeWidth={2} />
                  <Minus className="faq-minus" size={18} strokeWidth={2} />
                </span>
              </summary>
              <div className="faq-panel">
                <p>{answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="apply-section shell" id="apply">
        <div className="apply-section-head">
          <FeatureIcon icon={BriefcaseBusiness} variant="cta" size={28} tileSize={60} className="cta-icon" />
          <div>
            <h2>Ready to Start Your Journey?</h2>
            <p>Not sure where to start? That’s exactly what the intro call is for. Share a few details, then pick a time — we’ll send a Google Meet invite to your inbox.</p>
          </div>
          <FeatureIcon icon={CircleCheckBig} variant="cta" size={28} tileSize={60} className="cta-icon" />
        </div>
        <ApplyBooking />
      </section>

      <SiteFooter />
    </main>
  );
}
