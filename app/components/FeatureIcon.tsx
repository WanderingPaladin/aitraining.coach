import type { LucideIcon } from 'lucide-react';

export type FeatureIconVariant =
  | 'blue'
  | 'cyan'
  | 'purple'
  | 'dark'
  | 'apply'
  | 'book'
  | 'review'
  | 'move'
  | 'cta';

export interface FeatureIconProps {
  icon: LucideIcon;
  variant?: FeatureIconVariant;
  size?: number;
  tileSize?: number;
  className?: string;
  iconClassName?: string;
  strokeWidth?: number;
}

const variantStyles: Record<FeatureIconVariant, { wrap: string; icon: string }> = {
  blue: {
    wrap: 'border-indigo-100 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm',
    icon: 'text-indigo-600',
  },
  cyan: {
    wrap: 'border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-100 shadow-sm',
    icon: 'text-cyan-600',
  },
  purple: {
    wrap: 'border-violet-100 bg-gradient-to-br from-violet-50 to-purple-100 shadow-sm',
    icon: 'text-violet-600',
  },
  dark: {
    wrap: 'border-[rgba(80,150,255,0.35)] bg-[rgba(255,255,255,0.04)]',
    icon: 'text-[#14C7E5]',
  },
  apply: {
    wrap: 'border-transparent bg-gradient-to-br from-violet-400 to-purple-600 shadow-sm',
    icon: 'text-white',
  },
  book: {
    wrap: 'border-transparent bg-gradient-to-br from-blue-400 to-indigo-600 shadow-sm',
    icon: 'text-white',
  },
  review: {
    wrap: 'border-transparent bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm',
    icon: 'text-white',
  },
  move: {
    wrap: 'border-transparent bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm',
    icon: 'text-white',
  },
  cta: {
    wrap: 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.12)]',
    icon: 'text-white',
  },
};

export default function FeatureIcon({
  icon: Icon,
  variant = 'blue',
  size = 24,
  tileSize = 52,
  className = '',
  iconClassName = '',
  strokeWidth = 2,
}: FeatureIconProps) {
  const styles = variantStyles[variant];
  const radius = tileSize >= 56 ? 17 : tileSize <= 38 ? 10 : 16;

  return (
    <div
      className={`feature-icon inline-flex shrink-0 items-center justify-center border ${styles.wrap} ${className}`}
      style={{ width: tileSize, height: tileSize, borderRadius: radius }}
      aria-hidden="true"
    >
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        className={`${styles.icon} ${iconClassName}`.trim()}
      />
    </div>
  );
}
