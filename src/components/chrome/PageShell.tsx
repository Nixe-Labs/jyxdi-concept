"use client";
import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/** Every page change: the old page bows out and the new one rises in (lux.css). Keyed by path, so moving between
    two pages of the same route (one artwork to another) remounts it and animates too. */
export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="lx-page-in" exit="lx-page-out" default="none">
      <div className="lx-page">{children}</div>
    </ViewTransition>
  );
}
