import Brand from './Brand';
import { Linkedin } from './FeatureIcon';

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
          <a href="/#stories">Testimonials</a>
          <a href="/#apply">Apply</a>
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
        <div>
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://www.linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <Linkedin size={14} strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 AI Trainers. All rights reserved.</span>
        <span>Privacy Policy &nbsp;&nbsp; Terms of Service &nbsp;&nbsp; Contact Us</span>
      </div>
    </footer>
  );
}
