import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

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
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const isDataOrBlobUrl =
    src.startsWith('data:') || src.startsWith('blob:');

  const handleImageError = () => {
    if (!isDataOrBlobUrl && retryCount < 2) {
      window.setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, 600);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#FEF2F2] text-[#991B1B] p-6 text-center border border-[#FECACA] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Flame className="w-8 h-8 text-[#DC2626] mb-2 opacity-80" />
        <span className="text-xs font-semibold tracking-tight text-[#7F1D1D]">
          {fallbackLabel || alt}
        </span>
        <span className="text-[11px] text-[#991B1B] mt-0.5">
          Emmadios Industrial Limited (EIL)
        </span>
      </div>
    );
  }

  const effectiveSrc =
    !isDataOrBlobUrl && retryCount > 0
      ? `${src}${src.includes('?') ? '&' : '?'}retry=${retryCount}`
      : src;

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

