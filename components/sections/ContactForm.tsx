import type { ComponentType } from "react";
import type { ContactFormSection, ContactFormVariant } from "@/lib/contentful/types";
import { nunitoSans } from "@/lib/fonts";

const fieldClassName =
  "mt-2 block h-[45px] w-full bg-white px-[17px] text-[15px] text-[#1c3461] placeholder:text-zinc-400 focus:outline-2 focus:outline-[#ffc445]";

const labelClassName = "block text-[15px] font-bold text-white";

// Placeholder options until the real lists are defined.
const RELATIONSHIP_OPTIONS = ["Client", "Family member", "Healthcare professional", "Employee", "Other"];
const RECIPIENT_OPTIONS = ["Client Services", "Careers", "Billing", "Media"];
const SUBJECT_OPTIONS = ["General Inquiry", "Request a Consultation", "Feedback", "Other"];

function Caret() {
  return (
    <svg
      viewBox="0 0 10 6"
      className="pointer-events-none absolute right-5 top-1/2 h-1.5 w-2.5 fill-[#1c3461]"
      aria-hidden
    >
      <path d="M0 0h10L5 6z" />
    </svg>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className={labelClassName}>
      {label}
      {required && " *"}
      <span className="relative mt-2 block">
        <select
          name={name}
          required={required}
          defaultValue={placeholder ? "" : options[0]}
          className={`${fieldClassName} mt-0 appearance-none pl-2.5 pr-12 font-normal`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <Caret />
      </span>
    </label>
  );
}

// Visual stand-in for the reCAPTCHA widget; swap for the real widget when
// submissions are wired up.
function CaptchaPlaceholder() {
  return (
    <div className="flex h-[76px] w-[302px] items-center gap-3 rounded-[3px] border border-[#d3d3d3] bg-[#f9f9f9] pl-3 pr-3 text-sm text-zinc-800 shadow-[0_0_4px_1px_rgba(0,0,0,0.08)]">
      <span className="h-7 w-7 rounded-sm border-2 border-[#c1c1c1] bg-white" aria-hidden />
      <span className="flex-1">I&apos;m not a robot</span>
      <span className="text-[10px] text-zinc-500">reCAPTCHA</span>
    </div>
  );
}

function ContactUsFields({ submitLabel }: Pick<ContactFormSection, "submitLabel">) {
  return (
    <>
      <div className="grid gap-x-[21px] gap-y-6 md:grid-cols-2">
        <div className="grid content-start gap-6">
          <label className={labelClassName}>
            First &amp; Last Name
            <input name="name" autoComplete="name" className={`${fieldClassName} font-normal`} />
          </label>
          <label className={labelClassName}>
            Email *
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={`${fieldClassName} font-normal`}
            />
          </label>
          <label className={labelClassName}>
            Phone Number
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(___) ___-____"
              className={`${fieldClassName} font-normal tracking-[0.2em]`}
            />
          </label>
          <label className={labelClassName}>
            Message
            <textarea
              name="message"
              placeholder="Please type your message here."
              className={`${fieldClassName} h-[167px] py-4 font-normal`}
            />
          </label>
        </div>
        <div className="grid content-start gap-6">
          <SelectField
            label="Relationship to Spectrum"
            name="relationship"
            options={RELATIONSHIP_OPTIONS}
            placeholder="Select"
          />
          <SelectField
            label="Recipient"
            name="recipient"
            options={RECIPIENT_OPTIONS}
            placeholder="Select"
            required
          />
          <SelectField label="Subject" name="subject" options={SUBJECT_OPTIONS} />
        </div>
      </div>
      <div className="mt-6">
        <CaptchaPlaceholder />
      </div>
      <div className="mt-9 flex justify-center">
        <button
          type="submit"
          className="h-12 bg-[#ffc445] px-7 text-[17px] font-bold tracking-wide text-[#1c3461] transition-colors hover:bg-[#ffb81c]"
        >
          {submitLabel}
        </button>
      </div>
    </>
  );
}

// Visual-only newsletter signup: a short blurb with an inline email field.
function SubscribeForm({ heading, description, submitLabel }: ContactFormSection) {
  return (
    <section className={`${nunitoSans.className} bg-white pt-6 text-[#1c3461]`}>
      <div className="mx-auto max-w-[460px] px-4 sm:px-0">
        {heading && (
          <h2 className="text-[15px] font-bold leading-[1.35]">{heading}</h2>
        )}
        {description && (
          <p className="mt-1 text-[15px] leading-[1.35]">{description}</p>
        )}
        <form className="mt-4 flex gap-3.5">
          <input type="hidden" name="formType" value="subscribe" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            aria-label="Email Address"
            placeholder="Email Address"
            className="h-[42px] min-w-0 flex-1 border border-[#1c3461] px-[17px] text-[15px] placeholder:text-zinc-500 focus:outline-2 focus:outline-[#00589b]"
          />
          <button
            type="button"
            className="h-[42px] shrink-0 bg-[#00589b] px-[17px] text-sm tracking-wide text-white transition-colors hover:bg-[#004a83]"
          >
            {submitLabel}
          </button>
        </form>
      </div>
      <hr className="mx-auto mt-10 max-w-[1010px] border-[#dcdcdc]" />
    </section>
  );
}

// Renders the form fields only. Submissions aren't handled yet: point the
// form's action at a route handler or server action to wire it up.
function ContactUsForm({ heading, description, submitLabel }: ContactFormSection) {
  return (
    <section className={`${nunitoSans.className} bg-[#17325e] py-16 text-white`}>
      <div className="mx-auto max-w-[987px] px-6">
        {heading && <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>}
        {description && <p className="mt-4 text-lg leading-7">{description}</p>}
        <form className="mt-12">
          <input type="hidden" name="formType" value="contactUs" />
          <ContactUsFields submitLabel={submitLabel} />
        </form>
      </div>
    </section>
  );
}

// One layout per Contentful formType.
const variants: Record<ContactFormVariant, ComponentType<ContactFormSection>> = {
  contactUs: ContactUsForm,
  subscribe: SubscribeForm,
};

export function ContactForm(props: ContactFormSection) {
  const Variant = variants[props.variant];
  return <Variant {...props} />;
}
