import fs from 'node:fs';
import crypto from 'node:crypto';
import { TEN_PERSONAS } from './helpers/personas';
import {
  apiRequest,
  ensureScreenshotDir,
  QA_SESSION_FILE,
  type QaSessionState,
} from './helpers/qa-env';

export default async function globalSetup(): Promise<void> {
  ensureScreenshotDir();

  const runId = `${Date.now().toString(36)}_${crypto.randomBytes(2).toString('hex')}`;
  const email = `qa_human_sim_${runId}@test.io`;
  const password = 'QaHumanSimPassword123!';

  // 1. Sign up isolated primary QA user
  const signup = await apiRequest('/auth/signup', {
    method: 'POST',
    body: {
      email,
      password,
      fullName: 'HyperResume QA Persona Runner',
    },
  });
  if (signup.status !== 201 || !signup.data?.tokens?.accessToken) {
    throw new Error(`Failed to provision primary QA user: HTTP ${signup.status} ${JSON.stringify(signup.json)}`);
  }
  const userId = signup.data.user.id as string;
  const accessToken = signup.data.tokens.accessToken as string;
  const refreshToken = (signup.data.tokens.refreshToken as string) || '';

  // 2. Sign up isolated secondary QA user (for cross-user ownership probes)
  const secondaryEmail = `qa_secondary_${runId}@test.io`;
  const signup2 = await apiRequest('/auth/signup', {
    method: 'POST',
    body: {
      email: secondaryEmail,
      password,
      fullName: 'HyperResume Secondary Tenant QA',
    },
  });
  if (signup2.status !== 201 || !signup2.data?.tokens?.accessToken) {
    throw new Error(`Failed to provision secondary QA user: HTTP ${signup2.status}`);
  }
  const secondaryUserId = signup2.data.user.id as string;
  const secondaryAccessToken = signup2.data.tokens.accessToken as string;

  // 3. Seed all 10 synthetic Resume Personas via real API
  const personaResumeIds: Record<string, string> = {};
  for (const persona of TEN_PERSONAS) {
    const createRes = await apiRequest('/resumes', {
      method: 'POST',
      token: accessToken,
      body: {
        name: persona.name,
        targetRole: persona.targetRole,
        templateKey: persona.templateKey,
        content: persona.content,
      },
    });
    if (createRes.status !== 201 || !createRes.data?.id) {
      throw new Error(
        `Failed to seed ${persona.key}: HTTP ${createRes.status} ${JSON.stringify(createRes.json)}`,
      );
    }
    personaResumeIds[persona.key] = createRes.data.id as string;
  }

  const session: QaSessionState = {
    runId,
    userId,
    email,
    password,
    accessToken,
    refreshToken,
    secondaryUserId,
    secondaryEmail,
    secondaryAccessToken,
    personaResumeIds,
  };

  fs.writeFileSync(QA_SESSION_FILE, JSON.stringify(session, null, 2), 'utf8');
  console.log(`[QA globalSetup] Provisioned user ${email} with ${Object.keys(personaResumeIds).length} personas.`);
}

