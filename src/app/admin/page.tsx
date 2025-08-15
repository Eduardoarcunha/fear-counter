"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type FearState = { value: number; max: number };

async function apiSet(body: any): Promise<FearState> {
    const r = await fetch("/api/fear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const txt = await r.text();
    const d = txt ? JSON.parse(txt) : {};
    return { value: d.value ?? 0, max: d.max ?? 15 };
}

export default function AdminPage() {
    const [state, setState] = useState<FearState>({ value: 0, max: 15 });
    const [setTo, setSetTo] = useState<number>(0);
    const [busy, setBusy] = useState(false);
    const intensity = useMemo(
        () => Math.max(0, Math.min(1, state.max ? state.value / state.max : 0)),
        [state.value, state.max]
    );

    // initial fetch
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/fear", { cache: "no-store" });
                const txt = await r.text();
                const d = txt ? JSON.parse(txt) : {};
                const next = { value: Number(d.value) || 0, max: Number(d.max) || 15 };
                setState(next);
                setSetTo(next.value);
            } catch { }
        })();
    }, []);

    // helpers
    const doInc = useCallback(async () => {
        try {
            setBusy(true);
            setState(await apiSet({ action: "inc" }));
        } finally {
            setBusy(false);
        }
    }, []);
    const doDec = useCallback(async () => {
        try {
            setBusy(true);
            setState(await apiSet({ action: "dec" }));
        } finally {
            setBusy(false);
        }
    }, []);
    const doSet = useCallback(async (v: number) => {
        try {
            setBusy(true);
            const next = await apiSet({ action: "set", value: v });
            setState(next);
            setSetTo(next.value);
        } finally {
            setBusy(false);
        }
    }, []);

    // quick keyboard controls
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") doInc();
            else if (e.key === "ArrowDown") doDec();
            else if (e.key === "Enter") doSet(setTo);
            else if (e.key === "0") doSet(0);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [doInc, doDec, doSet, setTo]);

    const pct = Math.round(intensity * 100);

    return (
        <main
            className="wrap"
            style={
                {
                    // drive background + pulses
                    ["--intensity" as any]: intensity,
                } as React.CSSProperties
            }
        >
            <div className="stage">
                <h1 className="title" data-text="FEAR // ADMIN">
                    FEAR // ADMIN
                </h1>

                <section className="panel">
                    <div className="row stats">
                        <div className="meter" aria-label="Fear Level">
                            <div className="meterFill" style={{ width: `${pct}%` }} />
                            <div className="meterGlow" />
                        </div>
                        <div className="readout">
                            <span className="value">{state.value}</span>
                            <span className="sep">/</span>
                            <span className="max">{state.max}</span>
                            <span className={`chip ${busy ? "busy" : ""}`}>
                                {busy ? "SYNCING…" : "READY"}
                            </span>
                        </div>
                    </div>

                    <div className="row controls">
                        <button className="btn ghost" onClick={doDec} disabled={busy}>
                            –1
                        </button>
                        <button className="btn primary" onClick={doInc} disabled={busy}>
                            +1
                        </button>

                        <div className="set">
                            <label className="label">Set to</label>
                            <input
                                type="number"
                                value={Number.isFinite(setTo) ? setTo : 0}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value || "0", 10);
                                    setSetTo(Number.isFinite(v) ? v : 0);
                                }}
                            />
                            <button className="btn" onClick={() => doSet(setTo)} disabled={busy}>
                                Apply
                            </button>
                        </div>
                    </div>

                    <div className="row quick">
                        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                            const v = Math.round(state.max * p);
                            return (
                                <button
                                    key={p}
                                    className="pill"
                                    onClick={() => doSet(v)}
                                    disabled={busy}
                                    title={`Set to ${v}`}
                                >
                                    {p === 0 ? "0%" : p === 1 ? "100%" : `${p * 100}%`}
                                </button>
                            );
                        })}
                        <a className="link" href="/display" target="_blank" rel="noreferrer">
                            Open Display ↗
                        </a>
                    </div>
                </section>
            </div>

            <style jsx>{`
        /* --- Page wrap (matches display vibe, simpler) --- */
        .wrap {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          background: #04040a;
          position: relative;
          overflow: hidden;
          --shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
        }
        .wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(900px 600px at 70% 10%, #0c0a13 0%, #07060b 60%, #04040a 100%);
          z-index: 0;
        }
        .wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            calc(900px + var(--intensity, 0) * 600px)
              calc(600px + var(--intensity, 0) * 400px) at 70% 10%,
            rgba(147, 51, 234, calc(0.05 + var(--intensity, 0) * 0.25)) 0%,
            rgba(124, 58, 237, calc(0.02 + var(--intensity, 0) * 0.15)) 40%,
            rgba(88, 28, 135, calc(0.01 + var(--intensity, 0) * 0.1)) 70%,
            transparent 100%
          );
          animation: pulseBg calc(4s - var(--intensity, 0) * 1.5s) ease-in-out infinite;
          transition: all 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 0;
        }
        @keyframes pulseBg {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: calc(0.8 + var(--intensity, 0) * 0.2);
          }
        }

        .stage {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 24px;
          padding: 24px;
          width: min(900px, 92vw);
        }

        /* --- Glitch title --- */
        .title {
          margin: 0;
          font: 700 20px/1.1 ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New",
            monospace;
          letter-spacing: 0.25em;
          color: rgba(168, 85, 247, 0.85);
          position: relative;
          text-transform: uppercase;
          filter: drop-shadow(0 0 20px rgba(124, 58, 237, 0.25));
        }
        .title::before,
        .title::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          mix-blend-mode: screen;
          pointer-events: none;
          opacity: 0.55;
        }
        .title::before {
          transform: translate3d(-1px, 0, 0);
          text-shadow: -2px 0 0 #8b5cf6;
          animation: glitchX calc(2.4s - var(--intensity, 0) * 1s) steps(2, end) infinite;
        }
        .title::after {
          transform: translate3d(1px, 0, 0);
          text-shadow: 2px 0 0 #a855f7;
          animation: glitchY calc(3s - var(--intensity, 0) * 1.2s) steps(2, end) infinite;
        }
        @keyframes glitchX {
          0% { transform: translateX(0); }
          50% { transform: translateX(-1px); }
          100% { transform: translateX(0); }
        }
        @keyframes glitchY {
          0% { transform: translateY(0); }
          50% { transform: translateY(1px); }
          100% { transform: translateY(0); }
        }

        /* --- Panel --- */
        .panel {
          background: linear-gradient(180deg, rgba(12, 15, 24, 0.9), rgba(7, 8, 14, 0.92));
          border: 1px solid rgba(42, 47, 69, 0.7);
          border-radius: 16px;
          padding: 20px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(6px);
          display: grid;
          gap: 18px;
        }

        .row {
          display: grid;
          gap: 12px;
        }

        /* --- Stats / meter --- */
        .stats {
          gap: 10px;
        }
        .meter {
          position: relative;
          height: 14px;
          border-radius: 999px;
          background: linear-gradient(180deg, #0b0d15, #0a0b12);
          border: 1px solid rgba(90, 109, 247, 0.15);
          overflow: hidden;
        }
        .meterFill {
          position: absolute;
          inset: 0 auto 0 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(88, 28, 135, 0.2),
            rgba(124, 58, 237, 0.6) 35%,
            rgba(168, 85, 247, 0.9)
          );
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.35);
          transition: width 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .meterGlow {
          position: absolute;
          inset: -20px 0;
          filter: blur(16px);
          pointer-events: none;
          background: radial-gradient(40% 100% at 0% 50%, rgba(168, 85, 247, 0.2), transparent);
        }
        .readout {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #cfd3ea;
          font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, "Courier New", monospace;
        }
        .value {
          font-weight: 700;
          color: #e6dcff;
          text-shadow: 0 0 20px rgba(124, 58, 237, 0.25);
        }
        .sep {
          opacity: 0.5;
          padding: 0 2px;
        }
        .max {
          opacity: 0.7;
        }
        .chip {
          margin-left: auto;
          font-size: 12px;
          letter-spacing: 0.08em;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(90, 109, 247, 0.25);
          color: rgba(168, 85, 247, 0.85);
          background: rgba(20, 18, 33, 0.6);
        }
        .chip.busy {
          color: #ffcccc;
          border-color: rgba(255, 102, 102, 0.35);
          background: rgba(80, 20, 20, 0.35);
        }

        /* --- Controls --- */
        .controls {
          grid-template-columns: repeat(2, minmax(0, 100px)) 1fr;
          align-items: center;
          gap: 12px;
        }
        .set {
          display: grid;
          grid-template-columns: auto 120px auto;
          align-items: center;
          gap: 8px;
          justify-self: end;
        }
        .label {
          color: rgba(168, 85, 247, 0.7);
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        input {
          background: #0c0f18;
          color: #e8ebf5;
          border: 1px solid #2a2f45;
          padding: 8px 10px;
          border-radius: 10px;
          width: 120px;
          outline: none;
        }
        input:focus {
          border-color: rgba(90, 109, 247, 0.45);
          box-shadow: 0 0 0 4px rgba(90, 109, 247, 0.12);
        }

        .btn {
          background: #151823;
          color: #e8ebf5;
          border: 1px solid #2a2f45;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 80ms ease, box-shadow 200ms ease, border-color 200ms ease;
          user-select: none;
        }
        .btn:hover {
          box-shadow: 0 0 0 2px rgba(90, 109, 247, 0.25) inset;
        }
        .btn:active {
          transform: translateY(1px) scale(0.99);
        }
        .btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn.primary {
          border-color: rgba(124, 58, 237, 0.5);
          background: linear-gradient(180deg, #191b2a, #17182a);
        }
        .btn.ghost {
          background: #0f1220;
        }

        .quick {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .pill {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(90, 109, 247, 0.25);
          background: rgba(20, 22, 34, 0.6);
          color: #cfd3ea;
          cursor: pointer;
          font-size: 12px;
          letter-spacing: 0.05em;
        }
        .pill:hover {
          border-color: rgba(168, 85, 247, 0.6);
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2) inset;
        }

        .link {
          margin-left: auto;
          color: #bda8ff;
          text-decoration: none;
          border-bottom: 1px dashed rgba(189, 168, 255, 0.4);
          padding-bottom: 2px;
        }
        .link:hover {
          color: #e6dcff;
          border-bottom-color: rgba(230, 220, 255, 0.7);
        }

        /* responsive */
        @media (max-width: 700px) {
          .controls {
            grid-template-columns: 1fr 1fr;
          }
          .set {
            grid-template-columns: auto 1fr auto;
            justify-self: stretch;
          }
          input {
            width: 100%;
          }
        }
      `}</style>
        </main>
    );
}
