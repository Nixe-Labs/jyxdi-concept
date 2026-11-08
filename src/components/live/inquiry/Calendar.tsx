"use client";
/* The event date, picked on an inline month calendar (the WAI-ARIA grid pattern): arrows move a day or a week,
   PageUp/PageDown a month (with Shift, a year), Home/End go to the start or end of the week, Enter or Space picks.
   Days before today can't be picked, nor anything after 2029. Dates are the visitor's local "yyyy-mm-dd". */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()));

/** "Saturday, 14 June 2027" */
export const longDate = (s: string) => { const d = parse(s); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

const todayIso = () => iso(new Date());
const LAST = "2029-12-31"; // Akka takes bookings up to the end of 2029
const still = () => () => {};

export default function Calendar({ id, value, onPick, describedBy }: { id: string; value: string; onPick: (day: string) => void; describedBy?: string }) {
  const today = useSyncExternalStore(still, todayIso, () => ""); // the server doesn't know the visitor's today: the grid draws once it does
  const [cursor, setCursor] = useState(""); // the day that holds keyboard focus
  const keyed = useRef(false); // focus follows the cursor only when the keys moved it
  const grid = useRef<HTMLTableElement>(null);
  const at = cursor || value || today;
  useEffect(() => {
    if (!keyed.current) return;
    keyed.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-day="${at}"]`)?.focus();
  }, [at]);
  if (!today) return <div className="fm-cal" id={id} />;

  const first = today.slice(0, 8) + "01"; // nothing before this month
  const c = parse(at), y = c.getFullYear(), m = c.getMonth();
  const lead = new Date(y, m, 1).getDay(), len = new Date(y, m + 1, 0).getDate();
  const move = (d: Date, byKeys = false) => { const k = iso(d); if (k < first || k > LAST || k === at) return; keyed.current = byKeys; setCursor(k); };
  const pick = (k: string) => { setCursor(k); onPick(k); };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (at >= today) pick(at); return; }
    const to: Record<string, () => Date> = {
      ArrowLeft: () => addDays(c, -1), ArrowRight: () => addDays(c, 1), ArrowUp: () => addDays(c, -7), ArrowDown: () => addDays(c, 7),
      PageUp: () => addMonths(c, e.shiftKey ? -12 : -1), PageDown: () => addMonths(c, e.shiftKey ? 12 : 1),
      Home: () => addDays(c, -c.getDay()), End: () => addDays(c, 6 - c.getDay()),
    };
    if (!to[e.key]) return;
    e.preventDefault();
    move(to[e.key](), true);
  };
  const title = `${id}-month`;

  return (
    <div className="fm-cal" id={id}>
      <div className="fm-cal__head">
        <button type="button" className="fm-cal__nav" aria-label="Previous month" disabled={iso(new Date(y, m, 1)) <= first} onClick={() => move(addMonths(c, -1))}><span aria-hidden>←</span></button>
        <p className="fm-cal__month" id={title} aria-live="polite"><em>{MONTHS[m]}</em> {y}</p>
        <button type="button" className="fm-cal__nav" aria-label="Next month" disabled={iso(new Date(y, m + 1, 1)) > LAST} onClick={() => move(addMonths(c, 1))}><span aria-hidden>→</span></button>
      </div>
      <table ref={grid} className="fm-cal__grid" role="grid" aria-labelledby={title} aria-describedby={describedBy} onKeyDown={onKeyDown}>
        <thead>
          <tr>{DAYS.map((d) => <th key={d} scope="col"><span aria-hidden>{d[0]}</span><span className="sr-only">{d}</span></th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil((lead + len) / 7) }, (_, w) => (
            <tr key={w}>
              {Array.from({ length: 7 }, (_, i) => {
                const n = w * 7 + i - lead + 1;
                if (n < 1 || n > len) return <td key={i} />;
                const k = `${y}-${pad(m + 1)}-${pad(n)}`, past = k < today;
                return (
                  <td key={i} className="fm-day" data-day={k} tabIndex={k === at ? 0 : -1} aria-label={longDate(k)}
                    aria-selected={k === value || undefined} aria-disabled={past || undefined} aria-current={k === today ? "date" : undefined}
                    onClick={past ? undefined : () => pick(k)}>
                    <span>{n}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
