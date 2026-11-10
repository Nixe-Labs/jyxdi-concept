"use client";
/* The live painting inquiry: three short steps beside an invitation card that writes itself as it is answered.
   It lands in Jyxdi's real inbox the same way the commission brief does: on send it posts to the store's own Shopify
   contact form (jyxdi.com/contact) in a new tab, every answer composed into the message. */
import "@/app/styles/inquiry.css";
import { useEffect, useRef, useState } from "react";
import FadeIn from "@/components/home/FadeIn";
import InviteCard from "@/components/lux/InviteCard";
import { getLenis } from "@/components/chrome/SmoothScroll";
import Calendar, { longDate } from "./inquiry/Calendar";

const EVENTS = ["Wedding", "Reception", "Sangeet / Mehndi / Haldi", "Engagement", "Corporate event", "Gala or fundraiser", "Other"];
const GUESTS = ["Under 100", "100–250", "250–500", "500+"];
const SETTING = ["Indoor", "Outdoor", "Not sure yet"];
const SUBJECTS = ["The couple", "A ceremony moment", "The first dance", "The venue", "Not sure yet"];
const SIZES = ["16×20″", "24×30″", "30×40″", "48×60″", "Bigger", "Not sure"];
const HEARD = ["Instagram", "TikTok", "A wedding planner", "A friend or guest", "Google", "Other"];

// the message Jyxdi receives: one line per answer, in this order
const LINES: [string, string][] = [
  ["Event", "event"], ["Date", "date"], ["Venue", "venue"], ["City and country", "city"], ["Ceremony or culture", "culture"],
  ["Guests", "guests"], ["Start time", "start"], ["Hours of painting", "hours"], ["Indoor or outdoor", "setting"],
  ["Paint", "subject"], ["Canvas size", "size"], ["Budget", "budget"], ["Heard about Jyxdi through", "heard"],
];

const STEPS = [
  { title: "About you", intro: "Who should Jyxdi reply to?" },
  { title: "Your day", intro: "What you’re celebrating, when and where." },
  { title: "The painting", intro: "What you would love on the canvas, and a few last details." },
];
const NUM = ["i.", "ii.", "iii."];
// the answers each step needs, and what to say when one is missing (or doesn't look right yet)
const NEEDS = [["contact[Name]", "contact[email]", "contact[Phone number]"], ["date", "city"], []];
const SAY: Record<string, [string, string?]> = {
  "contact[Name]": ["Please add your name."],
  "contact[email]": ["Please add your email, so Jyxdi can reply.", "That email doesn’t look complete yet."],
  "contact[Phone number]": ["Please add a phone number.", "That number looks a little short."],
  date: ["Please choose your date on the calendar."],
  city: ["Please add the city and country."],
};
const HELP = "Sends through Jyxdi's own contact form on jyxdi.com (it opens in a new tab). Fields marked * are required.";
const AFTER = "Your inquiry opened on jyxdi.com in a new tab. If a quick check appears there, complete it to send.";

// how the card names the occasion (corporate events and galas are "your event": the person writing isn't the host)
const OCCASION: Record<string, string> = { Wedding: "wedding", Reception: "reception", "Sangeet / Mehndi / Haldi": "celebration", Engagement: "engagement", Other: "celebration" };
const OUTSIDE: Record<string, string> = { Indoor: "indoors", Outdoor: "outdoors" };
const clip = (s = "", n = 34) => { const t = s.trim().replace(/\s+/g, " "); return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t; };
const host = (name = "") => { const t = clip(name); return /&|\band\b/i.test(t) ? t : t.split(" ")[0]; }; // "Priya", or "Priya & Arjun"
const clock = (t: string) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`; };

/** Words written onto the card: each new letter arrives in gold and dries to ink. A chosen answer (`write`) is
    written out from left to right; typed words ink each letter as it comes. */
function Ink({ text, write = false }: { text: string; write?: boolean }) {
  return <span className="fm-ink">{[...text].map((ch, i) => <span key={i + ch} style={write ? { animationDelay: `${i * 24}ms` } : undefined}>{ch}</span>)}</span>;
}
const Blank = ({ w }: { w: number }) => <span className="fm-blank" style={{ "--w": w } as React.CSSProperties} />;

function Pills({ name, legend, options, first = false, wide = true }: { name: string; legend: string; options: string[]; first?: boolean; wide?: boolean }) {
  return (
    <fieldset className={`fm-pills${wide ? " fm-wide" : ""}`}>
      <legend>{legend}</legend>
      <div className="fm-pills__set">
        {options.map((o, i) => <label className="fm-pill" key={o}><input type="radio" name={name} value={o} defaultChecked={first && i === 0} /><span>{o}</span></label>)}
      </div>
    </fieldset>
  );
}

function Field({ id, label, err, wide = false, ...input }: { id: string; label: string; err?: string; wide?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`fm-field${wide ? " fm-wide" : ""}`}>
      <label htmlFor={id}>{label}{input.required && <span className="fm-req" aria-hidden> *</span>}</label>
      <span className="fm-input"><input id={id} {...input} aria-invalid={err ? true : undefined} aria-describedby={input.required ? `${id}-err` : undefined} /></span>
      {input.required && <p id={`${id}-err`} className="fm-err" aria-live="polite">{err}</p>}
    </div>
  );
}

export default function Inquiry() {
  const form = useRef<HTMLFormElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const heads = useRef<(HTMLHeadingElement | null)[]>([]);
  const [a, setA] = useState<Record<string, string>>({}); // the answers so far, for the card
  const [date, setDate] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0); // 0–2 the questions, 3 the thank-you
  const [dir, setDir] = useState(0); // the way the last move went (0 until the first: nothing animates on load)
  const [out, setOut] = useState(0); // the step on screen is leaving, that way
  const [sent, setSent] = useState(false);
  const [sealed, setSealed] = useState(false);

  // moving between steps: the step on screen bows out, then the next rises in (at once with reduced motion)
  const moving = useRef<[to: number, dir: number] | null>(null);
  const timer = useRef(0);
  const land = () => {
    clearTimeout(timer.current);
    const m = moving.current;
    moving.current = null;
    setOut(0);
    if (!m) return;
    setDir(m[1]);
    setStep(m[0]);
  };
  const go = (to: number) => {
    if (moving.current) return;
    moving.current = [to, to > step ? 1 : -1];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return land();
    setOut(moving.current[1]);
    timer.current = window.setTimeout(land, 280);
  };
  useEffect(() => land, []); // a move cut short (the page left mid-way) still lands

  // a new step: bring it into view and focus its heading. Where the card sits above the steps (phones, tablets), each
  // step opens on the card with the last step's answers written in; the short thank-you shows the sealed card whole.
  const shown = useRef(0);
  useEffect(() => {
    if (shown.current === step) return;
    shown.current = step;
    const toCard = step === 3 || getComputedStyle(panel.current!).position !== "sticky";
    const el = (toCard ? panel.current : top.current)!;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 80;
    const { top: y, bottom } = el.getBoundingClientRect();
    if (y < nav || (toCard ? bottom > innerHeight : y > innerHeight * 0.45)) {
      const to = scrollY + y - nav - 20; // a number, not the element: Lenis misplaces a sticky panel while the page shrinks under it
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(to, { duration: 1.1 });
      else scrollTo({ top: to, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    heads.current[step]?.focus({ preventScroll: true });
  }, [step]);

  // her seal goes on once the visitor is back from the new tab, so they see it pressed in
  useEffect(() => {
    if (!sent || sealed) return;
    let t = 0;
    const arm = () => { clearTimeout(t); if (!document.hidden) t = window.setTimeout(() => { if (!document.hidden) setSealed(true); }, 650); };
    arm();
    document.addEventListener("visibilitychange", arm);
    return () => { clearTimeout(t); document.removeEventListener("visibilitychange", arm); };
  }, [sent, sealed]);

  const problem = (el: HTMLInputElement | null) => {
    const say = el && SAY[el.name];
    if (!say) return "";
    return !el.value.trim() ? say[0] : el.checkValidity() ? "" : say[1] ?? "";
  };
  const check = (s: number) => {
    const f = form.current!;
    const found = Object.fromEntries(NEEDS[s].map((n) => [n, problem(f.elements.namedItem(n) as HTMLInputElement)]));
    setErr((e) => ({ ...e, ...found }));
    const bad = NEEDS[s].find((n) => found[n]);
    if (bad) (bad === "date" ? f.querySelector<HTMLElement>('.fm-day[tabindex="0"]') : (f.elements.namedItem(bad) as HTMLElement))?.focus();
    return !bad;
  };
  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    const t = e.target as HTMLInputElement;
    if (!t.name) return;
    setA((s) => ({ ...s, [t.name]: t.value }));
    if (err[t.name]) setErr((s) => ({ ...s, [t.name]: problem(t) }));
  };
  const pickDate = (d: string) => { setDate(d); setErr((e) => ({ ...e, date: "" })); };

  // Next and Send are the same button, so Enter moves on; only the last step really sends
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (moving.current || step > 2 || !check(step)) return e.preventDefault();
    if (step < 2) { e.preventDefault(); return go(step + 1); }
    const f = new FormData(form.current!);
    const v = (k: string) => String(f.get(k) ?? "").trim() || "—";
    const other = String(f.get("event_other") ?? "").trim(); // only there while "Other" is chosen
    const val = (k: string) => (k === "event" && other ? `Other: ${other}` : v(k));
    const body = ["LIVE PAINTING INQUIRY (sent from the Jyxdi studio site)", "", ...LINES.map(([l, k]) => `${l}: ${val(k)}`), "", "Anything else:", v("notes")];
    (form.current!.querySelector('[name="contact[Comment]"]') as HTMLInputElement).value = body.join("\n");
    setSent(true);
    go(3);
  };
  const edit = () => { setSent(false); setSealed(false); go(2); };

  // the card, written from the answers so far
  const who = host(a["contact[Name]"]);
  const typed = a.event === "Other" ? clip(a.event_other, 26) : ""; // "Other": the card writes what they type
  const occasion = typed || OCCASION[a.event ?? "Wedding"];
  const occ = typed ? <Ink text={typed} /> : <Ink key={occasion} text={occasion} write />;
  const sub = !occasion ? <>at your <Ink key="event" text="event" write /></>
    : who ? <>for <Ink text={who} />’s {occ}</>
    : <>at your {occ}</>;
  const venue = clip(a.venue), city = clip(a.city);
  const subject = a.subject && a.subject !== "Not sure yet" ? a.subject : "";
  const size = a.size === "Bigger" ? "a larger canvas" : a.size && a.size !== "Not sure" ? `a ${a.size} canvas` : "";
  const lines = [
    date ? <><Ink key={date} text={longDate(date)} write />{a.start && <>{" · "}<Ink key={a.start} text={clock(a.start)} write /></>}</> : <Blank w={44} />,
    venue || city ? <><Ink text={venue} />{venue && city && ", "}<Ink text={city} /></> : <Blank w={52} />,
    a.guests || OUTSIDE[a.setting] ? <>{a.guests && <Ink key={a.guests} text={`${a.guests} guests`} write />}{a.guests && OUTSIDE[a.setting] && " · "}{OUTSIDE[a.setting] && <Ink key={a.setting} text={OUTSIDE[a.setting]} write />}</> : <Blank w={34} />,
    subject || size ? <>{subject && <Ink key={subject} text={subject} write />}{subject ? size && ", on " : "On "}{size && <Ink key={size} text={size} write />}</> : <Blank w={46} />,
  ];

  const head = (i: number) => (
    <div className="fm-step__head">
      <h3 className="fm-step__title" tabIndex={-1} ref={(el) => { heads.current[i] = el; }}>
        <span className="sr-only">Step {i + 1} of 3: </span><span className="fm-step__n" aria-hidden>{NUM[i]}</span>{STEPS[i].title}
      </h3>
      <p className="fm-step__intro">{STEPS[i].intro}</p>
    </div>
  );

  return (
    <section id="inquire" className="lp-ask section" data-mood="cream" aria-labelledby="lp-inq-title">
      <div className="lp-ask__grid">
        <div className="lp-ask__head">
          <p className="c-kicker">Live painting inquiry</p>
          <h2 id="lp-inq-title" className="c-h2">Check your <em>date.</em></h2>
          <p className="lede">Jyxdi takes a limited number of weddings each season, and is now booking 2027. Tell her about your celebration: when and where it is, and what you would love her to paint.</p>
        </div>

        <form ref={form} className="fm" aria-label="Live painting inquiry" method="post" action="https://jyxdi.com/contact#ContactForm" target="_blank" acceptCharset="UTF-8" noValidate onSubmit={onSubmit} onChange={onChange}>
          <input type="hidden" name="form_type" value="contact" />
          <input type="hidden" name="utf8" value="✓" />
          <input type="hidden" name="contact[Comment]" />

          <div className="fm-progress" ref={top}>
            <p className="fm-progress__count" aria-hidden>{step < 3 ? <>Step <b>{step + 1}</b> of 3</> : "Thank you"}</p>
            <ol aria-label="Steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className={i < step ? "is-done" : i === step ? "is-on" : undefined} aria-current={i === step ? "step" : undefined}>
                  {s.title}{i < step && <span className="sr-only"> (done)</span>}
                </li>
              ))}
            </ol>
          </div>

          <div className="fm-stage" data-dir={dir || undefined} data-out={out || undefined}>
            <div className="fm-step" hidden={step !== 0}>
              {head(0)}
              <Field id="lp-name" name="contact[Name]" label="Your name" autoComplete="name" required wide err={err["contact[Name]"]} />
              <Field id="lp-email" name="contact[email]" label="Email" type="email" autoComplete="email" required pattern={"[^@\\s]+@[^@\\s]+\\.[^@\\s]+"} err={err["contact[email]"]} />
              <Field id="lp-phone" name="contact[Phone number]" label="Phone" type="tel" autoComplete="tel" required pattern={"(?:\\D*\\d){6,}\\D*"} err={err["contact[Phone number]"]} />
            </div>

            <div className="fm-step" hidden={step !== 1}>
              {head(1)}
              <Pills name="event" legend="What are you celebrating?" options={EVENTS} first />
              {a.event === "Other" && <Field id="lp-event-other" name="event_other" label="Tell Jyxdi what it is" placeholder="e.g. an anniversary or a baby shower" defaultValue={a.event_other} wide />}
              <div className="fm-when fm-wide">
                <fieldset className="fm-date">
                  <legend>The date<span className="fm-req" aria-hidden> *</span><span className="sr-only"> (required)</span></legend>
                  <Calendar id="lp-date" value={date} onPick={pickDate} describedBy="lp-date-err" />
                  <input type="hidden" name="date" value={date ? longDate(date) : ""} />
                  <p id="lp-date-err" className="fm-err" aria-live="polite">{err.date}</p>
                </fieldset>
                <div className="fm-when__side">
                  <div className="fm-chosen" aria-live="polite">
                    <p className="fm-label">Your date</p>
                    <p className="fm-chosen__day">{date ? longDate(date).replace(", ", ",\n") : <i>Not chosen yet</i>}</p>
                  </div>
                  <Field id="lp-start" name="start" label="Start time" type="time" />
                  <Field id="lp-hours" name="hours" label="Hours of painting" placeholder="Your best guess" />
                  <p className="fm-note">Not fixed yet? Choose the likeliest day and mention it at the end.</p>
                </div>
              </div>
              <Field id="lp-venue" name="venue" label="Venue name" />
              <Field id="lp-city" name="city" label="City and country" autoComplete="address-level2" required err={err.city} />
              <Field id="lp-culture" name="culture" label="Ceremony or culture (optional)" placeholder="e.g. Hindu, West Indian, fusion" wide />
              <Pills name="guests" legend="Guest count" options={GUESTS} wide={false} />
              <Pills name="setting" legend="Indoor or outdoor" options={SETTING} wide={false} />
            </div>

            <div className="fm-step" hidden={step !== 2}>
              {head(2)}
              <Pills name="subject" legend="What to paint" options={SUBJECTS} />
              <Pills name="size" legend="Canvas size" options={SIZES} />
              <Field id="lp-budget" name="budget" label="Budget (optional)" />
              <Pills name="heard" legend="How did you hear about Jyxdi?" options={HEARD} />
              <div className="fm-field fm-wide"><label htmlFor="lp-notes">Anything else</label><textarea id="lp-notes" name="notes" placeholder="The schedule, the moment you'd love captured, colours, anything" /></div>
            </div>

            <div className="fm-step fm-done" hidden={step !== 3}>
              <div className="fm-step__head">
                <h3 className="fm-step__title" tabIndex={-1} ref={(el) => { heads.current[3] = el; }}>Thank you{who && `, ${who}`}.</h3>
                <p className="fm-step__intro">Your invitation is sealed with her mark.</p>
              </div>
              <button type="button" className="btn btn--line fm-edit" onClick={edit}><i aria-hidden>←</i><span>Edit my answers</span></button>
            </div>

            <div className="fm-nav" hidden={step === 3}>
              {step > 0 && <button type="button" className="fm-back" onClick={() => go(step - 1)}><i aria-hidden>←</i> Back</button>}
              <button className="btn btn--ink btn--lg fm-next" type="submit">
                <span>{step < 2 ? <>Next<span className="fm-next__to">: {STEPS[step + 1].title}</span></> : "Send my inquiry"}</span><i aria-hidden>→</i>
              </button>
            </div>
            <p className="fm-help" aria-live="polite">{sent ? AFTER : HELP}</p>
          </div>
          <p className="fm-mail">Prefer email? <a href="mailto:artbyjyxdi@gmail.com">artbyjyxdi@gmail.com</a></p>
        </form>

        <aside ref={panel} className="fm-panel mood-burgundy" aria-label="Your invitation">
          <FadeIn className="fm-card" y={46} rotate={-2.5} aria-hidden>
            <InviteCard sub={sub} lines={lines} note="An original painting of your day, made in front of your guests." sealed={sealed} />
          </FadeIn>
          <div className="fm-panel__cap">
            <p className="c-kicker">Your invitation</p>
            <p>{sealed ? "Sealed with her mark." : "It writes itself as you answer."}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
