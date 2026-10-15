"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  imgSrc?: string;
}

export default function BrandLogo({
  size = "md",
  className = "",
  imgSrc = "/logo.png",
}: BrandLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-8 w-8 sm:h-9 sm:w-9",
    lg: "h-9 w-9 sm:h-10 sm:w-10",
  }[size];

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-4 w-4 sm:h-5 sm:w-5",
  }[size];

  return (
    <div
      className={`${sizeClasses} rounded-full bg-[#cf493e] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(207,73,62,0.35)] shrink-0 overflow-hidden relative border border-[#cf493e]/20 ${className}`}
    >
      {!imgFailed ? (
        <img
          src={imgSrc}
          alt="LovePage Logo"
          className="w-full h-full object-cover transition-opacity duration-200"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <Heart className={`${iconSizes} fill-white`} />
      )}
    </div>
  );
}
