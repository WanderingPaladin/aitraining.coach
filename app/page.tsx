const payRows = [
  ['Apr 20 – May 3, 2025', '$634.50', 'May 3, 2025'],
  ['Apr 6 – Apr 19, 2025', '$646.00', 'Apr 19, 2025'],
  ['Mar 23 – Apr 5, 2025', '$642.26', 'Apr 10, 2025'],
];

const processSteps = [
  ['01', '▤', 'Apply', 'Submit a short application to tell us about your background and goals.'],
  ['02', '▦', 'Book a Call', 'Schedule your free intro call with our team to discuss your fit and questions.'],
  ['03', '✓', 'Get Reviewed', 'We review your profile and provide personalized feedback and next steps.'],
  ['04', '◆', 'Move Forward', 'Gain access to resources, opportunities, and coaching to launch your AI career.'],
];

const testimonials = [
  ['Priya S.', 'Bengaluru, India', '“AI Trainers gave me the clarity and confidence I needed to pursue AI training online. The feedback was incredibly helpful and supportive.”', 'PS'],
  ['Daniel R.', 'Vancouver, Canada', '“The intro call was informative and encouraging. The guidance helped me refine my profile and land my first project within weeks.”', 'DR'],
  ['Maria K.', 'Munich, Germany', '“I love the personalized approach. The coaches care about your growth and prepare you for real opportunities.”', 'MK'],
];

const faqs = [
  ['Who can apply to become an AI Trainer?', 'Professionals from any field can apply. Strong subject knowledge, communication skills, and curiosity matter more than a technical job title.'],
  ['Do I need coding experience?', 'No. Many AI training projects need expertise in writing, finance, science, law, research, and other non-coding domains.'],
  ['How does the free intro call work?', 'It is a friendly conversation about your background, goals, and the kind of AI training work that may suit you.'],
  ['How are candidates reviewed?', 'We consider your domain expertise, communication, attention to detail, and readiness to learn the project workflow.'],
  ['What kinds of opportunities are available?', 'Opportunities vary and may include response evaluation, data annotation, domain-specific writing, research, and quality review.'],
  ['Is this a full-time role?', 'Engagements vary. Some are flexible projects and others offer more consistent hours, depending on your fit and availability.'],
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="AI Trainers home">
      <span className="brand-mark" aria-hidden="true"><i /><b /></span>
      <span>AI Trainers</span>
    </a>
  );
}

function PayrollPreview() {
  return (
    <div className="product-stage" aria-label="Example AI trainer earnings dashboard">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="dashboard">
        <aside className="dash-side">
          <strong className="dash-brand"><img src="/brands/snorkel-lockup.jpg" alt="Snorkel" /></strong>
          {['⌂  Home', '▣  Projects', '☷  Tasks', '▤  Data Library', '$  Payroll', '▦  Payments', '⚙  Settings'].map((item) => (
            <span className={item.includes('Payroll') ? 'active' : ''} key={item}>{item}</span>
          ))}
          <small>◉ &nbsp; Mrs Trainer</small>
        </aside>
        <section className="dash-main">
          <div className="dash-tools">⌕ &nbsp; ♧ &nbsp; ◉ &nbsp; ⚙</div>
          <h2>Payroll Overview</h2>
          <p>Track your earnings and pay periods</p>
          <div className="stat-grid">
            <article><small>Total Earnings</small><strong>$2,847.50</strong><span>All time earnings</span></article>
            <article><small>Pending Review</small><strong>$212.75</strong><span>Under review</span></article>
            <article><small>Next Payday</small><strong>May 15, 2025</strong><span>In 5 days</span></article>
          </div>
          <h3>Recent Pay Periods</h3>
          <div className="pay-table">
            <div className="pay-head"><span>Pay Period</span><span>Status</span><span>Earnings</span><span>Paid On</span></div>
            {payRows.map(([period, amount, date]) => (
              <div className="pay-row" key={period}><span>{period}</span><em>Paid</em><strong>{amount}</strong><span>{date}</span></div>
            ))}
          </div>
        </section>
      </div>
      <div className="partner-badge badge-top"><img src="/brands/snorkel-icon.jpg" alt="" /><span>Snorkel</span><small>↗</small></div>
      <div className="partner-badge badge-bottom"><img className="handshake-logo" src="/brands/handshake.png" alt="" /><span>Handshake</span><small>↗</small></div>
      <img className="mascot" src="/brands/snorkel-icon.jpg" alt="Snorkel octopus" />
    </div>
  );
}

export default function Home() {
  return (
    <main id="top">
      <section className="hero">
        <div className="hero-glow" />
        <header className="site-header shell">
          <Brand />
          <nav aria-label="Main navigation">
            <a className="current" href="#top">Home</a>
            <a href="#how">How It Works</a>
            <a href="#stories">Testimonials</a>
            <a href="#faq">FAQ</a>
            <a href="#apply">Apply</a>
          </nav>
          <a className="mini-cta" href="#apply">Book a Free Intro Call</a>
        </header>

        <div className="hero-grid shell">
          <div className="hero-copy">
            <p className="eyebrow">A clearer path into AI</p>
            <h1>Become an<br /><span>AI Training Expert</span></h1>
            <h2>With the Right Coaching and Guidance</h2>
            <p className="intro">Turn your knowledge and professional experience into a meaningful career as an AI trainer. Whether you’re just getting started or looking to level up, we provide the coaching, structure, and real opportunities to help you become a confident, well-paid AI training expert.</p>
            <div className="benefit-chips">
              <span><b>♢</b> No prior AI training<br />experience needed</span>
              <span><b>⌘</b> Step-by-step<br />expert coaching</span>
              <span><b>↗</b> Earn while you<br />build stable income</span>
            </div>
            <div className="hero-actions">
              <a className="primary-button" href="#apply">Apply Now <span>→</span></a>
              <a className="secondary-button" href="#apply">Book a Free Intro Call <span>⌕</span></a>
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
        <article><b>♢</b><span><strong>Guidance for AI</strong><small>training opportunities</small></span></article>
        <article><b>▱</b><span><strong>Remote-friendly</strong><small>opportunities</small></span></article>
        <article><b>●●●</b><span><strong>Community & expert</strong><small>support</small></span></article>
        <article><b>◎</b><span><strong>Career coaching</strong><small>that empowers</small></span></article>
      </section>

      <section className="section process-section shell" id="how">
        <div className="section-heading">
          <span>YOUR NEXT CHAPTER</span>
          <h2>How It Works</h2>
          <p>A simple, supportive process to help you get started.</p>
        </div>
        <div className="process-grid">
          {processSteps.map(([number, icon, title, copy], index) => (
            <article className="process-card" key={title}>
              <span className="step-number">{number}</span>
              <b className={`step-icon hue-${index}`}>{icon}</b>
              <h3>{title}</h3>
              <p>{copy}</p>
              {index < processSteps.length - 1 && <i aria-hidden="true">›</i>}
            </article>
          ))}
        </div>
      </section>

      <section className="section audience-section shell">
        <div className="section-heading compact">
          <span>MADE FOR YOUR EXPERIENCE</span>
          <h2>Who Can Join AI Trainers?</h2>
          <p>Whether you are new to AI training or already working in the field, our coaching helps you turn your professional strengths into more stable income opportunities.</p>
        </div>
        <div className="audience-grid">
          <article className="audience-card new-card">
            <img className="profile-photo" src="/people/priya.jpg" alt="Professional exploring AI training opportunities" />
            <div className="audience-copy">
              <small>START WITH YOUR STRENGTHS</small>
              <h3>Professionals New<br />to AI Training</h3>
              <p>You do <strong>not</strong> need prior AI or AI training experience. If you have a professional background, domain knowledge in a field, or want to work on flexible projects, we’ll become your expert guide.</p>
            </div>
            <div className="check-list"><span>✓ No prior AI experience needed</span><span>✓ Use your profession as a strength</span><span>✓ Coaching to help you get started</span></div>
            <div className="profession-tags"><b>Examples of professions</b><span>⌘ Software</span><span>$ Finance</span><span>✎ Writing</span><span>⚗ Science</span><span>§ Legal</span></div>
          </article>
          <article className="audience-card current-card">
            <img className="profile-photo" src="/people/amira.jpg" alt="AI trainer working in a modern office" />
            <div className="audience-copy">
              <small>GROW WITH A PLAN</small>
              <h3>Current AI Trainers<br />Who Need Support</h3>
              <p>You already work as an AI trainer but are struggling with progression, or don’t have enough time or structure to mentor? We’ll help you simplify your systems, improve your strategies, and earn more stable income without burnout.</p>
            </div>
            <div className="check-list"><span>✓ Already working as an AI trainer</span><span>✓ Struggling to progress consistently</span><span>✓ Need guidance and direction</span></div>
          </article>
        </div>
      </section>

      <section className="section stories-section shell" id="stories">
        <div className="section-heading">
          <span>REAL PEOPLE, REAL MOMENTUM</span>
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
        <p className="representative-note">Candidate names and portraits are representative placeholders for this website concept.</p>
      </section>

      <section className="section faq-section shell" id="faq">
        <div className="section-heading compact"><span>QUESTIONS, ANSWERED</span><h2>Frequently Asked Questions</h2></div>
        <div className="faq-grid">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<span>+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="apply-section shell" id="apply">
        <div className="cta-icon" aria-hidden="true">▣</div>
        <div><h2>Ready to Start Your Journey?</h2><p>Take the first step today. We’re here to guide you every step of the way.</p></div>
        <div className="apply-actions"><a href="mailto:hello@aitrainers.com?subject=AI%20Trainer%20Application">Apply Now <span>→</span></a><a href="mailto:hello@aitrainers.com?subject=Free%20Intro%20Call">Book a Free Intro Call <span>⌕</span></a></div>
        <div className="cta-icon" aria-hidden="true">✓</div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div><Brand /><p>Turning professionals into paid<br />AI training experts.</p></div>
          <div><h3>Quick Links</h3><a href="#top">Home</a><a href="#how">How It Works</a><a href="#stories">Testimonials</a><a href="#apply">Apply</a></div>
          <div><h3>Resources</h3><a href="#faq">FAQ</a><a href="#stories">Success Stories</a><a href="#faq">Candidate Guidelines</a></div>
          <div><h3>Blog</h3><a href="#how">AI Trainer Tips</a><a href="#how">Career Growth</a><a href="#stories">Industry Insights</a></div>
          <div><h3>Connect With Us</h3><div className="social-links"><a href="#top" aria-label="LinkedIn">in</a><a href="#top" aria-label="X">𝕏</a><a href="#top" aria-label="Instagram">◎</a><a href="#top" aria-label="YouTube">▶</a></div></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 AI Trainers. All rights reserved.</span><span>Privacy Policy &nbsp;&nbsp; Terms of Service &nbsp;&nbsp; Contact Us</span></div>
      </footer>
    </main>
  );
}
