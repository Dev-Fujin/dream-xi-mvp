"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  availablePlayers,
  calcStats,
  Campaign,
  compatibleSlotIds,
  FormationName,
  formation,
  Player,
  simulateCampaign,
  Slot,
  Squad,
  squads,
  Style,
} from "@/lib/game";

type Stage = "landing" | "setup" | "ready" | "rolling" | "draft";

const styleCopy: Record<Style, { label: string; short: string; description: string }> = {
  secure: { label: "Defensive", short: "DEF", description: "Tiefer Block, sichere Absicherung" },
  balanced: { label: "Balanced", short: "BAL", description: "Kompakt, flexibel, kontrolliert" },
  bold: { label: "Offensive", short: "OFF", description: "Höhere Außen, mehr Druck" },
};

const formations: FormationName[] = ["4-3-3", "4-4-2", "4-2-3-1"];
const shell = "mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-3 overflow-x-hidden px-3 py-3 sm:gap-4 sm:px-6 sm:py-5 lg:px-8";
const panel = "border border-white/10 bg-[#10241d]/85 shadow-2xl shadow-black/35 backdrop-blur";

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-[#f6c85f] text-[#142018] shadow-[0_6px_0_#9b6b20] active:translate-y-1 active:shadow-[0_2px_0_#9b6b20]",
    secondary: "border border-white/12 bg-white/[0.07] text-[#f8efd3] hover:bg-white/[0.11]",
    ghost: "text-[#f8efd3] underline decoration-[#f6c85f]/70 underline-offset-4",
  };

  return (
    <button
      className={`min-h-12 w-full rounded-2xl px-4 py-3 text-center text-[0.78rem] font-black uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-[#f6c85f] disabled:opacity-40 ${styles[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.24em] text-[#f6c85f]/80">{children}</p>;
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-2 py-2 text-center">
      <div className="truncate font-mono text-xl font-black text-[#f6c85f] sm:text-2xl">{value}</div>
      <div className="truncate text-[0.58rem] font-black uppercase tracking-[0.14em] text-emerald-100/65">{label}</div>
    </div>
  );
}

function pickRandomSquad(excludeId?: string) {
  const pool = squads.filter((squad) => squad.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)] ?? squads[0];
}

function makeSlots(shape: FormationName, style: Style) {
  return formation(style, shape);
}

function Pitch({
  slots,
  selected,
  onSlot,
  compact = false,
  ref,
}: {
  slots: Slot[];
  selected: Player | null;
  onSlot: (slot: Slot) => void;
  compact?: boolean;
  ref?: React.LegacyRef<HTMLDivElement>;
}) {
  const selectedSlotIds = selected ? compatibleSlotIds(selected, slots) : [];

  return (
    <section className={`relative overflow-hidden rounded-[1.75rem] p-2 sm:rounded-[2rem] sm:p-3 ${panel}`} ref={ref}>
      <div className="pointer-events-none absolute inset-x-4 top-3 h-5 rounded-full border border-[#f6c85f]/25" />
      <div
        className={`relative mx-auto w-full overflow-hidden rounded-[1.35rem] border border-emerald-100/20 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.11),transparent_4rem),linear-gradient(180deg,#1f8a58,#0c5035)] ${
          compact ? "aspect-[9/11] min-h-[24rem]" : "aspect-[9/12] min-h-[29rem] sm:min-h-[34rem]"
        }`}
      >
        <div className="absolute inset-3 rounded-[1rem] border-2 border-white/35" />
        {/* Center spot */}
        <div className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-[#f6c85f]" />
        {/* Center circle */}
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
        {/* Penalty boxes */}
        <div className="absolute left-[20%] right-[20%] top-3 h-[16%] rounded-b-3xl border-x-2 border-b-2 border-white/30" />
        <div className="absolute bottom-3 left-[20%] right-[20%] h-[16%] rounded-t-3xl border-x-2 border-t-2 border-white/30" />
        {/* 6-yard box (goal area) inside penalty box */}
        <div className="absolute left-[30%] right-[30%] top-3 h-[6%] rounded-b-3xl border-x-2 border-b-2 border-white/30" />
        <div className="absolute bottom-3 left-[30%] right-[30%] h-[6%] rounded-t-3xl border-x-2 border-t-2 border-white/30" />
        {/* Halfway line */}
        <div className="absolute inset-x-0 top-1/2 border-t-2 border-white/30" />
        <div className="absolute left-1/2 top-3 bottom-3 border-l border-dashed border-white/10" />

        {slots.map((slot) => {
          const canPlace = selectedSlotIds.includes(slot.id);
          return (
            <button
              className={`absolute w-[4.65rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border px-1.5 py-1.5 text-center shadow-xl backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-[#f6c85f] sm:w-24 sm:rounded-2xl sm:p-2 ${
                canPlace
                  ? "scale-105 border-[#f6c85f] bg-[#f6c85f] text-[#142018]"
                  : slot.player
                    ? "border-white/20 bg-[#07130f]/88 text-white"
                    : "border-dashed border-white/35 bg-white/10 text-white/80"
              }`}
              disabled={!slot.player && !canPlace}
              key={slot.id}
              onClick={() => onSlot(slot)}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              type="button"
            >
              <span className="block text-[0.55rem] font-black uppercase tracking-widest opacity-70 sm:text-[0.62rem]">{slot.label}</span>
              <span className="block truncate text-[0.72rem] font-black leading-4 sm:text-sm">{slot.player?.name ?? (canPlace ? "Place" : "Open")}</span>
              {slot.player && <span className="font-mono text-sm font-black text-[#f6c85f] sm:text-lg">{slot.player.rating}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function Game() {
  const [stage, setStage] = useState<Stage>("landing");
  const [showRules, setShowRules] = useState(false);
  const [style, setStyle] = useState<Style>("balanced");
  const [shape, setShape] = useState<FormationName>("4-3-3");
  const [slots, setSlots] = useState<Slot[]>(() => makeSlots("4-3-3", "balanced"));
  const [draw, setDraw] = useState<Squad | null>(null);
  const [rollingSquad, setRollingSquad] = useState<Squad>(squads[0]);
  const [selected, setSelected] = useState<Player | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const celebrationTimeout = useRef<number | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return () => {
      if (celebrationTimeout.current !== null) {
        clearTimeout(celebrationTimeout.current);
        celebrationTimeout.current = null;
      }
    };
  }, []);

  const usedIds = useMemo(() => new Set(slots.flatMap((slot) => (slot.player ? [slot.player.id] : []))), [slots]);
  const openCount = slots.filter((slot) => !slot.player).length;
  const playerPool = useMemo(() => (draw ? availablePlayers(draw, slots, usedIds) : []), [draw, slots, usedIds]);
  const stats = useMemo(() => calcStats(slots), [slots]);
  const isComplete = openCount === 0;

  function applySetup(nextShape = shape, nextStyle = style) {
    setShape(nextShape);
    setStyle(nextStyle);
    setSlots(makeSlots(nextShape, nextStyle));
  }

  function startSetup() {
    applySetup("4-3-3", "balanced");
    setDraw(null);
    setSelected(null);
    setCampaign(null);
    setStage("setup");
  }

  function startRoll() {
    // clear any existing celebration timeout
    if (celebrationTimeout.current !== null) {
      clearTimeout(celebrationTimeout.current);
      celebrationTimeout.current = null;
    }
    setCelebrate(false);
    setStage("rolling");
    setSelected(null);
    setCampaign(null);
    const interval = window.setInterval(() => {
      setRollingSquad(squads[Math.floor(Math.random() * squads.length)] ?? squads[0]);
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(interval);
      const next = pickRandomSquad(draw?.id);
      setRollingSquad(next);
      setDraw(next);
      setStage("draft");
      setCelebrate(true);
      celebrationTimeout.current = window.setTimeout(() => {
        setCelebrate(false);
        celebrationTimeout.current = null;
      }, 800);
    }, 1250);
  }

  function addToSlot(slot: Slot) {
    if (slot.player) {
      setSlots((current) => current.map((item) => (item.id === slot.id ? { ...item, player: undefined } : item)));
      setCampaign(null);
      return;
    }
    if (!selected) return;
    placePlayer(selected, slot.id);
  }

  function placePlayer(player: Player, slotId: string) {
    setSlots((current) => current.map((item) => (item.id === slotId ? { ...item, player } : item)));
    setSelected(null);
    setDraw(null);
    if (openCount > 1) window.setTimeout(startRoll, 250);
  }

  function autoPick() {
    const best = playerPool.toSorted((a, b) => b.rating - a.rating)[0];
    if (!best) return;
    const slotId = compatibleSlotIds(best, slots)[0];
    if (!slotId) return;
    setSelected(best);
    setTimeout(() => placePlayer(best, slotId), 80);
  }

  function resetDraft() {
    setSlots(makeSlots(shape, style));
    setDraw(null);
    setSelected(null);
    setCampaign(null);
    setStage("ready");
  }

  function simulate() {
    setCampaign(simulateCampaign(stats));
  }

  if (stage === "landing") {
    return (
      <main className={`${shell} justify-center`}>
        <section className={`relative overflow-hidden rounded-[2rem] p-4 sm:rounded-[2.5rem] sm:p-10 ${panel}`}>
          <div className="min-w-0">
            <Eyebrow>World XI Dice · MVP</Eyebrow>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.45rem,13vw,5.8rem)] font-black leading-[0.88] tracking-[-0.07em] text-white">
              Baue deine WM-Elf aus dem Zufall.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/72 sm:text-lg">
              Erst Formation wählen. Dann Nation und Jahrgang rollen. Ein Spieler pro Roll — bis dein XI steht.
            </p>
            <div className="mt-7 grid gap-3 sm:max-w-md sm:grid-cols-2">
              <Button onClick={startSetup}>Start</Button>
              <Button onClick={() => setShowRules(true)} variant="secondary">Erklärung</Button>
            </div>
          </div>
        </section>

        {showRules && (
          <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center">
            <section className={`w-full max-w-lg rounded-[1.75rem] p-5 text-white sm:p-6 ${panel}`}>
              <h2 className="text-3xl font-black tracking-tight">So funktioniert es</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-emerald-50/75 sm:text-base">
                <li>Wähle einmal Formation und Spielweise.</li>
                <li>Starte den Roll: Nation und Jahrgang laufen durch.</li>
                <li>Wähle einen passenden Spieler für einen offenen Slot.</li>
                <li>Nach jedem Pick rollt der nächste Kader. Bei 11/11 simulierst du die WM.</li>
              </ol>
              <div className="mt-6"><Button onClick={() => setShowRules(false)}>Verstanden</Button></div>
            </section>
          </div>
        )}
      </main>
    );
  }

  if (stage === "setup") {
    return (
      <main className={`${shell} pb-24 sm:pb-5`}>
        <section className={`min-w-0 rounded-[2rem] p-4 sm:rounded-[2.5rem] sm:p-8 ${panel}`}>
          <Eyebrow>Step 1 · Setup</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,10vw,4rem)] font-black leading-none tracking-[-0.05em] text-white">Wähle deine Basis.</h1>
          <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[0.86fr_1.14fr] lg:gap-6">
            <div className="min-w-0 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-100/60">Aufstellung</p>
                <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
                  {formations.map((item) => (
                    <button
                      className={`min-h-14 min-w-0 rounded-2xl border px-2 py-3 text-center font-mono text-lg font-black tracking-[-0.03em] transition focus:outline-none focus:ring-2 focus:ring-[#f6c85f] ${shape === item ? "border-[#f6c85f] bg-[#f6c85f] text-[#142018]" : "border-white/10 bg-white/[0.06] text-white"}`}
                      key={item}
                      onClick={() => applySetup(item, style)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-100/60">Spielweise</p>
                <div className="grid gap-2">
                  {(Object.keys(styleCopy) as Style[]).map((item) => (
                    <button
                      className={`min-w-0 rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#f6c85f] ${style === item ? "border-[#f6c85f] bg-[#f6c85f] text-[#142018]" : "border-white/10 bg-white/[0.06] text-white"}`}
                      key={item}
                      onClick={() => applySetup(shape, item)}
                      type="button"
                    >
                      <span className="block text-sm font-black uppercase tracking-[0.14em]">{styleCopy[item].label}</span>
                      <span className="mt-0.5 block text-sm leading-5 opacity-75">{styleCopy[item].description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button className="hidden sm:block" onClick={() => setStage("ready")}>Setup bestätigen</Button>
            </div>
            <Pitch slots={slots} selected={null} onSlot={() => undefined} compact />
          </div>
        </section>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07130f]/92 p-3 backdrop-blur sm:hidden">
          <Button onClick={() => setStage("ready")}>Setup bestätigen</Button>
        </div>
      </main>
    );
  }

  if (stage === "ready" || stage === "rolling") {
    const active = stage === "rolling" ? rollingSquad : null;
    return (
      <main className={`${shell} justify-center`}>
        <section className={`rounded-[2rem] p-5 text-center sm:rounded-[2.5rem] sm:p-10 ${panel}`}>
          <Eyebrow>Step 2 · First roll</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,10vw,4rem)] font-black leading-none tracking-[-0.05em] text-white">
            {stage === "rolling" ? "Rolling…" : "Bereit für den ersten Roll?"}
          </h1>
          <div className="mx-auto mt-7 max-w-md overflow-hidden rounded-[2rem] border border-[#f6c85f]/20 bg-black/22 p-5 sm:p-8">
            <div className={`text-7xl font-black transition sm:text-8xl ${stage === "rolling" ? "animate-pulse" : ""}`}>{active ? active.flag : "🎲"}</div>
            <div className="mt-4 break-words font-mono text-2xl font-black text-[#f6c85f] sm:text-3xl">
              {active ? `${active.country} ${active.cup}` : `${shape} · ${styleCopy[style].label}`}
            </div>
          </div>
          <div className="mx-auto mt-7 grid max-w-sm gap-3">
            <Button disabled={stage === "rolling"} onClick={startRoll}>Roll starten</Button>
            <Button disabled={stage === "rolling"} onClick={() => setStage("setup")} variant="secondary">Setup ändern</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className={`${shell} pb-20 lg:pb-5`}>
        <header className={`grid gap-3 rounded-[1.75rem] p-3 sm:p-4 lg:grid-cols-[1fr_22rem] lg:items-center ${panel}`}>
          <div className="min-w-0">
            <Eyebrow>{shape} · {styleCopy[style].label}</Eyebrow>
            <h1 className="mt-1 truncate text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl">Pick your player.</h1>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatPill label="Attack" value={stats.attack || "—"} />
            <StatPill label="Defense" value={stats.defense || "—"} />
            <StatPill label="XI" value={`${11 - openCount}/11`} />
          </div>
        </header>

        <section className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,1.22fr)_minmax(0,0.9fr)] lg:gap-4">
          <aside className={`order-1 min-w-0 rounded-[1.75rem] p-3 sm:p-4 lg:order-none ${panel}`}>
            <div className="grid min-w-0 gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/60">Rolled squad</p>
                <h2 className="mt-1 truncate text-3xl font-black tracking-[-0.04em] text-white">{draw?.flag} {draw?.country}</h2>
                <p className="font-mono text-sm text-[#f6c85f]">Cup {draw?.cup} · OVR {draw?.overall}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button disabled={isComplete} onClick={startRoll} variant="secondary">Roll again</Button>
                <Button onClick={resetDraft} variant="secondary">New XI</Button>
              </div>
              <Button disabled={!playerPool.length || isComplete} onClick={autoPick} variant="secondary">Auto pick</Button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/60">Pick one eligible player</p>
              <div className="grid max-h-[26rem] gap-2 overflow-y-auto pr-1 lg:max-h-[34rem]">
                {playerPool.map((player) => {
                  const active = selected?.id === player.id;
                  return (
                    <button
                      className={`grid min-h-16 min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#f6c85f] ${active ? "border-[#f6c85f] bg-[#f6c85f] text-[#142018]" : "border-white/10 bg-white/[0.06] text-white"}`}
                      key={player.id}
                      onClick={() => {
                      setSelected(active ? null : player);
                      if (!active) {
                        pitchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                      type="button"
                    >
                      <span className="font-mono text-lg font-black">#{player.number}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-black">{player.name}</span>
                        <span className="block truncate text-xs font-bold uppercase tracking-widest opacity-70">{player.positions.join("/")}</span>
                      </span>
                      <span className="rounded-xl bg-black/20 px-2 py-1 font-mono text-lg font-black">{player.rating}</span>
                    </button>
                  );
                })}
                {!playerPool.length && !isComplete && <p className="rounded-2xl bg-white/5 p-4 text-sm text-emerald-50/60">No eligible player in this draw. Roll again.</p>}
              </div>
            </div>
          </aside>

          <div className="order-0 min-w-0 lg:order-none"><Pitch slots={slots} selected={selected} onSlot={addToSlot} ref={pitchRef} /></div>

          <aside className={`order-2 min-w-0 rounded-[1.75rem] p-3 sm:p-4 lg:order-none ${panel}`}>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/60">Tournament desk</p>
                <h2 className="mt-1 truncate text-2xl font-black text-white">Box score</h2>
              </div>
              <Button className="w-auto px-3" onClick={() => setStage("landing")} variant="ghost">Home</Button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <StatPill label="OVR" value={stats.overall || "—"} />
              <StatPill label="Style" value={styleCopy[style].short} />
              <StatPill label="Open" value={openCount} />
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              {slots.map((slot) => (
                <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2 last:border-b-0" key={slot.id}>
                  <span className="font-mono text-sm font-black text-[#f6c85f]">{slot.label}</span>
                  <span className="truncate text-sm font-bold text-white/90">{slot.player?.name ?? "—"}</span>
                  <span className="text-right font-mono text-sm font-black text-white/70">{slot.player?.rating ?? ""}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden lg:grid"><Button disabled={!isComplete} onClick={simulate}>Simulate Cup</Button></div>

            {campaign && (
              <div className="mt-5 rounded-[1.5rem] border border-[#f6c85f]/25 bg-[#f6c85f]/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f6c85f]/80">Result card</p>
                <h3 className="mt-1 text-4xl font-black tracking-[-0.05em] text-white">{campaign.champion ? "Champions" : "Eliminated"}</h3>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <StatPill label="Rec" value={campaign.record} />
                  <StatPill label="GF" value={campaign.gf} />
                  <StatPill label="GA" value={campaign.ga} />
                  <StatPill label="Badge" value={campaign.badge ? "★" : "—"} />
                </div>
                {campaign.badge && <p className="mt-3 rounded-full bg-[#f6c85f] px-3 py-2 text-center text-sm font-black uppercase tracking-widest text-[#142018]">{campaign.badge}</p>}
                <div className="mt-4 space-y-2">
                  {campaign.matches.map((match) => (
                    <div className="rounded-2xl bg-black/20 p-3" key={match.phase}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-white">{match.phase}</span>
                        <span className="font-mono text-xl font-black text-[#f6c85f]">{match.gf}-{match.ga}</span>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-emerald-50/60">vs {match.opponent} · OVR {match.opponentOverall} {match.penalties ? `· ${match.penalties}` : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07130f]/92 p-3 backdrop-blur lg:hidden">
          <Button disabled={!isComplete} onClick={simulate}>{isComplete ? "Simulate Cup" : `${openCount} slots open`}</Button>
        </div>
      </main>
      {celebrate && draw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="text-9xl font-black animate-pulse">
            {draw.flag}
          </div>
        </div>
      )}
    </>
  );
}
