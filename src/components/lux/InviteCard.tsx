import { ViewTransition, useId } from "react";
import InviteSeal from "./InviteSeal";

export type InviteCardProps = {
  kicker?: React.ReactNode; // small caps at the top ("You're invited")
  title?: React.ReactNode; // the gold-foil line ("Live painting"; a plain string breaks after its first word)
  sub?: React.ReactNode; // under it ("at your wedding")
  lines?: React.ReactNode[]; // details, one per line (the inquiry fills these in as it is answered)
  note?: React.ReactNode; // a small closing line
  sealed?: boolean; // her wax seal pressed onto the card (presses in when it turns true)
  vt?: string; // a view-transition name, so the same card can glide from one page into the next
  className?: string;
  style?: React.CSSProperties;
};

/** The wedding invitation: heavy cream cotton card with a fine gold-foil double rule, letterpress type, a gold-foil title
    and her mark pressed into a burgundy wax seal over its lower edge. One card for the opening (book live painting), the
    live-painting page's first screen and the inquiry form. A 100:140 portrait sized from its width: set --card-w. */
export default function InviteCard({ kicker = "You’re invited", title = "Live painting", sub = "at your wedding", lines, note, sealed = true, vt, className = "", style }: InviteCardProps) {
  const uid = "iv" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const cut = typeof title === "string" ? title.indexOf(" ") : -1;
  const head = cut > 0 && typeof title === "string" ? <>{title.slice(0, cut)}<br />{title.slice(cut + 1)}</> : title;
  const card = (
    <div className={`lx-card ${sealed ? "is-sealed" : ""} ${className}`} style={style}>
      <div className="lx-invite__card">
        <div className="lx-invite__rule lx-invite__rule--outer" />
        <div className="lx-invite__rule lx-invite__rule--inner" />
        <div className="lx-invite__copy">
          {kicker && <p className="lx-invite__kicker">{kicker}</p>}
          <span className="lx-invite__ornament" />
          {head && <p className="lx-invite__title">{head}</p>}
          {sub && <p className="lx-invite__sub">{sub}</p>}
          {!!lines?.length && <ul className="lx-invite__lines">{lines.map((l, i) => <li key={i}>{l}</li>)}</ul>}
          {note && <p className="lx-invite__line">{note}</p>}
        </div>
        <div className="lx-invite__light" />
      </div>
      <InviteSeal uid={uid} />
    </div>
  );
  return vt ? <ViewTransition name={vt} share={{ "invite-open": "invite-morph", default: "none" }} default="none">{card}</ViewTransition> : card;
}
