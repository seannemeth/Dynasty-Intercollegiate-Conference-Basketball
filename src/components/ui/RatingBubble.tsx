interface Props {
  value: number;
  size?: 'sm' | 'md';
}

export default function RatingBubble({ value, size = 'md' }: Props) {
  const cls = value >= 88 ? 'rating-90' : value >= 78 ? 'rating-80' : value >= 68 ? 'rating-70' : 'rating-60';
  const sz = size === 'sm' ? 'w-8 h-6 text-xs' : 'w-9 h-7 text-xs';
  return (
    <span className={`rating-bubble ${cls} ${sz}`}>{value}</span>
  );
}
