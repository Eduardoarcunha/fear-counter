"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import s from "./display.module.css";

type FearMsg = { value: number; max?: number };

function useFear() {
    const [value, setValue] = useState(0);
    const [max, setMax] = useState(15);

    useEffect(() => {
        let off = false;

        fetch("/api/fear")
            .then((r) => r.json())
            .then((d: FearMsg) => {
                if (off) return;
                setValue(typeof d.value === "number" ? d.value : 0);
                if (typeof d.max === "number") setMax(d.max);
            })
            .catch(() => { });

        const es = new EventSource("/api/fear/stream");
        es.onmessage = (ev) => {
            try {
                const d = JSON.parse(ev.data) as FearMsg;
                if (typeof d.value === "number") setValue(d.value);
                if (typeof d.max === "number") setMax(d.max);
            } catch { }
        };
        return () => {
            off = true;
            es.close();
        };
    }, []);

    const ratio = useMemo(() => {
        const r = max ? value / max : 0;
        return Math.max(0, Math.min(1, r));
    }, [value, max]);

    return { levelPct: Math.round(ratio * 100), ratio, value, max };
}

// Component for dynamic particles
function Particles() {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 10,
            duration: 10 + Math.random() * 10
        }));
    }, []);

    return (
        <div className={s.particles}>
            {particles.map(p => (
                <div
                    key={p.id}
                    className={s.particle}
                    style={{
                        left: `${p.left}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`
                    }}
                />
            ))}
        </div>
    );
}

// Component for dynamic bubbles
function Bubbles({ intensity }: { intensity: number }) {
    const bubbles = useMemo(() => {
        const count = Math.floor(3 + intensity * 7);
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            size: 4 + Math.random() * 8,
            left: 20 + Math.random() * 60,
            bottom: Math.random() * 30,
            delay: Math.random() * 4,
            duration: 4 + Math.random() * 4
        }));
    }, [intensity]);

    return (
        <>
            {bubbles.map(b => (
                <div
                    key={b.id}
                    className={s.bubble}
                    style={{
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                        left: `${b.left}%`,
                        bottom: `${b.bottom}%`,
                        animationDelay: `${b.delay}s`,
                        animationDuration: `${b.duration}s`
                    }}
                />
            ))}
        </>
    );
}

export default function DisplayPage() {
    const { levelPct, ratio, value, max } = useFear();
    const [fearLabel, setFearLabel] = useState({ text: "FEAR LEVEL", className: "low" });

    // Update fear label based on ratio
    useEffect(() => {
        if (ratio < 0.3) {
            setFearLabel({ text: "FEAR", className: "low" });
        } else if (ratio < 0.6) {
            setFearLabel({ text: "FEAR", className: "medium" });
        } else if (ratio < 0.85) {
            setFearLabel({ text: "FEAR", className: "high" });
        } else {
            setFearLabel({ text: "FEAR", className: "critical" });
        }
    }, [ratio]);

    return (
        <main
            className={s.wrap}
            style={
                {
                    ["--intensity" as any]: ratio,
                } as React.CSSProperties
            }
        >
            {/* Corruption veins */}
            <div className={s.corruptionVeins}>
                <div className={`${s.vein} ${s.vein1}`} />
                <div className={`${s.vein} ${s.vein2}`} />
                <div className={`${s.vein} ${s.vein3}`} />
            </div>

            {/* Floating particles */}
            <Particles />

            <div className={s.stage}>
                {/* Fear label */}
                <div className={`${s.fearLabel} ${s[fearLabel.className]}`}>
                    {fearLabel.text}
                </div>

                <div className={`${s.sphereContainer} ${ratio > 0.5 ? s.shaking : ''}`}>
                    {/* Heartbeat effect */}
                    <div className={`${s.heartbeat} ${ratio > 0.7 ? s.active : ''}`} />

                    {/* Outer glow */}
                    <div className={s.outerGlow} />

                    {/* Cracks */}
                    <div className={`${s.cracks} ${ratio > 0.6 ? s.visible : ''}`}>
                        <div className={`${s.crack} ${s.crack1}`} />
                        <div className={`${s.crack} ${s.crack2}`} />
                        <div className={`${s.crack} ${s.crack3}`} />
                    </div>

                    {/* Main enhanced sphere */}
                    <div
                        className={s.sphere}
                        style={
                            {
                                ["--level" as any]: `${levelPct}%`,
                                ["--t" as any]: ratio,
                            } as React.CSSProperties
                        }
                        aria-label={`Fear level ${levelPct}%`}
                    >
                        {/* Inner shadow for depth */}
                        <div className={s.innerShadow} />

                        {/* Liquid fill with enhanced effects */}
                        <div className={`${s.fill} ${ratio > 0.75 ? s.highFear : ''}`}>
                            {/* Surface turbulence */}
                            <div className={s.surfaceTurbulence}>
                                <div className={s.wave} />
                            </div>

                            {/* Liquid surface shimmer */}
                            <div className={s.shimmer} />

                            {/* Dynamic bubbles */}
                            <div className={s.bubbles}>
                                <Bubbles intensity={ratio} />
                            </div>
                        </div>

                        {/* Glass reflection - top highlight */}
                        <div className={s.glassTop} />

                        {/* Glass reflection - side highlights */}
                        <div className={s.sideHighlight1} />
                        <div className={s.sideHighlight2} />

                        {/* Rim highlights */}
                        <div className={s.rimHighlight1} />
                        <div className={s.rimHighlight2} />

                        {/* Caustic light patterns */}
                        <div className={s.caustics} />

                        <div className={s.edgeVignette} />
                    </div>

                    {/* Base shadow */}
                    <div className={s.baseShadow} />
                </div>
            </div>
        </main>
    );
}