/** A work presented like a museum piece: gold (or black) moulding, an inner bead and a cream mat.
    Spans throughout, so it can sit inside a button or link. */
export default function Frame({ src, srcSet, sizes, alt, tone = "gold", mat = true, loading = "lazy", frameRef, imgRef, className = "", children, ...rest }:
  { src: string; srcSet?: string; sizes?: string; alt: string; tone?: "gold" | "black"; mat?: boolean; loading?: "lazy" | "eager"; frameRef?: React.Ref<HTMLSpanElement>; imgRef?: React.Ref<HTMLImageElement> }
  & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span ref={frameRef} className={`lux-frame ${tone === "black" ? "lux-frame--black" : ""} ${mat ? "" : "lux-frame--bare"} ${className}`} {...rest}>
      <span className="lux-frame__mat"><img ref={imgRef} src={src} srcSet={srcSet} sizes={sizes} alt={alt} loading={loading} decoding="async" /></span>
      {children}
    </span>
  );
}
