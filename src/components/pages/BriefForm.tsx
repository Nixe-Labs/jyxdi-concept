"use client";
/* A commission brief that lands in Jyxdi's real inbox: on submit it posts to the
   store's own Shopify contact form (jyxdi.com/contact) in a new tab, with the
   brief composed into the message. No backend needed. */
import { useRef, useState } from "react";

const KINDS = ["Painting", "Installation", "Not sure yet"];
const SIZES = ["16×20″", "24×30″", "30×40″", "48×60″", "Bigger", "Not sure"];
const BUDGETS = ["Under $500", "$500 – $1,500", "$1,500 – $3,000", "$3,000+", "Not sure yet"];

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
    <form ref={form} className="brief__form paper-card" method="post" action="https://jyxdi.com/contact#ContactForm" target="_blank" acceptCharset="UTF-8" onSubmit={onSubmit}>
      <input type="hidden" name="form_type" value="contact" />
      <input type="hidden" name="utf8" value="✓" />
      <input type="hidden" name="contact[Comment]" />
      <p className="note m-0 mb-4">tell Jyxdi what you see ✎</p>

      <fieldset className="chips"><legend className="field">What would you like?</legend>
        {KINDS.map((k, i) => <label className="chip" key={k}><input type="radio" name="kind" value={k} defaultChecked={i === 0} /><span>{k}</span></label>)}
      </fieldset>
      <div className="field"><label htmlFor="idea">Your idea</label><textarea id="idea" name="idea" required placeholder="a deity, a person, a memory, a feeling, the room it will live in…" /></div>
      <fieldset className="chips"><legend className="field">Rough size</legend>
        {SIZES.map((s) => <label className="chip" key={s}><input type="radio" name="size" value={s} /><span>{s}</span></label>)}
      </fieldset>
      <fieldset className="chips"><legend className="field">Budget</legend>
        {BUDGETS.map((s) => <label className="chip" key={s}><input type="radio" name="budget" value={s} /><span>{s}</span></label>)}
      </fieldset>
      <div className="field-row">
        <div className="field"><label htmlFor="when">Needed by</label><input id="when" name="when" placeholder="a date, or 'no rush'" /></div>
        <div className="field"><label htmlFor="ref">Reference link</label><input id="ref" name="ref" type="url" placeholder="https://…" /></div>
      </div>
      <div className="field-row">
        <div className="field"><label htmlFor="name">Your name</label><input id="name" name="contact[Name]" autoComplete="name" required /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="contact[email]" type="email" autoComplete="email" required /></div>
      </div>
      <div className="field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="contact[Phone number]" type="tel" autoComplete="tel" /></div>
      <button className="btn btn--ink btn--lg btn--block mt-2" type="submit"><span>Send the brief</span><i>→</i></button>
      <p className="mt-3 mb-0 text-[12px] text-graphite">{sent ? "Your brief opened on jyxdi.com in a new tab. If a quick check appears there, complete it to send." : "Sends through Jyxdi's own contact form on jyxdi.com (it opens in a new tab)."}</p>
    </form>
  );
}
