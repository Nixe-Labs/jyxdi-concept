import FadeIn from "./FadeIn";

/** The Print Club, not open yet: a framed sheet that holds only the pencil underdrawing, the way a painting starts.
    No price, date or schedule here until Jyxdi sets them. */
export default function PrintClub() {
  return (
    <section className="section c-ed c-pc" data-mood="burgundy" aria-labelledby="c-pc-title">
      <div className="c-ed__grid">
        <FadeIn className="c-ed__copy" stagger={0.1} y={26}>
          <p className="c-kicker">Coming soon</p>
          <h2 id="c-pc-title" className="c-h2">The Print Club,<br /> <em>on the easel.</em></h2>
          <p className="lede">A new print from Jyxdi&apos;s studio, posted to members. The details are still being painted.</p>
          <div><a className="c-link" href="https://www.instagram.com/jyxdi/" target="_blank" rel="noopener">Follow @jyxdi to hear first ↗</a></div>
        </FadeIn>
        <FadeIn as="figure" className="c-ed__media c-pc__media" y={50}>
          <span className="lux-frame">
            <span className="lux-frame__mat">
              <svg className="c-pc__sheet" viewBox="0 0 400 500" role="img" aria-label="A framed sheet with only the first pencil lines of a painting">
                <path pathLength={1} d="M200 0V500" />
                <path pathLength={1} d="M0 250H400" />
                <path pathLength={1} d="M0 0L400 500" />
                <path pathLength={1} d="M400 0L0 500" />
                <circle pathLength={1} cx="200" cy="190" r="118" />
                <circle pathLength={1} cx="200" cy="190" r="52" />
                <path pathLength={1} d="M48 500C60 372 128 318 200 318S340 372 352 500" />
              </svg>
            </span>
          </span>
          <figcaption>Work in progress</figcaption>
        </FadeIn>
      </div>
    </section>
  );
}
