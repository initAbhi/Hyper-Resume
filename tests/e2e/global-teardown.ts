import fs from 'node:fs';
import { apiRequest, QA_SESSION_FILE, type QaSessionState } from './helpers/qa-env';

export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(QA_SESSION_FILE)) return;
  try {
    const session = JSON.parse(fs.readFileSync(QA_SESSION_FILE, 'utf8')) as QaSessionState;
    // Clean up all synthetic resumes created during this QA run via authenticated API
    const listRes = await apiRequest<any[]>('/resumes', { token: session.accessToken });
    const items = Array.isArray(listRes.data) ? listRes.data : (listRes.data as any)?.items || [];
    for (const r of items) {
      if (r?.id) {
        await apiRequest(`/resumes/${r.id}`, {
          method: 'DELETE',
          token: session.accessToken,
        }).catch(() => undefined);
      }
    }
    console.log(`[QA globalTeardown] Cleaned ${items.length} synthetic QA resumes for ${session.email}.`);
  } catch (err) {
    console.warn('[QA globalTeardown] Warning:', err);
  } finally {
    try {
      fs.unlinkSync(QA_SESSION_FILE);
    } catch {
      // ignore
    }
  }
}

