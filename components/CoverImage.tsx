"use client";

import { useState } from "react";

export default function CoverImage({
  src,
  alt,
  className = "",
  fallbackClassName = "",
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-paper-200 text-3xl ${fallbackClassName || className}`}
      >
        🎬
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
