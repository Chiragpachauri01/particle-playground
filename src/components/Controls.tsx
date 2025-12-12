import React, { useState } from "react";
import type { Palette } from "../types";

type Mode = "zero-g" | "gravity" | "chaos" | "black-hole";

type Props = {
  particleCount: number;

  trailPerMove: number;
  setTrailPerMove: (v: number) => void;

  burstCount: number;
  setBurstCount: (v: number) => void;

  palette: Palette;
  palettes: Palette[];
  onPaletteChange: (p: Palette) => void;

  // NEW props for physics and magnet
  mode: Mode;
  setMode: (m: Mode) => void;

  magnetEnabled: boolean;
  setMagnetEnabled: (v: boolean) => void;

  magnetRepel: boolean;
  setMagnetRepel: (v: boolean) => void;
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
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="absolute top-4 left-4 z-50">
      {/* MOBILE COLLAPSE */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden px-3 py-2 bg-black/50 text-white rounded-lg backdrop-blur-md shadow-lg border border-white/10"
      >
        {open ? "Hide Controls" : "Show Controls"}
      </button>

      {open && (
        <div className="mt-3 w-64 max-w-[90vw] p-4 rounded-2xl bg-black/40 backdrop-blur-xl text-white shadow-2xl border border-white/10">
          <h3 className="text-base font-semibold mb-3 tracking-wide text-white/90">
            Controls
          </h3>

          <div className="text-xs text-gray-300 mb-3">
            Particle Pool: {particleCount}
          </div>

          {/* TRAIL DENSITY */}
          <label className="text-xs">Trail Density: {trailPerMove}</label>
          <input
            type="range"
            min={1}
            max={8}
            value={trailPerMove}
            onChange={(e) => setTrailPerMove(Number(e.target.value))}
            className="w-full mb-3"
          />

          {/* BURST SIZE */}
          <label className="text-xs">Burst Size: {burstCount}</label>
          <input
            type="range"
            min={20}
            max={300}
            value={burstCount}
            onChange={(e) => setBurstCount(Number(e.target.value))}
            className="w-full mb-3"
          />

          {/* COLOR PALETTE */}
          <label className="text-xs">Color Palette</label>
          <div className="flex flex-wrap gap-2 mt-2 mb-3">
            {palettes.map((p) => (
              <button
                key={p.name}
                onClick={() => onPaletteChange(p)}
                className={`px-2 py-1 rounded-md text-xs backdrop-blur-md border
                  ${
                    p.name === palette.name
                      ? "bg-white/20 border-white/20"
                      : "bg-white/5 border-white/10"
                  }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* PHYSICS MODE SELECTOR */}
          <div className="mt-2">
            <label className="text-xs block mb-1">Physics Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(["zero-g", "gravity", "chaos", "black-hole"] as Mode[]).map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-2 py-1 rounded text-xs border backdrop-blur-sm
                      ${
                        mode === m
                          ? "bg-white/20 border-white/30"
                          : "bg-white/5 border-white/10"
                      }`}
                  >
                    {m.replace("-", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* MAGNET TOGGLE */}
          <div className="mt-4">
            <label className="text-xs block mb-1">Cursor Magnet</label>
            <button
              onClick={() => setMagnetEnabled(!magnetEnabled)}
              className={`px-2 py-1 rounded text-xs border w-full
                ${
                  magnetEnabled
                    ? "bg-green-500/30 border-green-400/40"
                    : "bg-white/5 border-white/10"
                }`}
            >
              {magnetEnabled ? "Magnet ON" : "Magnet OFF"}
            </button>
          </div>

          {/* ATTRACT OR REPEL */}
          {magnetEnabled && (
            <div className="mt-2">
              <label className="text-xs block mb-1">Magnet Behavior</label>
              <button
                onClick={() => setMagnetRepel(!magnetRepel)}
                className={`px-2 py-1 rounded text-xs border w-full
                  ${
                    magnetRepel
                      ? "bg-red-500/30 border-red-400/40"
                      : "bg-blue-500/30 border-blue-400/40"
                  }`}
              >
                {magnetRepel ? "Repel" : "Attract"}
              </button>
            </div>
          )}

          <p className="mt-3 text-[11px] text-gray-300">
            Move cursor to draw neon trails.  
            Click to burst ✨  
            Keys 1–4 = modes, M = magnet, R = repel toggle.
          </p>
        </div>
      )}
    </div>
  );
}
