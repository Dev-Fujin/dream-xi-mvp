"use client";

import { useMemo, useState } from "react";
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

const styleCopy: Record<Style, { label: string; description: string }> = {
  secure: { label: "Defensive", description: "Tiefer Block, stabile Restverteidigung" },
  balanced: { label: "Balanced", description: "Kompakt, flexibel, wenig Risiko" },
  bold: { label: "Offensive", description: "Hohe Außen, mehr Druck, mehr Risiko" },
};

const formations: FormationName[] = ["4-3-3", "4-4-2", "4-2-3-1"];

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
}: {
  slots: Slot[];
  selected: Player | null;
  onSlot: (slot: Slot) => void;
}) {
  const selectedSlotIds = selected ? compatibleSlotIds(selected, slots) : [];

  return (
    <section className="rounded-[2rem] border border-emerald-100/15 bg-emerald-900/30 p-3 shadow-2xl shadow-black/40">
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
              onClick={() => onSlot(slot)}
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
    if (openCount > 1) {
      window.setTimeout(startRoll, 250);
    }
  }

  function autoPick() {
    const best = playerPool.toSorted((a, b) => b.rating - a.rating)[0];
    if (!best) return;
    const slotId = compatibleSlotIds(best, slots)[0];
    if (!slotId) return;
    setSelected(best);
    setTimeout(() => {
      placePlayer(best, slotId);
    }, 80);
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

  const shell = "mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8";

  if (stage === "landing") {
    return (
      <main className={`${shell} justify-center`}>
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/40 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-amber-200/80">World XI Dice · MVP</p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-7xl">Baue deine WM-Elf aus zufälligen Nationen.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/70">
                Wähle zuerst deine Aufstellung, rolle danach Nation + Jahrgang und fülle Slot für Slot dein Dream Team.
              </p>
              <div className="mt-8 grid gap-3 sm:max-w-md sm:grid-cols-2">
                <Button onClick={startSetup}>Start</Button>
                <Button onClick={() => setShowRules(true)} variant="secondary">Erklärung</Button>
              </div>
            </div>
            <div className="rounded-[2rem] border border-amber-200/20 bg-amber-200/10 p-5">
              <div className="grid grid-cols-3 gap-3">
                {["🇧🇷 2002", "🇦🇷 1986", "🇫🇷 1998", "🇩🇪 2014", "🇪🇸 2010", "🇮🇹 2006"].map((item) => (
                  <div className="rounded-2xl bg-black/20 p-4 text-center font-mono text-xl font-black text-amber-100" key={item}>{item}</div>
                ))}
              </div>
              <p className="mt-4 text-sm font-bold uppercase tracking-widest text-emerald-50/60">Roll animation · tactical setup · cup simulation</p>
            </div>
          </div>
        </section>
        {showRules && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <section className="max-w-lg rounded-[2rem] border border-white/10 bg-[#0d241c] p-6 text-white shadow-2xl">
              <h2 className="text-3xl font-black">So funktioniert es</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-emerald-50/75">
                <li>Wähle einmal deine Formation und Spielweise.</li>
                <li>Starte den Roll: Nationen und Jahrgänge laufen als Animation durch.</li>
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
      <main className={`${shell} justify-center`}>
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 sm:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-amber-200/80">Step 1 · Setup</p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Wähle deine Basis.</h1>
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Aufstellung</p>
                <div className="grid gap-2">
                  {formations.map((item) => (
                    <button
                      className={`rounded-2xl border p-4 text-left font-black transition ${shape === item ? "border-amber-300 bg-amber-300 text-emerald-950" : "border-white/10 bg-white/5 text-white"}`}
                      key={item}
                      onClick={() => applySetup(item, style)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Spielweise</p>
                <div className="grid gap-2">
                  {(Object.keys(styleCopy) as Style[]).map((item) => (
                    <button
                      className={`rounded-2xl border p-4 text-left transition ${style === item ? "border-amber-300 bg-amber-300 text-emerald-950" : "border-white/10 bg-white/5 text-white"}`}
                      key={item}
                      onClick={() => applySetup(shape, item)}
                      type="button"
                    >
                      <span className="block font-black uppercase tracking-widest">{styleCopy[item].label}</span>
                      <span className="text-sm opacity-70">{styleCopy[item].description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={() => setStage("ready")}>Setup bestätigen</Button>
            </div>
            <Pitch slots={slots} selected={null} onSlot={() => undefined} />
          </div>
        </section>
      </main>
    );
  }

  if (stage === "ready" || stage === "rolling") {
    const active = stage === "rolling" ? rollingSquad : null;
    return (
      <main className={`${shell} justify-center`}>
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-2xl shadow-black/40 sm:p-10">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-amber-200/80">Step 2 · First roll</p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">{stage === "rolling" ? "Rolling…" : "Bereit für den ersten Roll?"}</h1>
          <div className="mx-auto mt-8 max-w-md rounded-[2rem] border border-amber-200/20 bg-black/20 p-8">
            <div className={`text-7xl font-black transition ${stage === "rolling" ? "animate-pulse" : ""}`}>{active ? active.flag : "🎲"}</div>
            <div className="mt-4 font-mono text-3xl font-black text-amber-200">{active ? `${active.country} ${active.cup}` : `${shape} · ${styleCopy[style].label}`}</div>
          </div>
          <div className="mx-auto mt-8 grid max-w-sm gap-3">
            <Button disabled={stage === "rolling"} onClick={startRoll}>Roll starten</Button>
            <Button disabled={stage === "rolling"} onClick={() => setStage("setup")} variant="secondary">Setup ändern</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={shell}>
      <header className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-200/80">{shape} · {styleCopy[style].label}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-5xl">Pick your player.</h1>
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
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Rolled squad</p>
              <h2 className="mt-1 text-3xl font-black text-white">{draw?.flag} {draw?.country}</h2>
              <p className="font-mono text-amber-200">Cup {draw?.cup} · OVR {draw?.overall}</p>
            </div>
            <Button disabled={isComplete} onClick={startRoll} variant="secondary">Roll again</Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button disabled={!playerPool.length || isComplete} onClick={autoPick} variant="secondary">Auto pick</Button>
            <Button onClick={resetDraft} variant="secondary">New XI</Button>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Pick one eligible player</p>
            <div className="grid max-h-[34rem] gap-2 overflow-y-auto pr-1">
              {playerPool.map((player) => {
                const active = selected?.id === player.id;
                return (
                  <button
                    className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-amber-300 bg-amber-300 text-emerald-950" : "border-white/10 bg-white/[0.06] text-white"}`}
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
              {!playerPool.length && !isComplete && <p className="rounded-2xl bg-white/5 p-4 text-sm text-emerald-50/60">No eligible player in this draw. Roll again.</p>}
            </div>
          </div>
        </aside>

        <div className="order-0 lg:order-none"><Pitch slots={slots} selected={selected} onSlot={addToSlot} /></div>

        <aside className="order-2 rounded-[2rem] border border-white/10 bg-[#0d241c]/90 p-4 lg:order-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100/60">Tournament desk</p>
              <h2 className="mt-1 text-2xl font-black text-white">Box score</h2>
            </div>
            <Button onClick={() => setStage("landing")} variant="ghost">Home</Button>
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

          <div className="mt-4 grid gap-2"><Button disabled={!isComplete} onClick={simulate}>Simulate Cup</Button></div>

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
                      <span className="font-mono text-xl font-black text-amber-200">{match.gf}-{match.ga}</span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-emerald-50/60">vs {match.opponent} · OVR {match.opponentOverall} {match.penalties ? `· ${match.penalties}` : ""}</p>
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
