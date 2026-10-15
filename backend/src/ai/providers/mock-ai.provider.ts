import { Injectable } from '@nestjs/common';
import type {
  AiProvider,
  BulletRewriteResult,
  ParsedProfileDraft,
  RequirementMatchOutput,
} from '../interfaces/ai-provider.interface.js';
import type { ParsedJobRequirement } from '../../jobs/entities/job-description.entity.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';

@Injectable()
export class MockAiProvider implements AiProvider {
  public readonly name = 'mock';

  async parseResumeText(text: string): Promise<ParsedProfileDraft> {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // Deterministic extraction based on text contents
    const skillsList: string[] = [];
    const knownSkills = [
      'TypeScript', 'JavaScript', 'Node.js', 'NestJS', 'React', 'Next.js',
      'Python', 'Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis',
      'Kafka', 'AWS', 'GraphQL', 'TailwindCSS', 'Git', 'Linux',
    ];

    knownSkills.forEach((skill) => {
      if (new RegExp(`\\b${skill}\\b`, 'i').test(text)) {
        skillsList.push(skill);
      }
    });

    const hasExperience = /experience|work history|employment/i.test(text);

    return {
      headline: lines[0]?.substring(0, 150) || 'Software Engineer',
      summary: lines.slice(1, 4).join(' ').substring(0, 500) || 'Experienced engineer with demonstrated background in distributed software systems.',
      location: /bengaluru|bangalore|san francisco|london|remote/i.exec(text)?.[0] || 'Remote',
      skills: skillsList.map((s) => ({ name: s, category: 'Technical Skills' })),
      experience: hasExperience
        ? [
            {
              company: 'Acme Cloud Infrastructure',
              title: 'Senior Software Engineer',
              startDate: '2022',
              endDate: 'Present',
              current: true,
              bullets: [
                'Architected distributed microservices handling 8M+ daily events with 99.99% availability.',
                'Optimized PostgreSQL queries and indexing, cutting p99 query latency by 34%.',
              ],
            },
          ]
        : [],
      education: [
        {
          school: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationDate: '2021',
        },
      ],
      projects: [],
      certifications: [],
      confidenceScore: 92,
    };
  }

  async parseJobDescription(text: string): Promise<ParsedJobRequirement[]> {
    const requirements: ParsedJobRequirement[] = [];

    const skillCatalog = [
      { name: 'TypeScript', type: 'required_skill' as const, importance: 'critical' as const },
      { name: 'Go', type: 'required_skill' as const, importance: 'high' as const },
      { name: 'PostgreSQL', type: 'required_skill' as const, importance: 'high' as const },
      { name: 'Redis', type: 'required_skill' as const, importance: 'medium' as const },
      { name: 'Kafka', type: 'preferred_skill' as const, importance: 'medium' as const },
      { name: 'Docker', type: 'required_skill' as const, importance: 'medium' as const },
      { name: 'Kubernetes', type: 'preferred_skill' as const, importance: 'low' as const },
      { name: 'AWS', type: 'preferred_skill' as const, importance: 'medium' as const },
      { name: 'Distributed Systems', type: 'domain' as const, importance: 'critical' as const },
    ];

    let counter = 1;
    skillCatalog.forEach((item) => {
      if (new RegExp(`\\b${item.name}\\b`, 'i').test(text)) {
        requirements.push({
          id: `req-${counter++}`,
          text: `Demonstrated expertise in ${item.name}`,
          type: item.type,
          importance: item.importance,
          keywords: [item.name.toLowerCase()],
        });
      }
    });

    // Experience requirement detection
    const expMatch = /(\d+)\+?\s*years/i.exec(text);
    if (expMatch) {
      requirements.push({
        id: `req-${counter++}`,
        text: `At least ${expMatch[1]} years of professional software engineering experience`,
        type: 'experience',
        importance: 'critical',
        keywords: ['years', 'experience'],
      });
    }

    if (requirements.length === 0) {
      requirements.push({
        id: 'req-fallback',
        text: 'Core software engineering skills and problem-solving ability',
        type: 'required_skill',
        importance: 'high',
        keywords: ['software', 'engineering'],
      });
    }

    return requirements;
  }

  async matchRequirements(
    resumeContent: ResumeContent,
    requirements: ParsedJobRequirement[],
  ): Promise<RequirementMatchOutput[]> {
    // Gather all candidate text evidence
    const candidateBullets: string[] = [];
    (resumeContent.experience || []).forEach((exp) => {
      (exp.bullets || []).forEach((b) => candidateBullets.push(b));
    });

    const candidateSkillNames = (resumeContent.skills || []).map((s) => s.name.toLowerCase());

    return requirements.map((req) => {
      const matchingBullets = candidateBullets.filter((b) =>
        req.keywords.some((kw) => b.toLowerCase().includes(kw)),
      );

      const skillMentioned = req.keywords.some((kw) =>
        candidateSkillNames.some((cs) => cs.includes(kw) || kw.includes(cs)),
      );

      if (matchingBullets.length > 0) {
        return {
          requirementId: req.id,
          status: 'supported',
          confidence: 95,
          evidenceQuotes: matchingBullets.slice(0, 2),
          explanation: `Strongly evidenced by your experience bullets referencing ${req.keywords.join(', ')}.`,
          suggestedAction: 'Keep bullet prioritized in the top 3 items of this job-tailored variation.',
        };
      }

      if (skillMentioned) {
        return {
          requirementId: req.id,
          status: 'needs_confirmation',
          confidence: 70,
          evidenceQuotes: [],
          explanation: `Listed in your skills vault (${req.keywords.join(', ')}), but no specific experience bullet demonstrates production impact.`,
          suggestedAction: 'Confirm whether you worked with this in production, and add an evidence bullet if true.',
        };
      }

      return {
        requirementId: req.id,
        status: 'not_evidenced',
        confidence: 90,
        evidenceQuotes: [],
        explanation: `No mention of ${req.keywords.join(', ')} found in your Master Profile.`,
        suggestedAction: 'Do not invent this skill. If you have unrecorded experience with this, add it to your master profile first.',
      };
    });
  }

  async rewriteBullet(
    bullet: string,
    targetRole?: string,
    metricHint?: string,
  ): Promise<BulletRewriteResult> {
    const actionVerbs = ['Architected', 'Spearheaded', 'Optimized', 'Engineered', 'Orchestrated'];
    const chosenVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];

    let rewritten = bullet.trim();
    if (!/^[A-Z][a-z]+ed\b/.test(rewritten)) {
      rewritten = `${chosenVerb} ${rewritten.charAt(0).toLowerCase() + rewritten.slice(1)}`;
    }

    if (metricHint && !/\d+%|\$\d+/i.test(rewritten)) {
      rewritten = `${rewritten}, delivering ${metricHint}`;
    }

    return {
      originalBullet: bullet,
      rewrittenBullet: rewritten,
      actionVerbUsed: chosenVerb,
      framework: 'XYZ',
      explanation: 'Formatted using the Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].',
      factualVerificationNotes: 'All claims are anchored strictly to the candidate input; no unverified metrics were fabricated.',
    };
  }
}
