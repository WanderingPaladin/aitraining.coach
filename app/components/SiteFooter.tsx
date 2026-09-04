import Brand from './Brand';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p>Turning professionals into paid<br />AI training experts.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/#how">How It Works</a>
          <a href="/opportunities">Opportunities</a>
          <a href="/#apply">Book a Free Intro Call</a>
        </div>
        <div>
          <h3>Resources</h3>
          <a href="/#faq">FAQ</a>
          <a href="/stories">Success Stories</a>
          <a href="/#faq">Candidate Guidelines</a>
        </div>
        <div>
          <h3>Blog</h3>
          <a href="/blog">Stories From the Journey</a>
          <a href="/stories">Success Stories</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 AI Trainers. All rights reserved.</span>
      </div>
    </footer>
  );
}
