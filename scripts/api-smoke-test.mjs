/**
 * Minimal API smoke test (no auth). Run with dev server:
 *   npm run dev
 *   node scripts/api-smoke-test.mjs
 *
 * Optional: BASE_URL=http://localhost:3000
 */

const base = process.env.BASE_URL || 'http://localhost:3000';

const routes = [
  ['GET', '/api/ping'],
];

async function main() {
  let ok = 0;
  let fail = 0;
  for (const [method, path] of routes) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, { method });
      const text = await res.text();
      const pass = res.ok;
      console.log(`${method} ${path} -> ${res.status} ${pass ? 'OK' : 'FAIL'}`);
      if (!pass) console.log(`  body: ${text.slice(0, 200)}`);
      if (pass) ok += 1;
      else fail += 1;
    } catch (e) {
      console.error(`${method} ${path} -> ERROR: ${e.message}`);
      fail += 1;
    }
  }
  console.log(`\nDone: ${ok} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
