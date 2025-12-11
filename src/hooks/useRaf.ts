import { useEffect, useRef } from 'react';


export default function useRaf(cb: (t: number, dt: number) => void) {
const cbRef = useRef(cb);
useEffect(() => { cbRef.current = cb; }, [cb]);
useEffect(() => {
let last = performance.now();
let raf = 0;
const loop = (now: number) => {
const dt = Math.min(40, now - last) / 1000;
cbRef.current(now, dt);
last = now;
raf = requestAnimationFrame(loop);
};
raf = requestAnimationFrame(loop);
return () => cancelAnimationFrame(raf);
}, []);
}