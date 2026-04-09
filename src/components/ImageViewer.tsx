import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
}

export default function ImageViewer({ images, currentIndex, open, onOpenChange, onIndexChange }: ImageViewerProps) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95 rounded-2xl overflow-hidden [&>button]:hidden">
        <button onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <X className="h-5 w-5" />
        </button>

        {images.length > 1 && (
          <div className="absolute top-3 left-3 z-50 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <div className="flex items-center justify-center min-h-[60vh] p-4">
          {hasPrev && (
            <button onClick={() => onIndexChange?.(currentIndex - 1)}
              className="absolute left-2 z-50 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <img src={images[currentIndex]} alt="Photo" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          {hasNext && (
            <button onClick={() => onIndexChange?.(currentIndex + 1)}
              className="absolute right-2 z-50 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
