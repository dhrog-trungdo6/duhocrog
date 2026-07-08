"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

/** Dual-handle range slider (Radix) — dùng cho bộ lọc học phí SchoolFinder. */
export const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className = "", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={`relative flex w-full touch-none select-none items-center ${className}`}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/25">
      <SliderPrimitive.Range className="absolute h-full bg-accent" />
    </SliderPrimitive.Track>
    {[0, 1].map((i) => (
      <SliderPrimitive.Thumb
        key={i}
        aria-label={i === 0 ? "Học phí tối thiểu" : "Học phí tối đa"}
        className="block h-5 w-5 rounded-full border-2 border-accent bg-white shadow transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-110"
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";
