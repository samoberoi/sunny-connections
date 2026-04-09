import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ImageViewer from '@/components/ImageViewer';

interface PhotoCaptureProps {
  bookingId: string;
  photoType: 'before' | 'after';
  userId: string;
  onPhotoUploaded: (url: string) => void;
  existingUrls?: string[];
  existingUrl?: string;
}

export default function PhotoCapture({ bookingId, photoType, userId, onPhotoUploaded, existingUrls, existingUrl }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<string[]>(() => {
    if (existingUrls && existingUrls.length > 0) return existingUrls;
    if (existingUrl) return [existingUrl];
    return [];
  });
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync with external existingUrls changes
  useEffect(() => {
    if (existingUrls && existingUrls.length > 0) {
      setPhotos(prev => {
        // Merge: keep local uploads + add new ones from DB
        const all = new Set([...prev, ...existingUrls]);
        return Array.from(all);
      });
    } else if (existingUrl && photos.length === 0) {
      setPhotos([existingUrl]);
    }
  }, [existingUrls, existingUrl]);

  const handleFiles = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${bookingId}/${photoType}_${Date.now()}_${i}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('job-photos').upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(path);
        const photoUrl = urlData.publicUrl;

        await supabase.from('job_photos').insert({
          booking_id: bookingId,
          photo_type: photoType,
          photo_url: photoUrl,
          uploaded_by: userId,
        });

        setPhotos(prev => [...prev, photoUrl]);
        onPhotoUploaded(photoUrl);
      }
      toast.success(`${photoType === 'before' ? 'Before' : 'After'} photo${files.length > 1 ? 's' : ''} uploaded!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFiles(files);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (photos.length > 0) {
    return (
      <>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-3 w-3" strokeWidth={2} />
            </div>
            <span className="text-xs font-bold text-foreground uppercase">{photoType} Photos ({photos.length})</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {photos.map((url, i) => (
              <div key={i} className="relative shrink-0 rounded-xl overflow-hidden border-2 border-primary/30 cursor-pointer"
                onClick={() => { setViewerIndex(i); setViewerOpen(true); }}>
                <img src={url} alt={`${photoType} ${i + 1}`} className="w-24 h-24 object-cover" />
                <button onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            ))}
            {/* Add more button */}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 text-primary hover:bg-primary/5 transition-colors">
              <Plus className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[9px] font-bold">{uploading ? 'Uploading...' : 'Add More'}</span>
            </button>
          </div>
        </motion.div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCapture} />
        <ImageViewer images={photos} currentIndex={viewerIndex} open={viewerOpen}
          onOpenChange={setViewerOpen} onIndexChange={setViewerIndex} />
      </>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCapture} />
      <Camera className="h-8 w-8 text-primary mx-auto mb-2" strokeWidth={1.5} />
      <p className="font-bold text-foreground text-sm mb-1">
        {photoType === 'before' ? '📸 Take Before Photos' : '📸 Take After Photos'}
      </p>
      <p className="text-[11px] text-muted-foreground mb-3">
        {photoType === 'before' ? 'Capture the current state before cleaning' : 'Show the results after cleaning'}
      </p>
      <Button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="rounded-2xl h-10 px-6 font-semibold text-sm">
        {uploading ? 'Uploading...' : 'Take Photos'}
      </Button>
    </motion.div>
  );
}
