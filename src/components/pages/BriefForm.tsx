"use client";
/* A commission brief that lands in Jyxdi's real inbox: on submit it posts to the
   store's own Shopify contact form (jyxdi.com/contact) in a new tab, with the
   brief composed into the message. No backend needed. */
import { useRef, useState } from "react";

const KINDS = ["Painting", "Mural", "Digital art", "Installation", "Not sure yet"];
const SIZES = ["16×20″", "24×30″", "30×40″", "48×60″", "Bigger", "Not sure"];
const BUDGETS = ["Under $500", "$500 – $1,500", "$1,500 – $3,000", "$3,000+", "Not sure yet"];

const Chips = ({ name, legend, options, first = false }: { name: string; legend: string; options: string[]; first?: boolean }) => (
  <fieldset className="chips"><legend>{legend}</legend>
    {options.map((o, i) => <label className="chip" key={o}><input type="radio" name={name} value={o} defaultChecked={first && i === 0} /><span>{o}</span></label>)}
  </fieldset>
);

export default function BriefForm() {
  const form = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);
  const onSubmit = () => {
    const f = new FormData(form.current!);
    const lines = [
      "COMMISSION BRIEF (sent from the Jyxdi studio site)",
      `What: ${f.get("kind") || "—"}`,
      `Size: ${f.get("size") || "—"}`,
      `Budget: ${f.get("budget") || "—"}`,
      `Needed by: ${f.get("when") || "—"}`,
      `Reference: ${f.get("ref") || "—"}`,
      "",
      "The idea:",
      String(f.get("idea") || ""),
    ];
    (form.current!.querySelector('[name="contact[Comment]"]') as HTMLInputElement).value = lines.join("\n");
    setSent(true);
  };
  return (
    <form ref={form} className="cm-form mood-cream" aria-label="Commission brief" method="post" action="https://jyxdi.com/contact#ContactForm" target="_blank" acceptCharset="UTF-8" onSubmit={onSubmit}>
      <input type="hidden" name="form_type" value="contact" />
      <input type="hidden" name="utf8" value="✓" />
      <input type="hidden" name="contact[Comment]" />

      <div className="cm-group">
        <h3 className="cm-group__title"><span aria-hidden>i.</span>The idea</h3>
        <Chips name="kind" legend="What would you like?" options={KINDS} first />
        <div className="field"><label htmlFor="idea">Your idea</label><textarea id="idea" name="idea" required placeholder="a deity, a person, a memory, a feeling, the room it will live in…" /></div>
      </div>

      <div className="cm-group">
        <h3 className="cm-group__title"><span aria-hidden>ii.</span>Scale &amp; timing</h3>
        <Chips name="size" legend="Rough size" options={SIZES} />
        <Chips name="budget" legend="Budget" options={BUDGETS} />
        <div className="field-row">
          <div className="field"><label htmlFor="when">Needed by</label><input id="when" name="when" placeholder="a date, or 'no rush'" /></div>
          <div className="field"><label htmlFor="ref">Reference link</label><input id="ref" name="ref" type="url" placeholder="https://…" /></div>
        </div>
      </div>

      <div className="cm-group">
        <h3 className="cm-group__title"><span aria-hidden>iii.</span>About you</h3>
        <div className="field-row">
          <div className="field"><label htmlFor="name">Your name</label><input id="name" name="contact[Name]" autoComplete="name" required /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="contact[email]" type="email" autoComplete="email" required /></div>
        </div>
        <div className="field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="contact[Phone number]" type="tel" autoComplete="tel" /></div>
      </div>

      <button className="btn btn--ink btn--lg btn--block" type="submit"><span>Send the brief</span><i>→</i></button>
      <p className="cm-form__note" aria-live="polite">{sent ? "Your brief opened on jyxdi.com in a new tab. If a quick check appears there, complete it to send." : "Sends through Jyxdi's own contact form on jyxdi.com (it opens in a new tab)."}</p>
    </form>
  );
}
