#!/usr/bin/env node
/**
 * Sync HyperResume plan prices to Dodo (test + live).
 *
 * Base currency: USD (Tier 1)
 *   weekly $7.99 · monthly $14.99 · lifetime $24.99
 * Localized by_currency INR (Tier 2/3)
 *   weekly ₹149 · monthly ₹399 · lifetime ₹999
 *
 * Usage (on server or with env loaded):
 *   node scripts/sync-dodo-localized-pricing.mjs
 *   node scripts/sync-dodo-localized-pricing.mjs --mode=live_mode
 *   node scripts/sync-dodo-localized-pricing.mjs --mode=both
 */
import DodoPayments from 'dodopayments';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
loadEnvFile(path.join(root, '.env'));
loadEnvFile('/var/www/hyper-resume/backend/.env');

const PLAN_PRICES = {
  pro_weekly: { usd: 799, inr: 14900, label: '1 Week Pass' },
  pro_monthly: { usd: 1499, inr: 39900, label: '1 Month' },
  pro_lifetime: { usd: 2499, inr: 99900, label: 'Founding Lifetime' },
};

const catalogs = {
  test_mode: {
    pro_weekly: process.env.DODO_PRODUCT_ID_PRO_WEEKLY || 'pdt_0NrjXNXzQC0qMeRVF1gg6',
    pro_monthly: process.env.DODO_PRODUCT_ID_PRO_MONTHLY || 'pdt_0NrjXNbLAgT25sdWEPA6K',
    pro_lifetime: process.env.DODO_PRODUCT_ID_PRO_LIFETIME || 'pdt_0NrjXNli5cBsc4SjHICgg',
  },
  live_mode: {
    pro_weekly: process.env.DODO_LIVE_PRODUCT_ID_PRO_WEEKLY || 'pdt_0NrjXNubZdqtBlPiv8Q8u',
    pro_monthly: process.env.DODO_LIVE_PRODUCT_ID_PRO_MONTHLY || 'pdt_0NrjXNxpn2pqHNXjXYG83',
    pro_lifetime: process.env.DODO_LIVE_PRODUCT_ID_PRO_LIFETIME || 'pdt_0NrjXO4hqllHPCBF1LPCY',
  },
};

function argMode() {
  const arg = process.argv.find((a) => a.startsWith('--mode='));
  if (!arg) return 'both';
  return arg.split('=')[1] || 'both';
}

async function ensureInrRule(client, productId, amount) {
  const listed = await client.products.localizedPrices.list(productId);
  const items = listed.items || [];
  const existing = items.find(
    (item) => item.currency === 'INR' && item.mode === 'by_currency' && !item.country_code,
  );
  if (existing) {
    if (existing.amount !== amount) {
      await client.products.localizedPrices.update(existing.id, {
        product_id: productId,
        amount,
      });
      console.log(`  updated INR localized rule ${existing.id} → ${amount}`);
    } else {
      console.log(`  INR localized rule already ${amount}`);
    }
    return;
  }
  const created = await client.products.localizedPrices.create(productId, {
    currency: 'INR',
    amount,
  });
  console.log(`  created INR localized rule ${created.id} → ${amount}`);
}

async function syncProduct(client, planId, productId, prices) {
  console.log(`\n→ ${planId} (${productId}) ${prices.label}`);
  const current = await client.products.retrieve(productId);
  console.log(
    `  before: currency=${current.price?.currency || current.currency} amount=${current.price?.price ?? current.price?.amount ?? '?'} mode=${current.pricing_mode}`,
  );

  await client.products.update(productId, {
    price: {
      type: 'one_time_price',
      price: prices.usd,
      currency: 'USD',
      discount: 0,
      pay_what_you_want: false,
    },
    pricing_mode: 'by_currency',
  });

  await ensureInrRule(client, productId, prices.inr);

  const after = await client.products.retrieve(productId);
  console.log(
    `  after: currency=${after.price?.currency || after.currency} amount=${after.price?.price ?? after.price?.amount ?? '?'} mode=${after.pricing_mode}`,
  );
}

async function syncMode(mode) {
  const apiKey =
    mode === 'live_mode'
      ? process.env.DODO_PAYMENTS_LIVE_API_KEY || process.env.DODO_PAYMENTS_API_KEY
      : process.env.DODO_PAYMENTS_TEST_API_KEY || process.env.DODO_PAYMENTS_API_KEY;

  if (!apiKey) {
    console.error(`Skipping ${mode}: missing API key`);
    return;
  }

  console.log(`\n======== Syncing Dodo ${mode} ========`);
  const client = new DodoPayments({
    bearerToken: apiKey,
    environment: mode,
  });

  const catalog = catalogs[mode];
  for (const [planId, productId] of Object.entries(catalog)) {
    await syncProduct(client, planId, productId, PLAN_PRICES[planId]);
  }
}

const mode = argMode();
const modes = mode === 'both' ? ['test_mode', 'live_mode'] : [mode];

for (const m of modes) {
  try {
    await syncMode(m);
  } catch (err) {
    console.error(`FAILED ${m}:`, err?.message || err);
    if (err?.error) console.error(JSON.stringify(err.error, null, 2));
    process.exitCode = 1;
  }
}

console.log('\nDone.');
