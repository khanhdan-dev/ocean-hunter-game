import React, { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute left-full top-1/2 ml-3 w-fit -translate-y-1/2 rounded-md bg-ocean-white px-3 py-2 text-center text-sm font-semibold text-ocean-dark opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {text}
        <div className="absolute -left-1 top-1/2 -ml-1 -translate-y-1/2 border-4 border-ocean-white border-b-transparent border-l-transparent border-t-transparent"></div>
      </div>
    </div>
  );
}
