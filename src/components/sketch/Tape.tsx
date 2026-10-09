/** A taped-in print: white border, a strip or two of masking tape, a slight tilt. */
export default function Print({ src, srcSet, sizes, alt, rotate = 0, tape = ["t"], polaroid, caption, className = "", style, loading = "lazy", children }:
  { src: string; srcSet?: string; sizes?: string; alt: string; rotate?: number; tape?: ("t" | "tl" | "tr" | "bl")[]; polaroid?: boolean; caption?: string; className?: string; style?: React.CSSProperties; loading?: "lazy" | "eager"; children?: React.ReactNode }) {
  return (
    <figure className={`print ${polaroid ? "print--polaroid" : ""} ${className}`} style={{ ["--r" as string]: `${rotate}deg`, margin: 0, ...style }}>
      {tape.map((t) => <span key={t} className={`tape tape--${t}`} aria-hidden />)}
      <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} loading={loading} decoding="async" />
      {caption && <figcaption className="print__cap">{caption}</figcaption>}
      {children}
    </figure>
  );
}
