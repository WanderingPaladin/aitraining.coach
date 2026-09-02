import { ExternalLink } from 'lucide-react';
import { trainingPlatforms } from '../../lib/platforms';

export default function PayrollPreview() {
  return (
    <div className="product-stage" aria-label="Example AI trainer earnings dashboard">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="payroll-visual-group">
        <div className="payroll-stage">
          <div className="payroll-visual">
            <div className="dashboard">
              <img src="/brands/payroll-overview.png" alt="Snorkel payroll overview dashboard" />
            </div>
            <img className="mascot" src="/brands/snorkel-icon.png" alt="" />
          </div>
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
                aria-label={`${platform.name} (opens in a new tab)`}
                title={platform.name}
                data-platform={platform.name}
              >
                <img src={platform.src} alt="" />
                <span className="platform-card-name">{platform.name}</span>
                <ExternalLink className="platform-card-link-icon" size={12} strokeWidth={2} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
