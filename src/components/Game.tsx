"use client";

import { useMemo, useState } from "react";
import {
  availablePlayers,
  calcStats,
  Campaign,
  compatibleSlotIds,
  formation,
  Player,
  simulateCampaign,
  Slot,
  squads,
  Style,
} from "@/lib/game";

const styleCopy: Record<Style, { label: string; description: string }> = {
  secure: { label: "Secure", description: "lower block" },
  balanced: { label: "Balanced", description: "classic 4-3-3" },
  bold: { label: "Bold", description: "higher risk" },
};

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-amber-300 text-emerald-950 shadow-[0_8px_0_#9a6512] active:translate-y-1 active:shadow-[0_4px_0_#9a6512]",
    secondary: "border border-emerald-200/25 bg-white/10 text-emerald-50 hover:bg-white/15",
    ghost: "text-emerald-100 underline decoration-amber-300/60 underline-offset-4",
  };

  return (
    <button
      className={`rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition disabled:opacity-40 ${styles[variant]}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-center">
      <div className="font-mono text-2xl font-black text-amber-200">{value}</div>
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-emerald-100/70">{label}</div>
    </div>
  );
}

function emptySlots(style: Style) {
  return formation(style);
}

function pickRandomSquad(excludeId?: string) {
  const pool = squads.filter((squad) => squad.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)] ?? squads[0];
}

export default function Game() {
  const [style, setStyle] = useState<Style>("balanced");
  const [slots, setSlots] = useState<Slot[]>(() => emptySlots("balanced"));
  const [draw, setDraw] = useState(squads[0]);
  const [selected, setSelected] = useState<Player | null>(null);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  const usedIds = useMemo(() => new Set(slots.flatMap((slot) => (slot.player ? [slot.player.id] : []))), [slots]);
  const openCount = slots.filter((slot) => !slot.player).length;
  const playerPool = useMemo(() => availablePlayers(draw, slots, usedIds), [draw, slots, usedIds]);
  const stats = useMemo(() => calcStats(slots), [slots]);
  const isComplete = openCount === 0;

  function changeStyle(nextStyle: Style) {
    setStyle(nextStyle);
    setSlots((current) => {
      const next = formation(nextStyle);
      return next.map((slot, index) => ({ ...slot, player: current[index]?.player }));
    });
  }

  function roll() {
    setDraw(pickRandomSquad(draw.id));
    setSelected(null);
    setCampaign(null);
    setRollsLeft((value) => Math.max(0, value - 1));
  }

  function addToSlot(slotId: string) {
    if (!selected) return;
    setSlots((current) =>
      current.map((slot) => (slot.id === slotId && !slot.player ? { ...slot, player: selected } : slot)),
    );
    setSelected(null);
    setDraw(pickRandomSquad(draw.id));
  }

  function removePlayer(slotId: string) {
    setSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, player: undefined } : slot)));
    setCampaign(null);
  }

  function reset() {
    setSlots(emptySlots(style));
    setDraw(pickRandomSquad());
    setSelected(null);
    setRollsLeft(3);
    setCampaign(null);
  }

  function autoPick() {
    const best = playerPool.toSorted((a, b) => b.rating - a.rating)[0];
    if (!best) return;
    const slotId = compatibleSlotIds(best, slots)[0];
    if (!slotId) return;
    setSelected(best);
    setTimeout(() => {
      setSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, player: best } : slot)));
      setSelected(null);
      setDraw(pickRandomSquad(draw.id));
    }, 80);
  }

  function simulate() {
    setCampaign(simulateCampaign(stats));
  }

  const selectedSlotIds = selected ? compatibleSlotIds(selected, slots) : [];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-200/80">World XI Dice · MVP</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-5xl">Draft a dream XI. Survive the cup.</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-80">
          <StatPill label="Attack" value={stats.attack || "—"} />
          <StatPill label="Defense" value={stats.defense || "—"} />
          <StatPill label="XI" value={`${11 - openCount}/11`} />
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.25fr)_minmax(0,0.9fr)]">
        <aside className="order-1 rounded-[2rem] border border-white/10 bg-[#0d241c]/90 p-4 lg:order-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Drawn squad</p>
              <h2 className="mt-1 text-3xl font-black text-white">
                {draw.flag} {draw.country}
              </h2>
              <p className="font-mono text-amber-200">Cup {draw.cup} · OVR {draw.overall}</p>
            </div>
            <div className="rounded-2xl bg-amber-300 px-3 py-2 text-center text-emerald-950">
              <div className="font-mono text-2xl font-black">{rollsLeft}</div>
              <div className="text-[0.58rem] font-black uppercase tracking-widest">rerolls</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button disabled={rollsLeft <= 0 || isComplete} onClick={roll} variant="secondary">
              Re-roll
            </Button>
            <Button disabled={!playerPool.length || isComplete} onClick={autoPick} variant="secondary">
              Auto pick
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(Object.keys(styleCopy) as Style[]).map((item) => (
              <button
                className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-widest transition ${
                  style === item
                    ? "border-amber-300 bg-amber-300 text-emerald-950"
                    : "border-white/10 bg-white/5 text-emerald-50"
                }`}
                key={item}
                onClick={() => changeStyle(item)}
                type="button"
              >
                {styleCopy[item].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-emerald-50/60">Style changes player coordinates and tactical weighting stays visible in the pitch.</p>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Pick one eligible player</p>
            <div className="grid max-h-[34rem] gap-2 overflow-y-auto pr-1">
              {playerPool.map((player) => {
                const active = selected?.id === player.id;
                return (
                  <button
                    className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      active ? "border-amber-300 bg-amber-300 text-emerald-950" : "border-white/10 bg-white/[0.06] text-white"
                    }`}
                    key={player.id}
                    onClick={() => setSelected(active ? null : player)}
                    type="button"
                  >
                    <span className="font-mono text-xl font-black">#{player.number}</span>
                    <span>
                      <span className="block font-black">{player.name}</span>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-70">{player.positions.join("/")}</span>
                    </span>
                    <span className="rounded-xl bg-black/20 px-2 py-1 font-mono text-lg font-black">{player.rating}</span>
                  </button>
                );
              })}
              {!playerPool.length && <p className="rounded-2xl bg-white/5 p-4 text-sm text-emerald-50/60">No eligible player in this draw. Re-roll.</p>}
            </div>
          </div>
        </aside>

        <section className="order-0 rounded-[2rem] border border-emerald-100/15 bg-emerald-900/30 p-3 shadow-2xl shadow-black/40 lg:order-none">
          <div className="relative aspect-[9/13] min-h-[34rem] overflow-hidden rounded-[1.5rem] border border-emerald-100/20 bg-[radial-gradient(circle_at_50%_30%,rgba(70,190,130,0.35),transparent_20rem),linear-gradient(180deg,#1b7b4d,#0f5539)] sm:aspect-[10/13]">
            <div className="absolute inset-4 rounded-[1.25rem] border-2 border-white/35" />
            <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
            <div className="absolute left-[8%] right-[8%] top-4 h-[18%] rounded-b-3xl border-x-2 border-b-2 border-white/30" />
            <div className="absolute bottom-4 left-[8%] right-[8%] h-[18%] rounded-t-3xl border-x-2 border-t-2 border-white/30" />
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-white/30" />

            {slots.map((slot) => {
              const canPlace = selectedSlotIds.includes(slot.id);
              return (
                <button
                  className={`absolute w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-2 text-center shadow-xl backdrop-blur transition sm:w-28 ${
                    canPlace
                      ? "scale-105 border-amber-200 bg-amber-200 text-emerald-950"
                      : slot.player
                        ? "border-white/20 bg-[#06130f]/85 text-white"
                        : "border-dashed border-white/35 bg-white/10 text-white/80"
                  }`}
                  disabled={!slot.player && !canPlace}
                  key={slot.id}
                  onClick={() => (slot.player ? removePlayer(slot.id) : addToSlot(slot.id))}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  type="button"
                >
                  <span className="block text-[0.62rem] font-black uppercase tracking-widest opacity-70">{slot.label}</span>
                  <span className="block truncate text-sm font-black">{slot.player?.name ?? (canPlace ? "Place" : "Open")}</span>
                  {slot.player && <span className="font-mono text-lg font-black text-amber-200">{slot.player.rating}</span>}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="order-2 rounded-[2rem] border border-white/10 bg-[#0d241c]/90 p-4 lg:order-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Tournament desk</p>
              <h2 className="mt-1 text-2xl font-black text-white">Box score</h2>
            </div>
            <Button onClick={reset} variant="ghost">
              Reset
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatPill label="OVR" value={stats.overall || "—"} />
            <StatPill label="Style" value={styleCopy[style].label.slice(0, 3)} />
            <StatPill label="Open" value={openCount} />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            {slots.map((slot) => (
              <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2 last:border-b-0" key={slot.id}>
                <span className="font-mono text-sm font-black text-amber-200">{slot.label}</span>
                <span className="truncate text-sm font-bold text-white/90">{slot.player?.name ?? "—"}</span>
                <span className="font-mono text-sm font-black text-white/70">{slot.player?.rating ?? ""}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            <Button disabled={!isComplete} onClick={simulate}>
              Simulate Cup
            </Button>
          </div>

          {campaign && (
            <div className="mt-5 rounded-[1.5rem] border border-amber-200/25 bg-amber-200/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100/80">Result card</p>
              <h3 className="mt-1 text-4xl font-black text-white">{campaign.champion ? "Champions" : "Eliminated"}</h3>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <StatPill label="Rec" value={campaign.record} />
                <StatPill label="GF" value={campaign.gf} />
                <StatPill label="GA" value={campaign.ga} />
                <StatPill label="Badge" value={campaign.badge ? "★" : "—"} />
              </div>
              {campaign.badge && <p className="mt-3 rounded-full bg-amber-300 px-3 py-2 text-center text-sm font-black uppercase tracking-widest text-emerald-950">{campaign.badge}</p>}
              <div className="mt-4 space-y-2">
                {campaign.matches.map((match) => (
                  <div className="rounded-2xl bg-black/20 p-3" key={match.phase}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-white">{match.phase}</span>
                      <span className="font-mono text-xl font-black text-amber-200">
                        {match.gf}-{match.ga}
                      </span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-emerald-50/60">
                      vs {match.opponent} · OVR {match.opponentOverall} {match.penalties ? `· ${match.penalties}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
