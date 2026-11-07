"use client";
/* The two scenes of the opening's choice screen: book live painting (a wedding invitation on its gold-lined envelope,
   on velvet) and shop the collection (a boutique bag and a framed print). Each leans gently toward a fine pointer. */
import { useEffect, useRef } from "react";
import InviteCard from "@/components/lux/InviteCard";
import InviteEnvelope from "./InviteEnvelope";
import ShopSceneArt from "./ShopSceneArt";
import { attach as leanInvite } from "./inviteMotion";
import { attach as turnShop } from "./shopMotion";

export function InviteScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => leanInvite(ref.current?.parentElement), []);
  return (
    <div ref={ref} className="lx-invite__stage">
      <div className="lx-invite__glow" />
      <div className="lx-invite__group">
        <div className="lx-invite__env"><InviteEnvelope /></div>
        <div className="lx-invite__shadow" />
        <div className="lx-invite__tilt"><InviteCard vt="invite-card" note="An original painting of your day, made in front of your guests." /></div>
      </div>
    </div>
  );
}

export function ShopScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => turnShop(ref.current!.parentElement!), []); // the turntable answers to the whole half
  return <div ref={ref} className="lx-shop__wrap"><ShopSceneArt /></div>;
}
