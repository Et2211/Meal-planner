"use client";

import { ChefHat } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface RecipeImageProps {
  src: string | null | undefined;
  alt: string;
  /** Card mode: fixed size, shows chef hat fallback */
  variant?: "card" | "detail";
}

export const RecipeImage = ({ src, alt, variant = "card" }: RecipeImageProps) => {
  const [imgError, setImgError] = useState(false);

  if (variant === "detail") {
    if (!src || imgError) return null;
    return (
      <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-stone-200">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // card variant
  return !src || imgError ? (
    <div className="w-full h-full flex items-center justify-center">
      <ChefHat size={48} className="text-stone-300" />
    </div>
  ) : (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      unoptimized
      onError={() => setImgError(true)}
    />
  );
};
