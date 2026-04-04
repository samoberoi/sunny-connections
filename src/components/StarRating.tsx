import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' };

export default function StarRating({ rating, onRate, size = 'md', readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
        >
          <Star
            className={`${sizes[size]} transition-colors ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/25'
            }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
