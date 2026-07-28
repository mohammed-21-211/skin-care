import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/hooks/useLanguage';

interface CameraCaptureProps {
  /** Receives the captured photo as a JPEG File. */
  onCapture: (file: File) => void;
  onClose: () => void;
}

/**
 * Live camera modal. Opens the device camera via getUserMedia (works on
 * desktop + mobile over HTTPS/localhost), lets the user snap a still, and
 * hands back a JPEG File ready for analysis. The stream is always stopped on
 * close/unmount so the camera light turns off.
 */
export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('analyzer.cameraTitle')}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="font-display font-semibold">{t('analyzer.cameraTitle')}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.cancel')}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative aspect-square bg-black">
          {error ? (
            <p className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
              {t('analyzer.cameraError')}
            </p>
          ) : (
            <>
              {/* Mirror the preview for a natural selfie view. */}
              <video
                ref={videoRef}
                playsInline
                muted
                className="size-full -scale-x-100 object-cover"
              />
              {!ready && (
                <div className="absolute inset-0 grid place-items-center">
                  <Spinner className="size-8 text-white" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 p-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" onClick={capture} disabled={!ready || error}>
            <Camera />
            {t('analyzer.captureButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
