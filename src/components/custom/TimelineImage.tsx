import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { analysisService } from '@/services/analysisService';

/** Lazily resolves a signed URL for a stored face photo thumbnail. */
export function TimelineImage({ imagePath }: { imagePath: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    analysisService
      .getImageUrl(imagePath)
      .then((u) => active && setUrl(u))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [imagePath]);

  if (failed) {
    return (
      <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <ImageOff className="size-5" />
      </div>
    );
  }

  return (
    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
      {url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <div className="size-full shimmer" />
      )}
    </div>
  );
}
