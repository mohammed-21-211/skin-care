import { useRef, useState } from 'react';
import { Camera, ImagePlus, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CameraCapture } from './CameraCapture';
import { useLanguage } from '@/hooks/useLanguage';
import { RULES } from '@/config/constants';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  disabled?: boolean;
  analyzing?: boolean;
  onAnalyze: (file: File) => void;
}

/** Drag-and-drop / click image picker with a live preview, then "Analyze". */
export function ImageUploader({ disabled, analyzing, onAnalyze }: ImageUploaderProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const pick = (f: File | null | undefined) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clear = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'relative grid min-h-[260px] place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/40',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="preview"
              className="max-h-[280px] rounded-xl object-cover shadow-md"
            />
            <button
              type="button"
              onClick={clear}
              className="absolute -top-3 -end-3 grid size-8 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
              aria-label="remove"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <UploadCloud className="size-7" />
            </span>
            <p className="font-medium text-foreground">{t('analyzer.uploadPrompt')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                <ImagePlus />
                {t('analyzer.uploadButton')}
              </Button>
              <Button type="button" onClick={() => setCameraOpen(true)}>
                <Camera />
                {t('analyzer.cameraButton')}
              </Button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={RULES.ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      {file && (
        <Button
          className="w-full"
          size="lg"
          disabled={disabled || analyzing}
          onClick={() => onAnalyze(file)}
        >
          {analyzing ? (
            <>
              <Spinner className="text-primary-foreground" />
              {t('analyzer.analyzing')}
            </>
          ) : (
            t('analyzer.analyzeButton')
          )}
        </Button>
      )}

      {cameraOpen && (
        <CameraCapture
          onCapture={(f) => {
            pick(f);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
