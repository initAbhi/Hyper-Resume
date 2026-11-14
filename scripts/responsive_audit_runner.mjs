import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001/api/v1';

const VIEWPORTS = [
  { name: '320px', width: 320, height: 600 },
  { name: '375px', width: 375, height: 667 },
  { name: '390px', width: 390, height: 844 },
  { name: '414px', width: 414, height: 896 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1280px', width: 1280, height: 800 },
  { name: '1440px', width: 1440, height: 900 }
];

const ROUTES = [
  // Public
  { path: '/', auth: 'none', name: 'landing' },
  { path: '/pricing', auth: 'none', name: 'pricing' },
  { path: '/privacy', auth: 'none', name: 'privacy' },
  { path: '/terms', auth: 'none', name: 'terms' },
  { path: '/security', auth: 'none', name: 'security' },
  { path: '/examples', auth: 'none', name: 'examples-index' },
  { path: '/examples/software-engineer', auth: 'none', name: 'examples-detail' },
  { path: '/tools/resume-checker', auth: 'none', name: 'tools-resume-checker' },
  { path: '/tools/bullet-improver', auth: 'none', name: 'tools-bullet-improver' },
  { path: '/tools/job-match', auth: 'none', name: 'tools-job-match' },
  { path: '/tools/resume-score', auth: 'none', name: 'tools-resume-score' },

  // Auth
  { path: '/login', auth: 'none', name: 'auth-login' },
  { path: '/register', auth: 'none', name: 'auth-register' },
  { path: '/forgot-password', auth: 'none', name: 'auth-forgot-password' },
  { path: '/reset-password', auth: 'none', name: 'auth-reset-password' },

  // App User
  { path: '/app', auth: 'user', name: 'app-dashboard' },
  { path: '/app/resumes', auth: 'user', name: 'app-resumes' },
  { path: '/app/resumes/94694cea-f724-4062-a90e-7ad92fc2cde5', auth: 'user', name: 'app-resume-editor' },
  { path: '/app/cover-letters', auth: 'user', name: 'app-cover-letters' },
  { path: '/app/applications', auth: 'user', name: 'app-applications' },
  { path: '/app/match', auth: 'user', name: 'app-match' },
  { path: '/app/job-search', auth: 'user', name: 'app-job-search' },
  { path: '/app/interview', auth: 'user', name: 'app-interview' },
  { path: '/app/linkedin', auth: 'user', name: 'app-linkedin' },
  { path: '/app/samples', auth: 'user', name: 'app-samples' },
  { path: '/app/settings', auth: 'user', name: 'app-settings' },

  // Admin
  { path: '/admin', auth: 'admin', name: 'admin-dashboard' },
  { path: '/admin/users', auth: 'admin', name: 'admin-users' },
  { path: '/admin/resumes', auth: 'admin', name: 'admin-resumes' },
  { path: '/admin/payments', auth: 'admin', name: 'admin-payments' },
  { path: '/admin/settings', auth: 'admin', name: 'admin-settings' },

  // Share slug
  { path: '/r/demo-candidate-full-stack', auth: 'none', name: 'public-share-view' }
];

async function getTokens() {
  const userRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@hyperresume.ai', password: 'demo123' })
  });
  const userData = await userRes.json();

  const adminRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@hyperresume.ai', password: 'admin123' })
  });
  const adminData = await adminRes.json();

  return {
    user: userData?.data?.tokens,
    admin: adminData?.data?.tokens
  };
}

async function runAudit() {
  const screenshotsDir = path.resolve('context/artifacts/screenshots/mobile_responsive');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Authenticating accounts...');
  const tokens = await getTokens();
  console.log('User token available:', !!tokens.user?.accessToken);
  console.log('Admin token available:', !!tokens.admin?.accessToken);

  const browser = await chromium.launch();
  const results = [];

  // Filter routes if CLI argument provided
  const targetRoute = process.argv[2];
  const targetViewport = process.argv[3];

  const routesToTest = targetRoute
    ? ROUTES.filter(r => r.path === targetRoute || r.name === targetRoute)
    : ROUTES;

  const viewportsToTest = targetViewport
    ? VIEWPORTS.filter(v => v.name === targetViewport || `${v.width}px` === targetViewport)
    : VIEWPORTS;

  console.log(`Auditing ${routesToTest.length} routes across ${viewportsToTest.length} viewports...`);

  for (const route of routesToTest) {
    console.log(`\nTesting Route: ${route.path} (${route.name})`);

    for (const vp of viewportsToTest) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: vp.width < 768
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      // Inject auth if needed
      if (route.auth === 'user' && tokens.user) {
        await context.addInitScript((t) => {
          localStorage.setItem('hr_access_token', t.accessToken);
          localStorage.setItem('hr_refresh_token', t.refreshToken);
        }, tokens.user);
      } else if (route.auth === 'admin' && tokens.admin) {
        await context.addInitScript((t) => {
          localStorage.setItem('hr_access_token', t.accessToken);
          localStorage.setItem('hr_refresh_token', t.refreshToken);
        }, tokens.admin);
      }

      const page = await context.newPage();
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'load', timeout: 15000 });
        // Wait a short moment for client hydration and animations
        await page.waitForTimeout(800);

        const audit = await page.evaluate((vpWidth) => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasOverflow = scrollWidth > clientWidth + 1;

          // Find overflowing elements
          const overflowingElements = [];
          const all = document.querySelectorAll('*');
          all.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > clientWidth + 1.5 || rect.left < -1.5) {
              const style = window.getComputedStyle(el);
              if (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                rect.width > 0 &&
                rect.height > 0
              ) {
                // Don't report if parent is an intentionally horizontal scrollable container
                let parent = el.parentElement;
                let isInsideScrollable = false;
                while (parent && parent !== document.body) {
                  const pStyle = window.getComputedStyle(parent);
                  if (pStyle.overflowX === 'auto' || pStyle.overflowX === 'scroll' || pStyle.overflow === 'hidden') {
                    isInsideScrollable = true;
                    break;
                  }
                  parent = parent.parentElement;
                }

                if (!isInsideScrollable) {
                  overflowingElements.push({
                    tag: el.tagName.toLowerCase(),
                    id: el.id || undefined,
                    class: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
                    rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }
                  });
                }
              }
            }
          });

          // Check small touch targets on mobile (< 768px)
          const smallTouchTargets = [];
          if (vpWidth < 768) {
            const clickables = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
            clickables.forEach(c => {
              const rect = c.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                if ((rect.width < 32 || rect.height < 32) && !c.closest('.lucide')) {
                  smallTouchTargets.push({
                    tag: c.tagName.toLowerCase(),
                    text: (c.textContent || '').trim().slice(0, 30),
                    size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
                  });
                }
              }
            });
          }

          return {
            scrollWidth,
            clientWidth,
            hasOverflow,
            overflowingElements: overflowingElements.slice(0, 5),
            smallTouchTargetsCount: smallTouchTargets.length,
            sampleSmallTargets: smallTouchTargets.slice(0, 3)
          };
        }, vp.width);

        const screenshotPath = path.join(screenshotsDir, `${route.name}_${vp.name}.png`);
        // Capture screenshot (skip fullPage on large desktop to keep run fast, or fullPage on mobile)
        await page.screenshot({ path: screenshotPath, fullPage: false });

        const result = {
          route: route.path,
          name: route.name,
          viewport: vp.name,
          width: vp.width,
          status: audit.hasOverflow ? 'FAIL_OVERFLOW' : 'PASS',
          scrollWidth: audit.scrollWidth,
          clientWidth: audit.clientWidth,
          overflowDelta: audit.scrollWidth - audit.clientWidth,
          overflowingElements: audit.overflowingElements,
          smallTouchTargetsCount: audit.smallTouchTargetsCount
        };

        results.push(result);
        if (result.status === 'FAIL_OVERFLOW') {
          console.log(`  ❌ [${vp.name}] OVERFLOW by ${result.overflowDelta}px (${audit.scrollWidth}px > ${audit.clientWidth}px)`);
          if (audit.overflowingElements.length > 0) {
            console.log(`     Culprits:`, JSON.stringify(audit.overflowingElements));
          }
        } else {
          console.log(`  ✅ [${vp.name}] PASS`);
        }
      } catch (err) {
        console.log(`  ⚠️ [${vp.name}] Error loading page: ${err.message}`);
        results.push({
          route: route.path,
          name: route.name,
          viewport: vp.name,
          width: vp.width,
          status: 'ERROR',
          error: err.message
        });
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();

  fs.writeFileSync('scripts/audit_results.json', JSON.stringify(results, null, 2));
  console.log('\nAudit complete! Saved results to scripts/audit_results.json');

  const totalRuns = results.length;
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL_OVERFLOW').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  console.log(`\nSummary: Total ${totalRuns} | Pass: ${passes} | Overflow Fails: ${fails} | Errors: ${errors}`);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
