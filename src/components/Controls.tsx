import React from "react";
import type { Palette, Mode, Shape } from "../types";

type Props = {
    particleCount: number;
    trailPerMove: number;
    setTrailPerMove: (v: number) => void;

    burstCount: number;
    setBurstCount: (v: number) => void;

    palette: Palette;
    palettes: Palette[];
    onPaletteChange: (p: Palette) => void;

    mode: Mode;
    setMode: (m: Mode) => void;

    magnetEnabled: boolean;
    setMagnetEnabled: (v: boolean) => void;

    magnetRepel: boolean;
    setMagnetRepel: (v: boolean) => void;

    shape: Shape;
    setShape: (s: Shape) => void;
};

export default function Controls({
    particleCount,
    trailPerMove,
    setTrailPerMove,
    burstCount,
    setBurstCount,
    palette,
    palettes,
    onPaletteChange,
    mode,
    setMode,
    magnetEnabled,
    setMagnetEnabled,
    magnetRepel,
    setMagnetRepel,
    shape,
    setShape
}: Props) {
    return (
        <div className="absolute top-4 left-4 bg-black/40 p-4 rounded-lg backdrop-blur-md border border-white/10 w-64 text-sm">

            <h2 className="text-lg mb-2 opacity-90">Controls</h2>

            <label className="opacity-70">Trail per Move</label>
            <input
                type="range"
                min={1}
                max={10}
                value={trailPerMove}
                onChange={(e) => setTrailPerMove(Number(e.target.value))}
                className="w-full"
            />

            <label className="opacity-70 mt-3 block">Burst Count</label>
            <input
                type="range"
                min={20}
                max={400}
                value={burstCount}
                onChange={(e) => setBurstCount(Number(e.target.value))}
                className="w-full"
            />

            <label className="opacity-70 mt-3 block">Palette</label>
            <select
                value={palette.name}
                onChange={(e) =>
                    onPaletteChange(palettes.find(p => p.name === e.target.value)!)
                }
                className="w-full bg-black/30 p-1 mt-1"
            >
                {palettes.map((p) => (
                    <option key={p.name}>{p.name}</option>
                ))}
            </select>

            <label className="opacity-70 mt-3 block">Physics Mode</label>
            <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full bg-black/30 p-1 mt-1"
            >
                <option value="zero-g">Zero-G</option>
                <option value="gravity">Gravity</option>
                <option value="chaos">Chaos</option>
                <option value="black-hole">Black Hole</option>
            </select>

            <label className="opacity-70 mt-3 block">Particle Shape</label>
            <select
                value={shape}
                onChange={(e) => setShape(e.target.value as Shape)}
                className="w-full bg-black/30 p-1 mt-1"
            >
                <option value="bubble">Bubble</option>
                <option value="line">Line Streak</option>
                <option value="square">Square Pixel</option>
                <option value="triangle">Triangle Spark</option>
                <option value="ray">Ray Burst</option>
            </select>

            <div className="mt-3 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={magnetEnabled}
                    onChange={(e) => setMagnetEnabled(e.target.checked)}
                />
                <span>Magnet</span>
            </div>

            {magnetEnabled && (
                <div className="mt-2 flex items-center gap-2 ml-4">
                    <input
                        type="checkbox"
                        checked={magnetRepel}
                        onChange={(e) => setMagnetRepel(e.target.checked)}
                    />
                    <span>Repel</span>
                </div>
            )}
        </div>
    );
}
