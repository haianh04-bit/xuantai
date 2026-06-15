import { useState } from "react";
import {
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { isEmbedUrl } from "@/lib/videoEmbed";

import productMain from "@/assets/product-main.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const FALLBACK = [
  productMain,
  product4,
  product2,
  product3,
];

type MediaItem = {
  src: string;
};

const getVideoMimeType = (src: string) => {
  const cleanSrc = src
    .split("?")[0]
    .toLowerCase();

  if (cleanSrc.endsWith(".webm"))
    return "video/webm";

  if (cleanSrc.endsWith(".mov"))
    return "video/quicktime";

  if (cleanSrc.endsWith(".ogv"))
    return "video/ogg";

  if (cleanSrc.endsWith(".mkv"))
    return "video/x-matroska";

  if (cleanSrc.endsWith(".m4v"))
    return "video/x-m4v";

  return "video/mp4";
};

interface Props {
  images: string[];
  name: string;
}

const ProductGallery = ({
  images,
  name,
}: Props) => {
  const [active, setActive] = useState(0);

  const media: MediaItem[] = [
    ...(images.length > 0
      ? images
      : FALLBACK
    ).map((src) => ({
      type: "image" as const,
      src,
    })),
  ];

  const current =
    media[Math.min(active, media.length - 1)];

  // next image
  const nextImage = () => {
    setActive((prev) =>
      prev === media.length - 1 ? 0 : prev + 1
    );
  };

  // prev image
  const prevImage = () => {
    setActive((prev) =>
      prev === 0 ? media.length - 1 : prev - 1
    );
  };

  return (
    <div className="space-y-4">

      {/* IMAGE MAIN */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-soft shadow-pop aspect-square max-w-[500px] mx-auto group">

        {/* nút trái */}
        <button
          onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 shadow-md hover:scale-105 transition"
        >
          <ChevronLeft className="w-5 h-5 mx-auto" />
        </button>

        {/* nút phải */}
        <button
          onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 shadow-md hover:scale-105 transition"
        >
          <ChevronRight className="w-5 h-5 mx-auto" />
        </button>

        {/* background blur */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-secondary/40 rounded-full blur-3xl animate-blob" />

        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary/40 rounded-full blur-3xl animate-blob [animation-delay:3s]" />

        <img
          src={current.src}
          alt={`${name} - ảnh ${active + 1}`}
          width={1024}
          height={1024}
          className="relative z-10 w-full h-full object-cover transition-smooth group-hover:scale-105"
        />
      </div>

      {/* THUMBNAILS */}
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-3 max-w-[500px] mx-auto">
          {media.slice(0, 8).map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative overflow-hidden rounded-2xl aspect-square transition-smooth ${active === i
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-95"
                : "opacity-70 hover:opacity-100"
                }`}
            >
              <img
                src={item.src}
                alt={`${name} thumbnail ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;