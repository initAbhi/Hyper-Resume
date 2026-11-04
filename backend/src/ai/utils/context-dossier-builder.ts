import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type { JobDescription } from '../../jobs/entities/job-description.entity.js';

export interface InterviewContextDossier {
  targetRole: string;
  candidateSummary: string;
  topSkills: string[];
  keyExperiences: Array<{
    title: string;
    company: string;
    bullets: string[];
  }>;
  keyProjects: Array<{
    name: string;
    description: string;
    highlights: string[];
  }>;
  targetJobContext?: {
    title: string;
    company?: string;
    criticalSkills: string[];
    missingSkills?: string[];
  };
}

export class ContextDossierBuilder {
  public static buildDossier(
    targetRole: string,
    resumeContent: ResumeContent,
    jobDescription?: JobDescription,
    missingSkills?: string[],
  ): InterviewContextDossier {
    const topSkills = (resumeContent.skills || [])
      .slice(0, 10)
      .map((s) => s.name.trim())
      .filter(Boolean);

    const keyExperiences = (resumeContent.experience || []).slice(0, 2).map((exp) => ({
      title: exp.title,
      company: exp.company,
      bullets: (exp.bullets || []).slice(0, 3).map((b) => b.trim()),
    }));

    const keyProjects = (resumeContent.projects || []).slice(0, 2).map((proj) => ({
      name: proj.name,
      description: proj.description?.slice(0, 200) || '',
      highlights: (proj.highlights || []).slice(0, 2).map((h) => h.trim()),
    }));

    let targetJobContext: InterviewContextDossier['targetJobContext'];
    if (jobDescription) {
      const criticalSkills = (jobDescription.parsedRequirements || [])
        .filter((r) => r.type === 'required_skill' || r.importance === 'critical' || r.importance === 'high')
        .slice(0, 6)
        .map((r) => r.keywords?.[0] || r.text)
        .filter(Boolean);

      targetJobContext = {
        title: jobDescription.title,
        company: jobDescription.companyName,
        criticalSkills,
        missingSkills: missingSkills?.slice(0, 5),
      };
    }

    return {
      targetRole,
      candidateSummary: resumeContent.headline || resumeContent.summary || '',
      topSkills,
      keyExperiences,
      keyProjects,
      targetJobContext,
    };
  }

  public static formatDossierText(dossier: InterviewContextDossier): string {
    const lines: string[] = [
      `TARGET ROLE: ${dossier.targetRole}`,
      `HEADLINE: ${dossier.candidateSummary}`,
      `TOP SKILLS: ${dossier.topSkills.join(', ') || 'Not specified'}`,
      '',
      'EXPERIENCE CLAIMS TO PROBE:',
    ];

    dossier.keyExperiences.forEach((exp) => {
      lines.push(`- ${exp.title} at ${exp.company}:`);
      exp.bullets.forEach((b) => lines.push(`  * ${b}`));
    });

    if (dossier.keyProjects.length > 0) {
      lines.push('', 'PROJECTS:');
      dossier.keyProjects.forEach((p) => {
        lines.push(`- ${p.name}: ${p.description}`);
        p.highlights.forEach((h) => lines.push(`  * ${h}`));
      });
    }

    if (dossier.targetJobContext) {
      lines.push('', 'TARGET JOB REQUIREMENTS:');
      lines.push(`- Role: ${dossier.targetJobContext.title} at ${dossier.targetJobContext.company || 'Company'}`);
      lines.push(`- Critical Skills: ${dossier.targetJobContext.criticalSkills.join(', ')}`);
      if (dossier.targetJobContext.missingSkills && dossier.targetJobContext.missingSkills.length > 0) {
        lines.push(`- Unevidenced/Missing Skills to Probe: ${dossier.targetJobContext.missingSkills.join(', ')}`);
      }
    }

    return lines.join('\n');
  }
}

