"use client";

import { useEffect, useMemo, useState } from "react";
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

    return { levelPct: Math.round(ratio * 100), ratio };
}

export default function DisplayPage() {
    const { levelPct, ratio } = useFear();

    return (
        <main
            className={s.wrap}
            style={
                {
                    ["--intensity" as any]: ratio,
                } as React.CSSProperties
            }
        >
            <div className={s.stage}>
                <div className={s.sphereContainer}>
                    {/* Outer glow */}
                    <div className={s.outerGlow} />

                    {/* Main enhanced sphere */}
                    <div
                        className={s.sphere}
                        style={
                            {
                                // % for fill height, decimal for animation/glitch intensity
                                ["--level" as any]: `${levelPct}%`,
                                ["--t" as any]: ratio,
                            } as React.CSSProperties
                        }
                        aria-label={`Fear level ${levelPct}%`}
                    >
                        {/* Inner shadow for depth */}
                        <div className={s.innerShadow} />

                        {/* Liquid fill with enhanced effects */}
                        <div className={s.fill}>
                            {/* Liquid surface shimmer */}
                            <div className={s.shimmer} />

                            {/* Bubbles */}
                            <div className={s.bubbles}>
                                <div className={s.bubble1} />
                                <div className={s.bubble2} />
                                <div className={s.bubble3} />
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

                {/* Progress Bar */}
                <div className={s.progressContainer}>
                    <div className={s.progressBar}>
                        <div
                            className={s.progressFill}
                            style={{ width: `${levelPct}%` }}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}