/**
 * Generate dense, Erik-quality A4 resume PNGs for landing / ads.
 * Each template file is a unique visual layout (no byte-identical clones).
 * Usage: bun --cwd backend ../scripts/generate_marketing_resume_previews.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'frontend/public/marketing/templates');
const HERO = path.join(ROOT, 'frontend/public/marketing/hero');
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/usr/bin/google-chrome-stable';

const W = 850;
const H = 1100;
const SCALE = 2;

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const BULLETS = {
  exp1: [
    'Built and shipped a <strong>TypeScript / Next.js</strong> hiring platform serving <strong>12K+</strong> MAUs with <strong>99.9%</strong> uptime on AWS.',
    'Cut p95 API latency <strong>38%</strong> via PostgreSQL index redesign and Redis caching on hot read paths.',
    'Owned CI/CD with GitHub Actions + Docker; moved releases from weekly to daily with zero Q3 rollbacks.',
    'Led evidence-based resume↔JD matching that increased free-to-paid conversion by <strong>14%</strong>.',
    'Mentored 2 interns on NestJS + React Testing Library; resolved 3 production incidents under 30 minutes.',
  ],
  exp2: [
    'Implemented REST APIs in <strong>Node.js / Express</strong> for billing and usage metering across 8 enterprise tenants.',
    'Raised critical-path test coverage from <strong>41% → 86%</strong> with Jest and Playwright.',
    'Shipped React admin dashboards that cut support triage time by ~<strong>25%</strong>.',
  ],
  exp3: [
    'Delivered 6 client products (dashboards, booking) with React + PostgreSQL on schedule.',
    'Integrated Stripe + transactional email; processed <strong>$40K+</strong> GMV with zero payment mismatches.',
  ],
};

function ul(items: string[]) {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

/** Jake — Times, uppercase name, LaTeX-density */
function jakeHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden}
body{font-family:"Times New Roman",Times,Georgia,serif;color:#111;-webkit-font-smoothing:antialiased}
.page{width:${W}px;height:${H}px;padding:36px 44px 28px;background:#fff}
h1{font-size:28px;font-weight:700;text-align:center;letter-spacing:-0.02em;text-transform:uppercase}
.contact{text-align:center;font-size:11px;margin-top:6px;color:#222;line-height:1.45}
.sec{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-top:10px}
.sec::after{content:"";display:block;height:1px;background:#111;margin-top:3px}
p,li{font-size:11.2px;line-height:1.38;color:#1a1a1a}
.job{margin-top:8px}
.row{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
.left{font-size:12px}.left strong{font-weight:700}
.right{font-size:11px;white-space:nowrap;color:#222}
.role{font-size:11.5px;font-style:italic;margin-top:1px}
ul{margin:3px 0 0 16px} li{margin-bottom:2px}
.skills{margin-top:6px} .skills div{margin-bottom:2px;font-size:11.2px;line-height:1.38}
.edu-detail{font-size:11px;color:#333;margin-top:2px}
</style></head><body><div class="page">
  <h1>Alexander Sharma</h1>
  <div class="contact">Bengaluru, India · alex.sharma@email.com · +91 98765 43210 · linkedin.com/in/alexsharma · github.com/alexsharma</div>
  <div class="sec">Education</div>
  <div class="job">
    <div class="row"><div class="left"><strong>Visvesvaraya Technological University</strong></div><div class="right">Aug 2018 – May 2022</div></div>
    <div class="row"><div class="role">B.E. Computer Science &amp; Engineering · GPA 8.7/10 · Dean’s List</div><div class="right">Bengaluru, India</div></div>
    <div class="edu-detail"><strong>Coursework:</strong> Data Structures, Algorithms, Databases, Operating Systems, Computer Networks, Software Engineering</div>
  </div>
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><div class="left"><strong>TechNova Solutions</strong></div><div class="right">Jan 2023 – Present</div></div>
    <div class="row"><div class="role">Software Engineer</div><div class="right">Bengaluru, India</div></div>${ul(BULLETS.exp1)}</div>
  <div class="job"><div class="row"><div class="left"><strong>CloudBridge Labs</strong></div><div class="right">May 2022 – Dec 2022</div></div>
    <div class="row"><div class="role">Software Engineer Intern</div><div class="right">Hyderabad, India</div></div>${ul(BULLETS.exp2)}</div>
  <div class="job"><div class="row"><div class="left"><strong>Independent</strong></div><div class="right">Jan 2021 – Apr 2022</div></div>
    <div class="row"><div class="role">Freelance Full-Stack Developer</div><div class="right">Remote</div></div>${ul(BULLETS.exp3)}</div>
  <div class="sec">Projects</div>
  <div class="job"><div class="row"><div class="left"><strong>HypeResume ATS Engine</strong> | TypeScript, Vitest, pdf-parse</div><div class="right">2024</div></div>
    <ul><li>Deterministic single-column parsing checks and structured ATS scoring for selectable-text PDF exports.</li></ul></div>
  <div class="job"><div class="row"><div class="left"><strong>Realtime Collab Board</strong> | React, WebSockets, Redis</div><div class="right">2023</div></div>
    <ul><li>Built multiplayer canvas with presence, conflict-free edits, and sub-100ms sync under 50 concurrent users.</li></ul></div>
  <div class="sec">Technical Skills</div>
  <div class="skills">
    <div><strong>Languages:</strong> TypeScript, JavaScript, Python, SQL, Java</div>
    <div><strong>Frontend:</strong> React, Next.js, Tailwind CSS, Redux Toolkit, HTML/CSS</div>
    <div><strong>Backend:</strong> Node.js, Express, NestJS, REST APIs, PostgreSQL, Redis, Prisma</div>
    <div><strong>Cloud / DevOps:</strong> AWS (EC2, S3, SES), Docker, Nginx, GitHub Actions, CI/CD, Linux</div>
  </div>
</div></body></html>`;
}

/** Classic ATS — Helvetica, left name, no uppercase shout */
function classicAtsHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden}
body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#111}
.page{width:${W}px;height:${H}px;padding:40px 48px 28px}
h1{font-size:26px;font-weight:700;letter-spacing:-0.03em}
.contact{font-size:10.5px;margin-top:6px;color:#333;line-height:1.5}
.sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-top:14px;color:#0a0a0a}
.sec::after{content:"";display:block;height:1.5px;background:#0a0a0a;margin-top:4px}
li,p{font-size:10.8px;line-height:1.4} .job{margin-top:9px}
.row{display:flex;justify-content:space-between;gap:12px}
.role{font-size:11px;font-style:italic;margin-top:2px;color:#222}
ul{margin:4px 0 0 15px} li{margin-bottom:2.5px}
.skills div{font-size:10.8px;line-height:1.4;margin-bottom:2px}
</style></head><body><div class="page">
  <h1>Alexander Sharma</h1>
  <div class="contact">Bengaluru, India  ·  alex.sharma@email.com  ·  +91 98765 43210  ·  linkedin.com/in/alexsharma</div>
  <div class="sec">Summary</div>
  <p style="margin-top:6px">Software Engineer with 3+ years shipping TypeScript / React / Node systems. Strong on latency, reliability, and evidence-grounded product work — no fluff metrics.</p>
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><strong style="font-size:12px">TechNova Solutions — Software Engineer</strong><span style="font-size:10.5px">Jan 2023 – Present</span></div>${ul(BULLETS.exp1)}</div>
  <div class="job"><div class="row"><strong style="font-size:12px">CloudBridge Labs — Software Engineer Intern</strong><span style="font-size:10.5px">May 2022 – Dec 2022</span></div>${ul(BULLETS.exp2)}</div>
  <div class="sec">Education</div>
  <div class="job"><div class="row"><strong style="font-size:12px">Visvesvaraya Technological University</strong><span style="font-size:10.5px">2018 – 2022</span></div>
    <div class="role">B.E. Computer Science &amp; Engineering · GPA 8.7/10</div></div>
  <div class="sec">Skills</div>
  <div class="skills" style="margin-top:6px">
    <div><strong>Languages:</strong> TypeScript, JavaScript, Python, SQL, Java</div>
    <div><strong>Stack:</strong> React, Next.js, NestJS, PostgreSQL, Redis, AWS, Docker</div>
  </div>
</div></body></html>`;
}

/** Awesome CV — two-tone name + thin accent rules under section titles only (never through contact) */
function awesomeCvHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden}
body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#1a1a1a}
.page{width:${W}px;height:${H}px;padding:34px 44px 24px}
h1{font-size:32px;font-weight:300;text-align:center;letter-spacing:-0.02em;color:#374151}
h1 .last{color:#b91c1c;font-weight:800;text-transform:uppercase}
.headline{text-align:center;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#b91c1c;margin-top:6px}
.contact{text-align:center;font-size:10.5px;margin-top:8px;color:#444;line-height:1.45;border:0;text-decoration:none}
.sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;margin-top:12px;color:#b91c1c}
.sec::after{content:"";display:block;height:1.5px;width:100%;background:#b91c1c;margin-top:3px}
li{font-size:10.6px;line-height:1.36} .job{margin-top:7px}
.row{display:flex;justify-content:space-between;gap:12px}
.role{font-size:11px;font-style:italic;margin-top:1px}
ul{margin:3px 0 0 16px} li{margin-bottom:2px}
.skills{margin-top:5px;font-size:10.6px;line-height:1.4}
</style></head><body><div class="page">
  <h1>Alexander <span class="last">Sharma</span></h1>
  <div class="headline">Software Engineer</div>
  <div class="contact">Bengaluru, India · alex.sharma@email.com · +91 98765 43210 · linkedin.com/in/alexsharma · github.com/alexsharma</div>
  <div class="sec">Education</div>
  <div class="job"><div class="row"><strong style="font-size:12px">Visvesvaraya Technological University</strong><span style="font-size:10.5px">Aug 2018 – May 2022</span></div>
    <div class="role">B.E. Computer Science &amp; Engineering · GPA 8.7/10 · Dean’s List</div>
    <div style="font-size:10.5px;margin-top:2px;color:#333"><strong>Coursework:</strong> Data Structures, Algorithms, Databases, OS, Networks, Software Engineering</div></div>
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><strong style="font-size:12px">TechNova Solutions</strong><span style="font-size:10.5px">Jan 2023 – Present</span></div>
    <div class="role">Software Engineer — Bengaluru, India</div>${ul(BULLETS.exp1)}</div>
  <div class="job"><div class="row"><strong style="font-size:12px">CloudBridge Labs</strong><span style="font-size:10.5px">May 2022 – Dec 2022</span></div>
    <div class="role">Software Engineer Intern — Hyderabad, India</div>${ul(BULLETS.exp2)}</div>
  <div class="job"><div class="row"><strong style="font-size:12px">Independent</strong><span style="font-size:10.5px">Jan 2021 – Apr 2022</span></div>
    <div class="role">Freelance Full-Stack Developer — Remote</div>${ul(BULLETS.exp3)}</div>
  <div class="sec">Projects</div>
  <div class="job"><div class="row"><strong style="font-size:12px">HypeResume ATS Engine</strong><span style="font-size:10.5px">2024</span></div>
    <ul><li>Deterministic ATS scoring + selectable PDF text verification for production exports.</li></ul></div>
  <div class="job"><div class="row"><strong style="font-size:12px">Realtime Collab Board</strong><span style="font-size:10.5px">2023</span></div>
    <ul><li>WebSocket canvas with presence, CRDT-style merges, and sub-100ms sync under 50 concurrent users.</li></ul></div>
  <div class="sec">Skills</div>
  <div class="skills">
    <div><strong>Languages:</strong> TypeScript, JavaScript, Python, SQL, Java</div>
    <div><strong>Stack:</strong> React, Next.js, NestJS, PostgreSQL, Redis, AWS, Docker, Playwright</div>
  </div>
</div></body></html>`;
}

/** Modern Tech — blue accent bar under name, skill pills */
function modernTechHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden}
body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#0f172a}
.page{width:${W}px;height:${H}px;padding:36px 44px 28px}
h1{font-size:28px;font-weight:700;letter-spacing:-0.04em}
.bar{height:3px;width:72px;background:#2563eb;margin:10px 0 12px;border-radius:2px}
.contact{font-size:10.5px;color:#475569}
.sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-top:14px;color:#2563eb}
.sec::after{content:"";display:block;height:1px;background:#e2e8f0;margin-top:4px}
li{font-size:10.8px;line-height:1.38} .job{margin-top:8px}
.row{display:flex;justify-content:space-between;gap:12px}
.role{font-size:11px;color:#334155;margin-top:1px}
ul{margin:3px 0 0 16px} li{margin-bottom:2px}
.pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.pill{font-size:10px;padding:4px 9px;border-radius:999px;background:#eff6ff;color:#1e40af;font-weight:600}
</style></head><body><div class="page">
  <h1>Alexander Sharma</h1>
  <div class="bar"></div>
  <div class="contact">Bengaluru, India · alex.sharma@email.com · +91 98765 43210 · linkedin.com/in/alexsharma</div>
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><strong style="font-size:12px">TechNova Solutions · Software Engineer</strong><span style="font-size:10.5px">2023 – Present</span></div>${ul(BULLETS.exp1)}</div>
  <div class="job"><div class="row"><strong style="font-size:12px">CloudBridge Labs · Intern</strong><span style="font-size:10.5px">2022</span></div>${ul(BULLETS.exp2)}</div>
  <div class="sec">Education</div>
  <div class="job"><div class="row"><strong style="font-size:12px">VTU · B.E. CSE</strong><span style="font-size:10.5px">2018 – 2022</span></div>
    <div class="role">GPA 8.7/10 · Dean’s List · Algorithms, Databases, Networks</div></div>
  <div class="sec">Skills</div>
  <div class="pills">
    <span class="pill">TypeScript</span><span class="pill">Next.js</span><span class="pill">NestJS</span>
    <span class="pill">PostgreSQL</span><span class="pill">Redis</span><span class="pill">AWS</span>
    <span class="pill">Docker</span><span class="pill">Playwright</span>
  </div>
</div></body></html>`;
}

/** Ivy League — heavy serif, centered classic academic */
function ivyLeagueHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden}
body{font-family:Georgia,"Times New Roman",serif;color:#111}
.page{width:${W}px;height:${H}px;padding:42px 52px 28px}
h1{font-size:30px;font-weight:700;text-align:center;letter-spacing:0.04em}
.rule{border:0;border-top:1px solid #111;margin:10px auto;width:100%}
.contact{text-align:center;font-size:10.5px;font-style:italic;color:#333}
.sec{font-size:12px;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:0.18em;margin-top:14px}
.sec::after{content:"";display:block;height:1px;background:#111;margin-top:5px}
li{font-size:11px;line-height:1.4} .job{margin-top:8px}
.row{display:flex;justify-content:space-between;gap:12px;font-size:12px}
.role{font-size:11px;font-style:italic;margin-top:1px}
ul{margin:3px 0 0 16px} li{margin-bottom:2px}
</style></head><body><div class="page">
  <h1>Alexander Sharma</h1>
  <hr class="rule"/>
  <div class="contact">Bengaluru, India · alex.sharma@email.com · +91 98765 43210</div>
  <div class="sec">Education</div>
  <div class="job"><div class="row"><strong>Visvesvaraya Technological University</strong><span>2018 – 2022</span></div>
    <div class="role">B.E. Computer Science &amp; Engineering · GPA 8.7/10 · Dean’s List</div></div>
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><strong>TechNova Solutions</strong><span>Jan 2023 – Present</span></div>
    <div class="role">Software Engineer — Bengaluru</div>${ul(BULLETS.exp1.slice(0, 4))}</div>
  <div class="job"><div class="row"><strong>CloudBridge Labs</strong><span>May – Dec 2022</span></div>
    <div class="role">Software Engineer Intern — Hyderabad</div>${ul(BULLETS.exp2)}</div>
  <div class="sec">Leadership &amp; Projects</div>
  <div class="job"><div class="row"><strong>HypeResume ATS Engine</strong><span>2024</span></div>
    <ul><li>Built deterministic ATS scoring for selectable-text PDF exports used in production resumes.</li></ul></div>
</div></body></html>`;
}

/** Executive — wide header band, leadership framing */
function executiveHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden}
body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#111}
.page{width:${W}px;height:${H}px;background:#fff}
.band{background:#0f172a;color:#fff;padding:28px 44px 24px}
h1{font-size:26px;font-weight:700;letter-spacing:-0.02em}
.sub{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;margin-top:6px}
.contact{font-size:10.5px;color:#cbd5e1;margin-top:10px}
.body{padding:22px 44px 28px}
.sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-top:12px;color:#0f172a}
.sec::after{content:"";display:block;height:1.5px;background:#0f172a;margin-top:4px}
li{font-size:10.8px;line-height:1.38} .job{margin-top:8px}
.row{display:flex;justify-content:space-between;gap:12px}
ul{margin:3px 0 0 16px} li{margin-bottom:2px}
</style></head><body><div class="page">
  <div class="band">
    <h1>Alexander Sharma</h1>
    <div class="sub">Software Engineer · Platform &amp; Product</div>
    <div class="contact">Bengaluru · alex.sharma@email.com · +91 98765 43210 · linkedin.com/in/alexsharma</div>
  </div>
  <div class="body">
    <div class="sec">Leadership Summary</div>
    <p style="margin-top:6px;font-size:11px;line-height:1.45">Engineer focused on shipping reliable hiring infrastructure. Led cross-functional delivery on matching, ATS exports, and latency work with measurable conversion impact.</p>
    <div class="sec">Experience</div>
    <div class="job"><div class="row"><strong style="font-size:12px">TechNova Solutions — Software Engineer</strong><span style="font-size:10.5px">2023 – Present</span></div>${ul(BULLETS.exp1)}</div>
    <div class="job"><div class="row"><strong style="font-size:12px">CloudBridge Labs — Intern</strong><span style="font-size:10.5px">2022</span></div>${ul(BULLETS.exp2)}</div>
    <div class="sec">Credentials</div>
    <p style="margin-top:6px;font-size:10.8px;line-height:1.45"><strong>VTU</strong> — B.E. CSE, GPA 8.7/10 · TypeScript, NestJS, PostgreSQL, AWS, Docker</p>
  </div>
</div></body></html>`;
}

/** Crest — teal header accent block */
function crestHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden}
body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#111}
.page{width:${W}px;height:${H}px}
.crest{background:linear-gradient(135deg,#0f766e,#115e59);color:#fff;padding:32px 44px 26px}
h1{font-size:27px;font-weight:700}
.contact{font-size:10.5px;margin-top:8px;opacity:0.92}
.body{padding:20px 44px 28px}
.sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-top:12px;color:#0f766e}
.sec::after{content:"";display:block;height:1px;background:#ccfbf1;margin-top:4px}
li{font-size:10.8px;line-height:1.38} .job{margin-top:8px}
.row{display:flex;justify-content:space-between;gap:12px}
ul{margin:3px 0 0 16px} li{margin-bottom:2px}
</style></head><body><div class="page">
  <div class="crest">
    <h1>Alexander Sharma</h1>
    <div class="contact">Bengaluru, India · alex.sharma@email.com · +91 98765 43210 · github.com/alexsharma</div>
  </div>
  <div class="body">
    <div class="sec">Experience</div>
    <div class="job"><div class="row"><strong style="font-size:12px">TechNova Solutions</strong><span style="font-size:10.5px">Jan 2023 – Present</span></div>
      <div style="font-size:11px;font-style:italic;margin-top:1px">Software Engineer</div>${ul(BULLETS.exp1)}</div>
    <div class="job"><div class="row"><strong style="font-size:12px">CloudBridge Labs</strong><span style="font-size:10.5px">2022</span></div>
      <div style="font-size:11px;font-style:italic;margin-top:1px">Software Engineer Intern</div>${ul(BULLETS.exp2)}</div>
    <div class="sec">Education &amp; Skills</div>
    <p style="margin-top:6px;font-size:10.8px;line-height:1.45"><strong>VTU</strong> B.E. CSE (8.7/10) · TypeScript, Next.js, NestJS, PostgreSQL, Redis, AWS, Docker</p>
  </div>
</div></body></html>`;
}

/** Deedy — light gray 32% sidebar, dense right column (no overlays) */
function deedyHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#111}
.page{display:flex;width:${W}px;height:${H}px;isolation:isolate}
.side{width:32%;background:#f6f7f9;padding:28px 18px;border-right:1px solid #e5e7eb;z-index:1}
.main{width:68%;padding:28px 24px;background:#fff;z-index:1;overflow:hidden}
h1{font-size:20px;line-height:1.15;font-weight:800;text-transform:uppercase;letter-spacing:-0.02em}
.hl{color:#2563eb;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-top:6px}
.st{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin:14px 0 6px;color:#0f172a}
.sb{font-size:10px;line-height:1.38;color:#334155;margin-bottom:5px;word-break:break-word}
.sec{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px solid #0f172a;padding-bottom:3px;margin:10px 0 6px}
.sec:first-child{margin-top:0}
p,li{font-size:10.4px;line-height:1.34} ul{margin:2px 0 0 13px} li{margin-bottom:2px}
.row{display:flex;justify-content:space-between;gap:8px}.job{margin-bottom:7px}
</style></head><body><div class="page">
<aside class="side">
  <h1>Alexander<br/>Sharma</h1>
  <div class="hl">Software Engineer</div>
  <div class="st">Contact</div>
  <div class="sb">Bengaluru, India</div>
  <div class="sb">alex.sharma@email.com</div>
  <div class="sb">+91 98765 43210</div>
  <div class="sb">linkedin.com/in/alexsharma</div>
  <div class="sb">github.com/alexsharma</div>
  <div class="st">Education</div>
  <div class="sb"><strong>VTU</strong><br/>B.E. CSE · 2018–2022<br/>GPA 8.7/10 · Dean’s List</div>
  <div class="sb"><strong>Coursework</strong><br/>DSA, Algorithms, DB, OS, Networks</div>
  <div class="st">Skills</div>
  <div class="sb"><strong>Languages</strong><br/>TypeScript, JS, Python, SQL, Java</div>
  <div class="sb"><strong>Frontend</strong><br/>React, Next.js, Tailwind, Redux</div>
  <div class="sb"><strong>Backend</strong><br/>Node, Express, NestJS, Postgres, Redis, Prisma</div>
  <div class="sb"><strong>DevOps</strong><br/>AWS, Docker, GitHub Actions, Nginx, Linux</div>
  <div class="st">Links</div>
  <div class="sb">Portfolio · Open source · Blog</div>
</aside>
<main class="main">
  <div class="sec">Summary</div>
  <p>Full-Stack Software Engineer with 3+ years building scalable TypeScript / React / Next.js / NestJS systems. Proven impact on latency, conversion, and reliability — evidence over fluff.</p>
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">Software Engineer — TechNova</strong><span style="font-size:10px">Jan 2023 – Present</span></div>
  ${ul(BULLETS.exp1)}</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">Intern — CloudBridge Labs</strong><span style="font-size:10px">May–Dec 2022</span></div>
  ${ul(BULLETS.exp2)}</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">Freelance Full-Stack</strong><span style="font-size:10px">2021–2022</span></div>
  ${ul(BULLETS.exp3)}</div>
  <div class="sec">Projects</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">HypeResume ATS Engine</strong><span style="font-size:10px">2024</span></div>
  <ul><li>Deterministic ATS scoring + selectable PDF text verification for production exports.</li></ul></div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">Realtime Collab Board</strong><span style="font-size:10px">2023</span></div>
  <ul><li>WebSocket canvas with presence and sub-100ms sync for 50 concurrent users.</li></ul></div>
</main>
</div></body></html>`;
}

/** Double column — intentional navy left rail; rules stay inside main only */
function doubleColumnHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden;font-family:Helvetica,Arial,sans-serif}
.page{display:flex;width:${W}px;height:${H}px;isolation:isolate}
.side{width:30%;background:#1e3a8a;color:#fff;padding:28px 18px;z-index:1;flex-shrink:0}
.main{width:70%;padding:28px 24px;color:#111;background:#fff;z-index:1;overflow:hidden;flex-shrink:0}
h1{font-size:19px;font-weight:700;line-height:1.2}
.hl{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#93c5fd;margin-top:8px;font-weight:700}
.st{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin:14px 0 6px;color:#bfdbfe}
.sb{font-size:10px;line-height:1.38;color:#e2e8f0;margin-bottom:5px}
.sec{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px solid #1e3a8a;padding-bottom:3px;margin:10px 0 6px;color:#1e3a8a}
p,li{font-size:10.4px;line-height:1.34} ul{margin:2px 0 0 13px} li{margin-bottom:2px}
.row{display:flex;justify-content:space-between;gap:8px}.job{margin-bottom:7px}
</style></head><body><div class="page">
<aside class="side">
  <h1>Alexander Sharma</h1>
  <div class="hl">Software Engineer</div>
  <div class="st">Contact</div>
  <div class="sb">Bengaluru, India</div>
  <div class="sb">alex.sharma@email.com</div>
  <div class="sb">+91 98765 43210</div>
  <div class="sb">linkedin.com/in/alexsharma</div>
  <div class="sb">github.com/alexsharma</div>
  <div class="st">Core Skills</div>
  <div class="sb">TypeScript · React · Next.js</div>
  <div class="sb">NestJS · PostgreSQL · Redis</div>
  <div class="sb">AWS · Docker · CI/CD</div>
  <div class="sb">Playwright · Prisma · Nginx</div>
  <div class="st">Education</div>
  <div class="sb"><strong>VTU</strong><br/>B.E. CSE · GPA 8.7/10<br/>2018 – 2022 · Dean’s List</div>
  <div class="st">Coursework</div>
  <div class="sb">DSA · Algorithms · Databases · OS · Networks</div>
</aside>
<main class="main">
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">TechNova Solutions</strong><span style="font-size:10px">2023 – Present</span></div>
  <div style="font-size:10.5px;font-style:italic;margin:2px 0 3px">Software Engineer</div>${ul(BULLETS.exp1)}</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">CloudBridge Labs</strong><span style="font-size:10px">2022</span></div>
  <div style="font-size:10.5px;font-style:italic;margin:2px 0 3px">Software Engineer Intern</div>${ul(BULLETS.exp2)}</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">Independent</strong><span style="font-size:10px">2021 – 2022</span></div>
  <div style="font-size:10.5px;font-style:italic;margin:2px 0 3px">Freelance Full-Stack</div>${ul(BULLETS.exp3)}</div>
  <div class="sec">Projects</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">HypeResume ATS Engine</strong><span style="font-size:10px">2024</span></div>
  <ul><li>Deterministic ATS scoring and selectable PDF verification for production resumes.</li></ul></div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">Realtime Collab Board</strong><span style="font-size:10px">2023</span></div>
  <ul><li>Multiplayer canvas with presence and sub-100ms sync under 50 concurrent users.</li></ul></div>
</main>
</div></body></html>`;
}

/** Elegant — dark navy sidebar, dense main column */
function elegantHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#fff;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#111}
.page{display:flex;width:${W}px;height:${H}px;isolation:isolate}
.side{width:34%;background:#0b1220;color:#e2e8f0;padding:28px 18px;z-index:1;flex-shrink:0}
.main{width:66%;padding:28px 24px;background:#fff;z-index:1;overflow:hidden;flex-shrink:0}
h1{font-size:20px;font-weight:700;color:#fff}
.hl{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7dd3fc;margin-top:8px;font-weight:700}
.st{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin:14px 0 6px;color:#94a3b8}
.sb{font-size:10px;line-height:1.4;margin-bottom:5px}
.sec{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;border-bottom:1.5px solid #0b1220;padding-bottom:3px;margin:10px 0 6px}
p,li{font-size:10.4px;line-height:1.34}
ul{margin:2px 0 0 13px} li{margin-bottom:2px}
.row{display:flex;justify-content:space-between;gap:8px}.job{margin-bottom:7px}
</style></head><body><div class="page">
<aside class="side">
  <h1>Alexander Sharma</h1>
  <div class="hl">Software Engineer</div>
  <div class="st">Contact</div>
  <div class="sb">Bengaluru, India</div>
  <div class="sb">alex.sharma@email.com</div>
  <div class="sb">+91 98765 43210</div>
  <div class="sb">github.com/alexsharma</div>
  <div class="sb">linkedin.com/in/alexsharma</div>
  <div class="st">Expertise</div>
  <div class="sb">Full-stack TypeScript</div>
  <div class="sb">Platform reliability</div>
  <div class="sb">ATS-safe document design</div>
  <div class="sb">Evidence-grounded matching</div>
  <div class="st">Education</div>
  <div class="sb"><strong>VTU</strong> — B.E. CSE<br/>GPA 8.7/10 · 2018–2022<br/>Dean’s List</div>
  <div class="st">Stack</div>
  <div class="sb">React · Next.js · NestJS<br/>Postgres · Redis · AWS · Docker</div>
</aside>
<main class="main">
  <div class="sec">Experience</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">TechNova Solutions</strong><span style="font-size:10px">2023 – Present</span></div>
  <div style="font-size:10.5px;font-style:italic;margin:2px 0 3px">Software Engineer</div>${ul(BULLETS.exp1)}</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">CloudBridge Labs</strong><span style="font-size:10px">2022</span></div>
  <div style="font-size:10.5px;font-style:italic;margin:2px 0 3px">Software Engineer Intern</div>${ul(BULLETS.exp2)}</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">Independent</strong><span style="font-size:10px">2021 – 2022</span></div>
  <div style="font-size:10.5px;font-style:italic;margin:2px 0 3px">Freelance Full-Stack</div>${ul(BULLETS.exp3)}</div>
  <div class="sec">Selected Impact</div>
  <ul>
    <li><strong>38%</strong> p95 latency reduction via Postgres + Redis.</li>
    <li><strong>+14%</strong> free-to-paid from evidence-based JD matching.</li>
    <li><strong>41% → 86%</strong> critical-path test coverage.</li>
    <li><strong>12K+</strong> MAUs on hiring platform at 99.9% uptime.</li>
  </ul>
  <div class="sec">Projects</div>
  <div class="job"><div class="row"><strong style="font-size:11.5px">HypeResume ATS Engine</strong><span style="font-size:10px">2024</span></div>
  <ul><li>Deterministic ATS scoring + selectable PDF verification.</li></ul></div>
</main>
</div></body></html>`;
}

const JOBS: Array<{ file: string; html: string }> = [
  { file: 'jake-ats.png', html: jakeHtml() },
  { file: 'classic-ats.png', html: classicAtsHtml() },
  { file: 'awesome-cv.png', html: awesomeCvHtml() },
  { file: 'clean-modern.png', html: modernTechHtml() },
  { file: 'ivy-league.png', html: ivyLeagueHtml() },
  { file: 'executive.png', html: executiveHtml() },
  { file: 'crest.png', html: crestHtml() },
  { file: 'deedy.png', html: deedyHtml() },
  { file: 'double-column.png', html: doubleColumnHtml() },
  { file: 'elegant.png', html: elegantHtml() },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(HERO, { recursive: true });

  const erikSrc = path.join(ROOT, 'assets/SWErikCodes_Resume.webp');
  if (fs.existsSync(erikSrc)) {
    fs.copyFileSync(erikSrc, path.join(HERO, 'erik-source.webp'));
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none', '--hide-scrollbars'],
  });

  try {
    for (const job of JOBS) {
      const page = await browser.newPage();
      await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
      await page.setContent(job.html, { waitUntil: 'networkidle0' });
      const dest = path.join(OUT, job.file);
      await page.screenshot({
        path: dest as `${string}.png`,
        type: 'png',
        clip: { x: 0, y: 0, width: W, height: H },
      });
      console.log('✓', path.relative(ROOT, dest));
      await page.close();
    }

    fs.copyFileSync(path.join(OUT, 'jake-ats.png'), path.join(HERO, 'jake-alex.png'));
    console.log('✓ hero/jake-alex.png');
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
