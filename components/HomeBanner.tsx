"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type BannerImage = {
  id: string;
  image_url: string;
  link_url: string | null;
};

const SWIPE_THRESHOLD = 40;

export default function HomeBanner({ images }: { images: BannerImage[] }) {
  const [index, setIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const wasDragging = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length, index]);

  if (images.length === 0) return null;

  const goToNext = () => setIndex((i) => (i + 1) % images.length);
  const goToPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (images.length <= 1) return;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  };

  const handlePointerUp = () => {
    if (dragStartX.current === null) return;
    if (dragDeltaX.current > SWIPE_THRESHOLD) goToPrev();
    else if (dragDeltaX.current < -SWIPE_THRESHOLD) goToNext();
    // Suppress the click that follows a real drag, so swiping over a
    // linked slide doesn't accidentally navigate away.
    wasDragging.current = Math.abs(dragDeltaX.current) > 10;
    dragStartX.current = null;
    dragDeltaX.current = 0;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (wasDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDragging.current = false;
    }
  };

  return (
    <section className="py-8 md:py-12 bg-cream">
      <div className="max-w-wrap mx-auto px-5 md:px-8">
        <div
          className="relative w-full aspect-video md:aspect-[3/1] rounded-2xl md:rounded-3xl overflow-hidden shadow-card bg-cream-deep/30 cursor-grab active:cursor-grabbing touch-pan-y select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClickCapture={handleClickCapture}
        >
          {images.map((img, i) => {
            const isCurrent = i === index;
            const slideClass = `absolute inset-0 block transition-opacity duration-700 ease-in-out ${
              isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`;
            const content = (
              <Image
                src={img.image_url}
                alt={`Banner ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 1400px"
                className="object-cover"
                priority={i === 0}
              />
            );

            return img.link_url ? (
              <Link key={img.id} href={img.link_url} className={slideClass}>
                {content}
              </Link>
            ) : (
              <div key={img.id} className={slideClass}>
                {content}
              </div>
            );
          })}

          {images.length > 1 && (
            <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to banner slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
