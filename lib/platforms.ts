export const trainingPlatforms: Array<{ name: string; src: string; href: string }> = [
  { name: 'Snorkel', src: '/brands/snorkel-icon.png', href: 'https://snorkel.ai' },
  { name: 'Handshake', src: '/brands/handshake-icon.svg', href: 'https://joinhandshake.com/ai/' },
  { name: 'Outlier', src: '/brands/outlier.svg', href: 'https://outlier.ai/' },
  { name: 'micro1', src: '/brands/micro1.png', href: 'https://www.micro1.ai/experts' },
  { name: 'DataAnnotation', src: '/brands/dataannotation.png', href: 'https://www.dataannotation.tech/' },
];

const PLATFORM_FALLBACK = '/illustrations/platform-fallback.svg';

export function platformLogoSrc(name: string): string {
  const match = trainingPlatforms.find(
    (platform) => platform.name.toLowerCase() === name.trim().toLowerCase(),
  );
  return match?.src ?? PLATFORM_FALLBACK;
}
