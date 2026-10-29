import Image from "next/image";
import type { HeroSection } from "@/lib/contentful/types";
import { firaSans } from "@/lib/fonts";

// The heading stays in the markup for screen readers and SEO; the design only
// shows the photo and the supporting text in a callout box.
export function Hero({ heading, text, image }: HeroSection) {
  return (
    <section className="relative bg-white md:h-[500px]">
      <h1 className="sr-only">{heading}</h1>
      {image && (
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority
          sizes="100vw"
          className="h-64 w-full object-cover object-left sm:h-80 md:absolute md:inset-0 md:h-full"
        />
      )}
      {text && (
        <div className="relative px-4 pb-10 pt-12 md:absolute md:left-[52.5%] md:top-[30%] md:w-[29.5%] md:min-w-[420px] md:p-0">
          <FlowerMark className="absolute -top-0 right-10 h-[95px] w-[140px] md:-top-[70px]" />
          <p
            className={`${firaSans.className} bg-[#0062a6] px-8 pb-8 pt-14 text-xl leading-9 text-white md:pb-12 md:pl-8 md:pr-16 md:pt-10 md:text-[28px] md:leading-10`}
          >
            {text}
          </p>
        </div>
      )}
    </section>
  );
}

// The Spectrum petals mark that overlaps the top edge of the callout.
function FlowerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 95" className={className} aria-hidden>
      <path d="M70 72C45 74 12 62 2 40c24-9 56-2 68 32z" fill="#e8392f" />
      <path d="M68 68C54 52 43 26 40 2c22 9 36 38 28 66z" fill="#f6b51e" />
      <path d="M74 68c3-23 15-48 30-56 5 24-8 47-30 56z" fill="#1a9bd7" />
      <path d="M62 80c34 6 62-8 76-32 0 32-38 50-76 32z" fill="#1c3461" />
      <path
        d="M56 84c30 12 64 4 82-16"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
      />
    </svg>
  );
}
