"use client";

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '100vw',
  fill = false,
  quality = 80
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${fill ? 'h-full w-full' : ''} ${className || ''}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${fill ? 'object-cover' : ''}
        `}
        onLoad={() => setIsLoading(false)}
      />
      
      {/* Placeholder during loading */}
      {isLoading && (
        <div 
          className={`
            absolute inset-0 bg-gray-200 animate-pulse
            ${fill ? 'h-full w-full' : ''}
          `}
          style={!fill && width && height ? { width: `${width}px`, height: `${height}px` } : {}}
        />
      )}
    </div>
  );
} 