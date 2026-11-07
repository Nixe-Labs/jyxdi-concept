import PageShell from "@/components/chrome/PageShell";

/** Page transitions live in PageShell (a client component, keyed by path). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
