import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string | number;
  className?: string;
  onClick?: () => void;
}

export default function BackButton({ to, className = '', onClick }: BackButtonProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (typeof to === 'string') navigate(to);
    else navigate(typeof to === 'number' ? to : -1);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95 ${className}`}
    >
      <ChevronLeft className="h-5 w-5 text-foreground" strokeWidth={1.8} />
    </button>
  );
}
