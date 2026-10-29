import { Fira_Sans, Nunito_Sans } from "next/font/google";

// Shared brand fonts. Defined once so every component reuses the same files.
export const nunitoSans = Nunito_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const firaSans = Fira_Sans({ subsets: ["latin"], weight: "400" });
