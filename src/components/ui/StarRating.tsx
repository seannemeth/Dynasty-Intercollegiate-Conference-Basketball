interface Props {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
}

const STAR_COLORS: Record<number, string> = {
  5: '#f59e0b',
  4: '#3b82f6',
  3: '#10b981',
  2: '#64748b',
  1: '#475569',
};

export default function StarRating({ value, max = 5, size = 'md' }: Props) {
  const starSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const color = STAR_COLORS[value] || '#64748b';

  return (
    <span className={starSize} style={{ color }}>
      {'★'.repeat(value)}{'☆'.repeat(Math.max(0, max - value))}
    </span>
  );
}
