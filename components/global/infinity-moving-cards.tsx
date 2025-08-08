'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

export const InfiniteMovingCards = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  items: {
    href: string;
  }[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = useState(false);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      // Set direction
      if (direction === 'left') {
        containerRef.current.style.setProperty(
          '--animation-direction',
          'forwards'
        );
      } else {
        containerRef.current.style.setProperty(
          '--animation-direction',
          'reverse'
        );
      }

      // Set speed
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', '5s');
      } else if (speed === 'normal') {
        containerRef.current.style.setProperty('--animation-duration', '10s');
      } else {
        containerRef.current.style.setProperty('--animation-duration', '20s');
      }

      setStart(true);
    }
  }, [direction, speed]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20 max-w-full overflow-hidden bg-gradient-to-b from-[#0b1338] to-[#101c44] rounded-lg p-6 shadow-xl border border-blue-500 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex min-w-full shrink-0 gap-10 py-4 w-max flex-nowrap bg-gradient-to-b from-[#0b1338] to-[#101c44]',
          start && 'animate-scroll',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {items.map((item) => (
          <div
            key={item.href}
            className="relative w-[200px] h-[200px] flex items-center justify-center rounded-2xl bg-gradient-to-br from-from-[#0b1338] via-gray-800 to-[#101c44] border border-blue-500 shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <Image
              width={200}
              height={200}
              src={item.href}
              alt={item.href}
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </ul>
    </div>
  );
};
