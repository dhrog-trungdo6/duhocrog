"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/types";

interface FaqAccordionProps {
  items: FAQItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-sm"
        >
          <button
            type="button"
            onClick={() => toggle(idx)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            aria-expanded={openIndex === idx}
          >
            <span className="pr-4 text-sm font-semibold text-navy">
              {item.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${
                openIndex === idx ? "rotate-180 text-primary" : ""
              }`}
              aria-hidden
            />
          </button>
          {openIndex === idx && (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-sm leading-relaxed text-slate-600">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}