import type { ResumeContent } from '@/lib/api-client';

export interface RoleDiffItem {
  label: string;
  status: 'added_on_restore' | 'removed_on_restore' | 'modified_bullets';
  detail: string;
}

export interface VersionDiffSummary {
  totalChanges: number;
  headlineChanged: boolean;
  summaryChanged: boolean;
  contactChanged: boolean;
  skillsAddedOnRestore: string[];
  skillsRemovedOnRestore: string[];
  changedRoles: RoleDiffItem[];
  educationChanged: boolean;
  projectsChanged: boolean;
  counts: {
    snapshotExperience: number;
    currentExperience: number;
    snapshotSkills: number;
    currentSkills: number;
    snapshotProjects: number;
    currentProjects: number;
    snapshotEducation: number;
    currentEducation: number;
  };
}

function normalizeStr(val?: string | null): string {
  return (val ?? '').trim();
}

function serializeBullets(bullets?: string[]): string {
  return (bullets ?? []).map((b) => b.trim()).filter(Boolean).join('\n');
}

export function computeVersionDiff(
  current: ResumeContent,
  snapshot: ResumeContent,
): VersionDiffSummary {
  const headlineChanged =
    normalizeStr(current.headline) !== normalizeStr(snapshot.headline);
  const summaryChanged =
    normalizeStr(current.summary) !== normalizeStr(snapshot.summary);

  const contactChanged =
    JSON.stringify({
      fullName: normalizeStr(current.contact?.fullName),
      email: normalizeStr(current.contact?.email),
      phone: normalizeStr(current.contact?.phone),
      location: normalizeStr(current.contact?.location),
      linkedinUrl: normalizeStr(current.contact?.linkedinUrl),
      githubUrl: normalizeStr(current.contact?.githubUrl),
      websiteUrl: normalizeStr(current.contact?.websiteUrl),
    }) !==
    JSON.stringify({
      fullName: normalizeStr(snapshot.contact?.fullName),
      email: normalizeStr(snapshot.contact?.email),
      phone: normalizeStr(snapshot.contact?.phone),
      location: normalizeStr(snapshot.contact?.location),
      linkedinUrl: normalizeStr(snapshot.contact?.linkedinUrl),
      githubUrl: normalizeStr(snapshot.contact?.githubUrl),
      websiteUrl: normalizeStr(snapshot.contact?.websiteUrl),
    });

  const currentSkills = (current.skills ?? [])
    .map((s) => normalizeStr(s.name))
    .filter(Boolean);
  const snapshotSkills = (snapshot.skills ?? [])
    .map((s) => normalizeStr(s.name))
    .filter(Boolean);

  const currentSkillSet = new Set(currentSkills.map((s) => s.toLowerCase()));
  const snapshotSkillSet = new Set(snapshotSkills.map((s) => s.toLowerCase()));

  const skillsAddedOnRestore = snapshotSkills.filter(
    (s) => !currentSkillSet.has(s.toLowerCase()),
  );
  const skillsRemovedOnRestore = currentSkills.filter(
    (s) => !snapshotSkillSet.has(s.toLowerCase()),
  );

  const currentExp = current.experience ?? [];
  const snapshotExp = snapshot.experience ?? [];
  const changedRoles: RoleDiffItem[] = [];

  const expKey = (e: { title?: string; company?: string }) =>
    `${normalizeStr(e.title).toLowerCase()}@@${normalizeStr(e.company).toLowerCase()}`;

  const currentRoleMap = new Map(currentExp.map((e) => [expKey(e), e]));
  const snapshotRoleMap = new Map(snapshotExp.map((e) => [expKey(e), e]));

  for (const [key, snapRole] of snapshotRoleMap.entries()) {
    const label = `${snapRole.title || 'Untitled Role'} @ ${snapRole.company || 'Unknown Company'}`;
    const curRole = currentRoleMap.get(key);
    if (!curRole) {
      changedRoles.push({
        label,
        status: 'added_on_restore',
        detail: `Restores ${snapRole.bullets?.length ?? 0} bullet(s) from this role`,
      });
    } else if (
      serializeBullets(curRole.bullets) !== serializeBullets(snapRole.bullets)
    ) {
      changedRoles.push({
        label,
        status: 'modified_bullets',
        detail: `Bullets differ (${snapRole.bullets?.length ?? 0} in snapshot vs ${curRole.bullets?.length ?? 0} in current)`,
      });
    }
  }

  for (const [key, curRole] of currentRoleMap.entries()) {
    if (!snapshotRoleMap.has(key)) {
      const label = `${curRole.title || 'Untitled Role'} @ ${curRole.company || 'Unknown Company'}`;
      changedRoles.push({
        label,
        status: 'removed_on_restore',
        detail: 'Present only in current live resume (removed if restored)',
      });
    }
  }

  const currentEdu = current.education ?? [];
  const snapshotEdu = snapshot.education ?? [];
  const educationChanged =
    JSON.stringify(currentEdu) !== JSON.stringify(snapshotEdu);

  const currentProj = current.projects ?? [];
  const snapshotProj = snapshot.projects ?? [];
  const projectsChanged =
    JSON.stringify(currentProj) !== JSON.stringify(snapshotProj);

  const totalChanges = [
    headlineChanged,
    summaryChanged,
    contactChanged,
    skillsAddedOnRestore.length > 0 || skillsRemovedOnRestore.length > 0,
    changedRoles.length > 0,
    educationChanged,
    projectsChanged,
  ].filter(Boolean).length;

  return {
    totalChanges,
    headlineChanged,
    summaryChanged,
    contactChanged,
    skillsAddedOnRestore,
    skillsRemovedOnRestore,
    changedRoles,
    educationChanged,
    projectsChanged,
    counts: {
      snapshotExperience: snapshotExp.length,
      currentExperience: currentExp.length,
      snapshotSkills: snapshotSkills.length,
      currentSkills: currentSkills.length,
      snapshotProjects: snapshotProj.length,
      currentProjects: currentProj.length,
      snapshotEducation: snapshotEdu.length,
      currentEducation: currentEdu.length,
    },
  };
}

