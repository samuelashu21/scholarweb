interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, count, size = 'md' }: StarRatingProps) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <div className={`flex items-center gap-1 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
      {count !== undefined && (
        <span className="text-gray-500 text-sm ml-1">({count})</span>
      )}
    </div>
  );
}
