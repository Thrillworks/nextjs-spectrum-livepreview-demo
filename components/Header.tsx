import Link from "next/link";
import { nunitoSans } from "@/lib/fonts";

// Each href is the Contentful slug of a Page or Article: /<slug>.
const navItems = [
  {
    label: "Sample Article",
    href: "/tips-for-caring-for-loved-ones-living-with-alzheimers-disease",
  },
];

// Visual copy of the Spectrum site header. Nav items link to Contentful-driven
// pages.
export function Header() {
  return (
    <header className={`${nunitoSans.className} bg-white text-[#1b2a4a]`}>
      <div className="relative">
        <div className="mx-auto flex max-w-5xl items-center gap-14 px-6 pb-6 pt-7">
          <Logo />
          <nav className="hidden items-center gap-14 text-base font-bold md:flex">
            {navItems.map(({ label, href }) => (
              <Link key={href} href={href} className="flex items-center gap-1.5">
                {label}
                {label === "Services" && (
                  <svg
                    viewBox="0 0 10 6"
                    className="h-1.5 w-2.5 stroke-current"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M1 1l4 4 4-4" strokeWidth="1.6" />
                  </svg>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-[#f2f2f2] px-6 py-5">
        <p className="bg-[#00589b] py-3.5 text-center text-base font-bold tracking-wide text-white">
          Proudly Canadian since 1977.
        </p>
      </div>
    </header>
  );
}

// Approximation of the Spectrum wordmark: the "t" doubles as a figure with
// coloured petals above it.
function Logo() {
  return (
    <div className="relative shrink-0 select-none text-[44px] font-extrabold leading-none tracking-tight">
      <span>Spec</span>
      <span className="relative">
        t
        <svg
          viewBox="0 0 40 24"
          className="absolute -top-4 left-0 h-6 w-10"
          aria-hidden
        >
          <circle cx="8" cy="16" r="3.5" fill="#1b2a4a" />
          <ellipse
            cx="22"
            cy="13"
            rx="3"
            ry="4.5"
            fill="#f58220"
            transform="rotate(-20 22 13)"
          />
          <ellipse
            cx="29"
            cy="9"
            rx="2.5"
            ry="4"
            fill="#e4232b"
            transform="rotate(10 29 9)"
          />
          <ellipse
            cx="35"
            cy="12"
            rx="2.5"
            ry="4"
            fill="#2f6db5"
            transform="rotate(45 35 12)"
          />
          <ellipse
            cx="29"
            cy="18"
            rx="2.5"
            ry="3.5"
            fill="#f9b233"
            transform="rotate(70 29 18)"
          />
        </svg>
      </span>
      <span>rum</span>
    </div>
  );
}
