"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  bgColor = "bg-[#101c44]",
  gradientFrom = "from-blue-800",
  gradientTo = "to-[#0b1338]",
}) => {
  return (
    <div
      className={`relative flex flex-col gap-4 w-full bg-gradient-to-br from-[#09091a] via-[#010529] to-[#010419] shadow-md`}
    >
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 p-6 bg-opacity-80 backdrop-blur-md bg-[#101c44] border-b border-[#413f3f] shadow-[0_2px_6px_rgba(0,0,0,0.3)] mt-8 neon-glow">
        <h1 className="text-3xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center font-bold">
          {title}
        </h1>
      </div>

      {/* Main Header */}
      <header
        className={`relative text-center py-16 shadow-lg ${bgColor}`}
      >
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 opacity-20 bg-gradient-to-b ${gradientFrom} via-transparent ${gradientTo}`}
        ></div>
        {/* Subtitle */}
        {subtitle && (
          <p className="text-xl text-gray-300 h-[10px] align-text-top">
            {subtitle}
          </p>
        )}
      </header>
    </div>
  );
};

export default PageHeader;
