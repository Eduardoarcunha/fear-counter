"use client";

import { useEffect, useState } from "react";

type FearState = { value: number; max: number };

async function apiSet(body: any) {
    const r = await fetch("/api/fear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return r.json();
}

export default function AdminPage() {
    const [state, setState] = useState<FearState>({ value: 0, max: 15 });
    const [setTo, setSetTo] = useState<number>(0);

    useEffect(() => {
        fetch("/api/fear")
            .then((r) => r.json())
            .then((d) => setState({ value: d.value ?? 0, max: d.max ?? 15 }))
            .catch(() => { });
    }, []);

    return (
        <main className="container" style={{ display: "grid", gap: 24 }}>
            <h1>Admin — Fear Control</h1>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={async () => setState(await apiSet({ action: "dec" }))}>–1</button>
                <button onClick={async () => setState(await apiSet({ action: "inc" }))}>+1</button>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="number"
                        value={setTo}
                        onChange={(e) => setSetTo(parseInt(e.target.value || "0", 10))}
                        style={{ width: 90 }}
                    />
                    <button onClick={async () => setState(await apiSet({ action: "set", value: setTo }))}>
                        Set to
                    </button>
                </div>
            </div>

            <div style={{ opacity: .7 }}>
                <small>
                    Current (admin view only): <b>{state.value}</b> / {state.max}
                </small>
            </div>

            <style jsx>{`
        button {
          background: #151823;
          color: #e8ebf5;
          border: 1px solid #2a2f45;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.08s ease, box-shadow 0.2s ease;
        }
        button:hover { box-shadow: 0 0 0 2px rgba(90,109,247,.25) inset; }
        button:active { transform: translateY(1px) scale(0.99); }
        input {
          background: #0c0f18;
          color: #e8ebf5;
          border: 1px solid #2a2f45;
          padding: 8px 10px;
          border-radius: 10px;
        }
      `}</style>
        </main>
    );
}
