export default function BrandMark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <i />
      <b />
    </span>
  );
}
