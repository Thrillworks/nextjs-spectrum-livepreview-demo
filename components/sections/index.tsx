import type { ComponentType } from "react";
import type { Section } from "@/lib/contentful/types";
import { ContactForm } from "./ContactForm";
import { Hero } from "./Hero";
import { MediaCopy } from "./MediaCopy";
import { Unsupported } from "./Unsupported";

// Maps each section type to the component that renders it. To add a new
// component: add its skeleton + props in lib/contentful/types.ts, map it in
// lib/contentful/mappers.ts, then register it here.
const sectionComponents: {
  [K in Section["type"]]: ComponentType<Extract<Section, { type: K }>>;
} = {
  hero: Hero,
  mediaCopy: MediaCopy,
  contactForm: ContactForm,
  unsupported: Unsupported,
};

export function Sections({ sections }: { sections: Section[] }) {
  return sections.map((section) => {
    const Component = sectionComponents[section.type] as ComponentType<Section>;
    return <Component key={section.id} {...section} />;
  });
}
