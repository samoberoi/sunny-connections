import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhotoCaptureProps {
  bookingId: string;
  photoType: 'before' | 'after';
  userId: string;
  onPhotoUploaded: (url: string) => void;
  existingUrl?: string;
}

export default function PhotoCapture({ bookingId, photoType, userId, onPhotoUploaded, existingUrl }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${bookingId}/${photoType}_${Date.now()}.${ext}`;
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

      setPreview(photoUrl);
      onPhotoUploaded(photoUrl);
      toast.success(`${photoType === 'before' ? 'Before' : 'After'} photo uploaded!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (preview) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden border-2 border-primary/30">
        <img src={preview} alt={`${photoType} photo`} className="w-full h-40 object-cover" />
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="bg-primary text-primary-foreground rounded-full p-1.5">
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
          <button onClick={() => { setPreview(null); }} className="bg-destructive text-destructive-foreground rounded-full p-1.5">
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-foreground/80 text-background text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
          {photoType} Photo ✓
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
      <Camera className="h-8 w-8 text-primary mx-auto mb-2" strokeWidth={1.5} />
      <p className="font-bold text-foreground text-sm mb-1">
        {photoType === 'before' ? '📸 Take Before Photo' : '📸 Take After Photo'}
      </p>
      <p className="text-[11px] text-muted-foreground mb-3">
        {photoType === 'before' ? 'Capture the current state before cleaning' : 'Show the results after cleaning'}
      </p>
      <Button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="rounded-2xl h-10 px-6 font-semibold text-sm">
        {uploading ? 'Uploading...' : 'Take Photo'}
      </Button>
    </motion.div>
  );
}
