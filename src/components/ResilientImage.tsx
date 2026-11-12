import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';

/**
 * Normalizes root-relative `/assets/...` paths to relative `assets/...` paths
 * so images resolve properly both at the root domain (`/`) and inside a
 * GitHub Pages repository subfolder (`https://<user>.github.io/<repo>/`).
 */
export function resolveAssetUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith('/assets/')) {
    return src.slice(1); // 'assets/...'
  }
  return src;
}

/**
 * Fallback handler for standalone `<img>` tags (such as the EIL brand logo)
 * when GitHub Pages serves directly from the raw repository root where files
 * live under `public/assets/...` instead of `assets/...`.
 */
export function handleBrandLogoError(
  e: React.SyntheticEvent<HTMLImageElement, Event>
): void {
  const img = e.currentTarget;
  const currentAttr = img.getAttribute('src') || '';
  if (
    currentAttr.startsWith('assets/') &&
    !currentAttr.startsWith('public/assets/')
  ) {
    img.src = `public/${currentAttr}`;
  } else if (currentAttr.startsWith('/assets/')) {
    img.src = `public${currentAttr}`;
  }
}

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  eager?: boolean;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
  eager = false,
}) => {
  const normalizedSrc = resolveAssetUrl(src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usePublicPrefix, setUsePublicPrefix] = useState(false);

  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
    setUsePublicPrefix(false);
  }, [src]);

  const isDataOrBlobUrl =
    normalizedSrc.startsWith('data:') || normalizedSrc.startsWith('blob:');

  const handleImageError = () => {
    if (
      !isDataOrBlobUrl &&
      !usePublicPrefix &&
      normalizedSrc.startsWith('assets/')
    ) {
      setUsePublicPrefix(true);
      return;
    }
    if (!isDataOrBlobUrl && retryCount < 1) {
      window.setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, 400);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !normalizedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#FEF2F2] text-[#991B1B] p-6 text-center border border-[#FECACA] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Truck className="w-8 h-8 text-[#DC2626] mb-2 opacity-80" />
        <span className="text-xs font-semibold tracking-tight text-[#7F1D1D]">
          {fallbackLabel || alt}
        </span>
        <span className="text-[11px] text-[#991B1B] mt-0.5">
          Emmadios Industrial Limited (EIL)
        </span>
      </div>
    );
  }

  const baseCandidate =
    usePublicPrefix && normalizedSrc.startsWith('assets/')
      ? `public/${normalizedSrc}`
      : normalizedSrc;

  const effectiveSrc =
    !isDataOrBlobUrl && retryCount > 0
      ? `${baseCandidate}${baseCandidate.includes('?') ? '&' : '?'}retry=${retryCount}`
      : baseCandidate;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      loading={eager || isDataOrBlobUrl ? 'eager' : 'lazy'}
      decoding="async"
      onError={handleImageError}
      className={className}
    />
  );
};


