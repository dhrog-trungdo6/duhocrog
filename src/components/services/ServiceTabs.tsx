"use client";

import { useState } from "react";
import type { VisaType } from "@/types";

interface ServiceTabsProps {
  tabs: VisaType[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function ServiceTabs({ tabs, defaultTab, onTabChange }: ServiceTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-gray-200 hover:text-slate-900"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}