import React, { useState } from "react";
import CanvasRenderer from "./components/canvasRenderer";
import Controls from "./components/Controls";
import type { Palette } from "./types";

const palettes: Palette[] = [
  { name: "Aqua Indigo", hues: [190, 240] },
  { name: "Magenta Lime", hues: [320, 120] },
  { name: "Cyan Orange", hues: [180, 30] },
];

export default function App() {
  const [trailPerMove, setTrailPerMove] = useState(3);
  const [burstCount, setBurstCount] = useState(140);
  const [palette, setPalette] = useState<Palette>(palettes[0]);

  // NEW — physics + magnet state
  const [mode, setMode] = useState<"zero-g" | "gravity" | "chaos" | "black-hole">("zero-g");
  const [magnetEnabled, setMagnetEnabled] = useState(false);
  const [magnetRepel, setMagnetRepel] = useState(false);

  const poolSize = 1400;

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-b from-[#020214] to-[#05081A] text-white overflow-hidden">

      {/* HEADER */}
      <header className="w-full py-3 text-center text-lg font-semibold tracking-wide bg-black/20 backdrop-blur-md border-b border-white/10">
        Neon Particle Playground
      </header>

      <div className="relative flex-1 w-full h-full overflow-hidden">

        {/* Canvas Renderer */}
        <CanvasRenderer
          palette={palette}
          poolSize={poolSize}
          trailPerMove={trailPerMove}
          burstCount={burstCount}
          mode={mode}
          magnetEnabled={magnetEnabled}
          magnetRepel={magnetRepel}

          onModeChange={setMode}
          onMagnetChange={setMagnetEnabled}
          onMagnetRepelChange={setMagnetRepel}
        />

        {/* Controls */}
        <Controls
          particleCount={poolSize}
          trailPerMove={trailPerMove}
          setTrailPerMove={setTrailPerMove}
          burstCount={burstCount}
          setBurstCount={setBurstCount}
          palette={palette}
          palettes={palettes}
          onPaletteChange={setPalette}
          mode={mode}
          setMode={setMode}
          magnetEnabled={magnetEnabled}
          setMagnetEnabled={setMagnetEnabled}
          magnetRepel={magnetRepel}
          setMagnetRepel={setMagnetRepel}
        />
      </div>

      {/* FOOTER */}
      <footer className="w-full py-2 text-center text-sm text-white/70 bg-black/20 backdrop-blur-md border-t border-white/10">
        by <span className="text-white/90 font-medium">ChandreshPachauri</span>
      </footer>

    </div>
  );
}
