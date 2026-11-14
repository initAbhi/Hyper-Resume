/**
 * High-fidelity product workspace mockups for landing tabs.
 * Usage: bun --cwd backend ../scripts/generate_product_workspace_shots.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'frontend/public/marketing/product');
const ERIK = path.join(ROOT, 'frontend/public/marketing/hero/erik-resume.png');
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/usr/bin/google-chrome-stable';

const W = 1280;
const H = 820;
const SCALE = 2;

function shell(title: string, body: string, accent = '#5525F5') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#070708;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#fafafa}
.app{display:flex;width:100%;height:100%}
.side{width:220px;background:#0c0c0e;border-right:1px solid rgba(255,255,255,.06);padding:18px 14px;display:flex;flex-direction:column;gap:6px}
.brand{display:flex;align-items:center;gap:8px;padding:6px 8px 16px;font-weight:700;font-size:14px}
.brand span{color:#60a5fa}
.nav{font-size:12px;padding:9px 10px;border-radius:10px;color:#a1a1aa}
.nav.active{background:rgba(255,255,255,.06);color:#fff;font-weight:600}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.top{height:52px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;padding:0 18px}
.pill{font-size:11px;color:#a1a1aa;background:rgba(255,255,255,.04);padding:6px 10px;border-radius:999px}
.cta{font-size:12px;font-weight:600;background:#fff;color:#09090b;padding:8px 14px;border-radius:999px}
.stage{flex:1;position:relative;padding:22px;background:radial-gradient(ellipse 70% 55% at 50% 0%, rgba(85,37,245,.18), transparent 60%), #070708}
.paper{position:absolute;left:50%;top:18px;transform:translateX(-50%);width:420px;height:720px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.55)}
.paper img{width:100%;height:100%;object-fit:cover;object-position:top}
.card{position:absolute;background:rgba(18,18,20,.92);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.45);padding:14px 16px}
.card h4{font-size:12px;font-weight:600;margin-bottom:8px}
.muted{color:#a1a1aa;font-size:11px;line-height:1.45}
.row{display:flex;justify-content:space-between;gap:12px;font-size:11px;margin:5px 0;color:#d4d4d8}
.bar{height:6px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:4px}
.fill{height:100%;background:${accent};border-radius:99px}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;color:#c4b5fd;background:rgba(85,37,245,.18);padding:4px 8px;border-radius:999px;margin-bottom:8px}
.btn{display:inline-flex;margin-top:10px;font-size:11px;font-weight:600;background:#fff;color:#09090b;padding:8px 12px;border-radius:999px}
.before{color:#a1a1aa;text-decoration:line-through;font-size:11px;line-height:1.4}
.after{color:#e9d5ff;font-size:11px;line-height:1.45;margin-top:8px}
.check{color:#34d399}
.miss{color:#71717a}
</style></head><body>
<div class="app">
  <aside class="side">
    <div class="brand">Hype<span>Resume</span></div>
    <div class="nav active">Editor</div>
    <div class="nav">ATS Score</div>
    <div class="nav">Job Match</div>
    <div class="nav">Bullet Rewrite</div>
    <div class="nav">Applications</div>
  </aside>
  <div class="main">
    <div class="top">
      <div class="pill">${title}</div>
      <div class="cta">Export PDF</div>
    </div>
    <div class="stage">${body}</div>
  </div>
</div>
</body></html>`;
}

const TMP = path.join(ROOT, 'frontend/public/marketing/product/_tmp');
const erikRel = './erik-resume.png';

const SHOTS: Array<{ file: string; html: string }> = [
  {
    file: 'build-workspace.png',
    html: shell(
      'Master resume · Software Engineer',
      `<div class="paper"><img src="${erikRel}" alt="resume"/></div>
       <div class="card" style="left:28px;top:70px;width:240px">
         <div class="badge">Structure</div>
         <h4>Sections locked for ATS</h4>
         <div class="muted">Education · Experience · Leadership · Projects · Skills — linear reading order.</div>
         <div class="row"><span>Single column</span><span class="check">Pass</span></div>
         <div class="row"><span>Selectable text</span><span class="check">Pass</span></div>
       </div>
       <div class="card" style="right:36px;bottom:90px;width:250px">
         <h4>Template: Jake ATS</h4>
         <div class="muted">High-density engineering format. Margins and hierarchy tuned for Workday / Greenhouse.</div>
         <div class="btn">Switch template</div>
       </div>`,
    ),
  },
  {
    file: 'score-workspace.png',
    html: shell(
      'Live ATS readiness · 94',
      `<div class="paper"><img src="${erikRel}" alt="resume"/></div>
       <div class="card" style="right:28px;top:54px;width:280px">
         <div class="badge">Score</div>
         <div style="display:flex;align-items:center;gap:14px;margin:6px 0 10px">
           <div style="width:72px;height:72px;border-radius:999px;border:4px solid #5525F5;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">94</div>
           <div>
             <div style="font-size:13px;font-weight:600">Excellent</div>
             <div class="muted">Parser-ready structure</div>
           </div>
         </div>
         <div class="row"><span>Reading order</span><span>25/25</span></div><div class="bar"><div class="fill" style="width:100%"></div></div>
         <div class="row"><span>Section landmarks</span><span>24/25</span></div><div class="bar"><div class="fill" style="width:96%"></div></div>
         <div class="row"><span>Selectable text</span><span>22/25</span></div><div class="bar"><div class="fill" style="width:88%"></div></div>
         <div class="row"><span>Impact density</span><span>23/25</span></div><div class="bar"><div class="fill" style="width:92%"></div></div>
       </div>
       <div class="card" style="left:24px;bottom:80px;width:230px">
         <h4>What we found</h4>
         <div class="muted"><span class="check">✓</span> Quantified Amazon / Autodesk bullets<br/><span class="check">✓</span> Standard headings<br/><span class="miss">○</span> Add 1 more metric in Projects</div>
       </div>`,
    ),
  },
  {
    file: 'match-workspace.png',
    html: shell(
      'Target · Senior Software Engineer',
      `<div class="paper"><img src="${erikRel}" alt="resume"/></div>
       <div class="card" style="right:24px;top:60px;width:300px">
         <div class="badge">Job match</div>
         <h4>AI keyword targeting</h4>
         <div class="muted" style="margin-bottom:8px">Is this missing keyword relevant to your experience?</div>
         <div style="display:inline-block;background:rgba(52,211,153,.12);color:#6ee7b7;font-size:11px;font-weight:600;padding:5px 10px;border-radius:999px;margin-bottom:10px">Distributed systems</div>
         <div class="btn">Yes, add evidence bullet</div>
         <div style="margin-top:12px" class="muted">
           <div><span class="check">✓</span> TypeScript</div>
           <div><span class="check">✓</span> AWS</div>
           <div><span class="check">✓</span> Redis</div>
           <div><span class="miss">○</span> Distributed systems</div>
           <div><span class="miss">○</span> Kafka</div>
         </div>
       </div>
       <div class="card" style="left:28px;top:90px;width:210px">
         <h4>Match score</h4>
         <div style="font-size:28px;font-weight:700;margin:4px 0">89%</div>
         <div class="muted">Mapped only to documented experience — gaps stay visible.</div>
       </div>`,
    ),
  },
  {
    file: 'rewrite-workspace.png',
    html: shell(
      'Bullet improver · evidence-grounded',
      `<div class="paper"><img src="${erikRel}" alt="resume"/></div>
       <div class="card" style="left:50%;top:120px;transform:translateX(-50%);width:460px">
         <div class="badge">Rewrite</div>
         <h4>Strengthen with proof — never invent</h4>
         <div class="before">Developed a Spring Boot app with Docker on AWS EC2.</div>
         <div class="after">Cut deployment overhead 40% by containerizing Spring Boot services on AWS EC2, shipping releases to 30+ stakeholders in hours, not days.</div>
         <div style="display:flex;gap:8px;margin-top:12px">
           <div class="btn">Accept rewrite</div>
           <div style="font-size:11px;font-weight:600;color:#a1a1aa;padding:8px 12px">Keep original</div>
         </div>
       </div>
       <div class="card" style="right:28px;bottom:70px;width:230px">
         <h4>Guardrails</h4>
         <div class="muted">No fake employers, degrees, or metrics. Suggestions only restructure what you already did.</div>
       </div>`,
      '#a78bfa',
    ),
  },
];

async function main() {
  if (!fs.existsSync(ERIK)) {
    console.error('Missing erik-resume.png — run hero asset sync first');
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.copyFileSync(ERIK, path.join(TMP, 'erik-resume.png'));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none', '--hide-scrollbars'],
  });
  try {
    for (const shot of SHOTS) {
      const htmlPath = path.join(TMP, shot.file.replace('.png', '.html'));
      fs.writeFileSync(htmlPath, shot.html);
      const page = await browser.newPage();
      await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
      await page.waitForFunction(() => {
        const img = document.querySelector('img');
        return img && (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0;
      });
      const dest = path.join(OUT, shot.file);
      await page.screenshot({ path: dest as `${string}.png`, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
      console.log('✓', path.relative(ROOT, dest));
      await page.close();
    }
  } finally {
    await browser.close();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
