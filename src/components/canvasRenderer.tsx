import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Palette } from "../types";

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hue: number;
    size: number;
    life: number;
    maxLife: number;
    active: boolean;
};

type Mode = "zero-g" | "gravity" | "chaos" | "black-hole";

type Props = {
    palette: Palette;
    poolSize?: number;
    trailPerMove?: number;
    burstCount?: number;
    trailLife?: number;
    burstLife?: number;
    baseSize?: number;

    // Controlled props
    mode: Mode;
    magnetEnabled: boolean;
    magnetRepel: boolean;

    // Callbacks for keyboard → UI sync
    onModeChange: (m: Mode) => void;
    onMagnetChange: (v: boolean) => void;
    onMagnetRepelChange: (v: boolean) => void;
};

const DEFAULTS = {
    poolSize: 1400,
    trailPerMove: 3,
    burstCount: 140,
    trailLife: 26,
    burstLife: 100,
    baseSize: 1.2,
};

export default function CanvasRenderer({
    palette,
    poolSize = DEFAULTS.poolSize,
    trailPerMove = DEFAULTS.trailPerMove,
    burstCount = DEFAULTS.burstCount,
    trailLife = DEFAULTS.trailLife,
    burstLife = DEFAULTS.burstLife,
    baseSize = DEFAULTS.baseSize,

    // controlled props
    mode,
    magnetEnabled,
    magnetRepel,

    // callbacks
    onModeChange,
    onMagnetChange,
    onMagnetRepelChange,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const poolRef = useRef<Particle[]>([]);
    const activeCount = useRef(0);
    const flashRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const lastActivityAt = useRef<number>(0);
    const cursor = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

    // FIX: Refs for fresh physics values inside the loop
    const modeRef = useRef<Mode>(mode);
    const magnetEnabledRef = useRef<boolean>(magnetEnabled);
    const magnetRepelRef = useRef<boolean>(magnetRepel);

    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { magnetEnabledRef.current = magnetEnabled; }, [magnetEnabled]);
    useEffect(() => { magnetRepelRef.current = magnetRepel; }, [magnetRepel]);

    const chaosSeed = useRef(Math.random() * 10000);

    // INIT pool
    useEffect(() => {
        const pool: Particle[] = new Array(poolSize);
        for (let i = 0; i < poolSize; i++) {
            pool[i] = {
                x: -9999,
                y: -9999,
                vx: 0,
                vy: 0,
                hue: palette.hues[0],
                size: baseSize * (0.6 + Math.random() * 1.4),
                life: 0,
                maxLife: 0,
                active: false,
            };
        }
        poolRef.current = pool;
        activeCount.current = 0;
    }, [poolSize, palette.hues, baseSize]);

    function getInactive(): Particle | null {
        return poolRef.current.find((p) => !p.active) || null;
    }

    function emitTrail(x: number, y: number, vx: number, vy: number) {
        const p = getInactive();
        if (!p) return;
        p.x = x + (Math.random() - 0.5) * 4;
        p.y = y + (Math.random() - 0.5) * 4;
        p.vx = vx * 0.14 + (Math.random() - 0.5) * 0.9;
        p.vy = vy * 0.14 + (Math.random() - 0.5) * 0.9;
        p.hue = palette.hues[0] + Math.random() * 60 - 30;
        p.size = baseSize * (0.6 + Math.random() * 1.6);
        p.life = 0;
        p.maxLife = trailLife;
        p.active = true;
        activeCount.current++;
        lastActivityAt.current = performance.now();
        startLoop();
    }

    function burst(x: number, y: number, amount = burstCount) {
        for (let i = 0; i < amount; i++) {
            const p = getInactive();
            if (!p) break;
            const a = Math.random() * Math.PI * 2;
            const s = 1.6 + Math.random() * 5.6;
            p.x = x + (Math.random() - 0.5) * 6;
            p.y = y + (Math.random() - 0.5) * 6;
            p.vx = Math.cos(a) * s;
            p.vy = Math.sin(a) * s;
            p.hue = palette.hues[0] + Math.random() * 120 - 60;
            p.size = baseSize * (0.8 + Math.random() * 1.6);
            p.life = 0;
            p.maxLife = burstLife;
            p.active = true;
            activeCount.current++;
        }

        flashRef.current = 1;
        gsap.to(flashRef as any, { current: 0, duration: 0.7, ease: "power3.out" });
        lastActivityAt.current = performance.now();
        startLoop();
    }

    function deactivate(p: Particle) {
        p.active = false;
        activeCount.current = Math.max(0, activeCount.current - 1);
    }

    // POINTER EVENTS
    useEffect(() => {
        const canvas = canvasRef.current!;
        if (!canvas) return;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth || 800;
            const h = canvas.clientHeight || 600;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            const ctx = canvas.getContext("2d")!;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener("resize", resize);

        function onMove(e: PointerEvent) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            cursor.current.vx = x - cursor.current.x;
            cursor.current.vy = y - cursor.current.y;
            cursor.current.x = x;
            cursor.current.y = y;

            const speed = Math.hypot(cursor.current.vx, cursor.current.vy);
            const emits = Math.min(trailPerMove + Math.floor(speed / 2), 8);

            for (let i = 0; i < emits; i++) {
                emitTrail(x, y, cursor.current.vx, cursor.current.vy);
            }
        }

        function onDown(e: PointerEvent) {
            const rect = canvas.getBoundingClientRect();
            burst(e.clientX - rect.left, e.clientY - rect.top);
        }

        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerdown", onDown);

        return () => {
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerdown", onDown);
            window.removeEventListener("resize", resize);
        };
    }, [trailPerMove, burstCount, burstLife, trailLife, baseSize, palette]);

    // KEYBOARD (sync with UI)
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "1") onModeChange("zero-g");
            if (e.key === "2") onModeChange("gravity");
            if (e.key === "3") onModeChange("chaos");
            if (e.key === "4") onModeChange("black-hole");

            if (e.key.toLowerCase() === "m") onMagnetChange(!magnetEnabled);
            if (e.key.toLowerCase() === "r") onMagnetRepelChange(!magnetRepel);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [magnetEnabled, magnetRepel]);

    // RAF LOOP HANDLERS
    function startLoop() {
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(loop);
    }
    function stopLoop() {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }

    function cheapNoise(x: number, y: number, t: number) {
        return (
            Math.sin((x + t * 0.001 + chaosSeed.current) * 0.01) * 0.5 +
            Math.cos((y - t * 0.001 - chaosSeed.current) * 0.012) * 0.5
        );
    }

    function loop() {
        rafRef.current = requestAnimationFrame(loop);

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const now = performance.now();

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(6,6,10,0.14)";
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        const pool = poolRef.current;

        for (const p of pool) {
            if (!p.active) continue;

            p.life++;
            if (p.life >= p.maxLife) {
                deactivate(p);
                continue;
            }

            // ⭐ PHYSICS MODES read from REF (fresh each frame)
            const m = modeRef.current;

            if (m === "gravity") {
                p.vy += 0.35;
                p.vx *= 0.99;

            } else if (m === "chaos") {
                const n = cheapNoise(p.x * 0.6, p.y * 0.6, now);
                p.vx += Math.cos(n) * 1.4;
                p.vy += Math.sin(n) * 1.4;

            } else if (m === "black-hole") {
                const dx = cx - p.x;
                const dy = cy - p.y;
                const dist = Math.hypot(dx, dy) + 0.1;
                const force = 120 / (dist * dist);
                const power = 1.2;
                p.vx += (dx / dist) * force * power;
                p.vy += (dy / dist) * force * power;

                // swirl
                p.vx += -dy * 0.002;
                p.vy += dx * 0.002;
            }

            // ⭐ MAGNET (also from REFS)
            if (magnetEnabledRef.current) {
                const dx = cursor.current.x - p.x;
                const dy = cursor.current.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 260) {
                    const dir = magnetRepelRef.current ? -1 : 1;
                    const mag = (1 - dist / 260) * 0.9 * dir;
                    const mPower = 1.8;
                    p.vx += (dx / dist) * mag * mPower;
                    p.vy += (dy / dist) * mag * mPower;
                }
            }

            // motion
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.x += p.vx;
            p.y += p.vy;

            // glow
            ctx.globalCompositeOperation = "lighter";
            const lifeNorm = 1 - p.life / p.maxLife;
            const sizePx = p.size;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sizePx * 10);
            grad.addColorStop(0, `hsla(${p.hue},100%,60%,${lifeNorm})`);
            grad.addColorStop(1, `hsla(${p.hue},80%,30%,0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, sizePx * 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw magnet debug circle
        if (magnetEnabledRef.current) {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = magnetRepelRef.current
                ? "rgba(255,60,60,0.4)"
                : "rgba(60,255,255,0.4)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cursor.current.x, cursor.current.y, 260, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Stop when idle
        if (activeCount.current === 0 && now - lastActivityAt.current > 700) {
            stopLoop();
        }
    }

    // INITIAL CLEAR
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#030313";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ touchAction: "none", display: "block" }}
            />
        </div>
    );
}
