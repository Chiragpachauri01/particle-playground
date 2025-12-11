import { initPool, createParticle } from '../src/utils/particles';


test('initPool creates correct count', () => {
const pool = initPool(100, 800, 600, 200, 1);
expect(pool.length).toBe(100);
pool.forEach(p => {
expect(typeof p.x).toBe('number');
expect(typeof p.vx).toBe('number');
});
});