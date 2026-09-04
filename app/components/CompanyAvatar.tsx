export default function CompanyAvatar({
  name,
  logoUrl,
  size = 48,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const letters = name.replace(/[^A-Za-z]/g, '');
  const initial = (letters.slice(0, 1) || name.trim().slice(0, 1) || 'A').toUpperCase();
  if (logoUrl) {
    return (
      <img
        className="opportunity-logo"
        src={logoUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <span className="opportunity-letter-logo" aria-hidden="true" style={{ width: size, height: size }}>
      {initial}
    </span>
  );
}
