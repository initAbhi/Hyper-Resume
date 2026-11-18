import { Injectable } from '@nestjs/common';
import { ProfilesService } from '../../../profiles/profiles.service.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
} from '../tool.interface.js';

export interface UpdateCareerProfileArgs {
  verifiedSkillsToAdd?: string[];
  preferredRoles?: string[];
  preferredWorkplace?: 'Remote' | 'Hybrid' | 'Onsite';
  headline?: string;
  summary?: string;
  location?: string;
}

@Injectable()
export class UpdateCareerProfileTool implements AgentTool<UpdateCareerProfileArgs, unknown> {
  readonly name = 'update_career_profile';
  readonly description =
    "Updates candidate master Career Vault preferences and confirmed skills in candidate_profiles. AI-detected skills are never automatically promoted to verified without candidate confirmation.";
  readonly permissionTier = ToolPermissionTier.STATE_MUTATING;
  readonly requiresApproval = true;
  readonly creditCost = 0;
  readonly timeoutMs = 8000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      verifiedSkillsToAdd: {
        type: 'array',
        items: { type: 'string' },
        description: 'Skills explicitly confirmed by candidate to append to profile verified skills',
      },
      preferredRoles: {
        type: 'array',
        items: { type: 'string' },
        description: 'Target job titles preferred by the candidate',
      },
      preferredWorkplace: {
        type: 'string',
        enum: ['Remote', 'Hybrid', 'Onsite'],
      },
      headline: {
        type: 'string',
        description: 'Candidate career headline',
      },
      summary: {
        type: 'string',
        description: 'Candidate professional summary',
      },
      location: {
        type: 'string',
        description: 'Target or current location',
      },
    },
    required: [],
  };

  constructor(private readonly profilesService: ProfilesService) {}

  validate(args: unknown): ToolValidationResult<UpdateCareerProfileArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: true, data: {} };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (raw.preferredWorkplace !== undefined) {
      const allowed = ['Remote', 'Hybrid', 'Onsite'];
      if (!allowed.includes(raw.preferredWorkplace as string)) {
        errors.push(`preferredWorkplace must be one of: ${allowed.join(', ')}`);
      }
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        verifiedSkillsToAdd: Array.isArray(raw.verifiedSkillsToAdd)
          ? raw.verifiedSkillsToAdd.map(String)
          : undefined,
        preferredRoles: Array.isArray(raw.preferredRoles) ? raw.preferredRoles.map(String) : undefined,
        preferredWorkplace: raw.preferredWorkplace as any,
        headline: typeof raw.headline === 'string' ? raw.headline.trim() : undefined,
        summary: typeof raw.summary === 'string' ? raw.summary.trim() : undefined,
        location: typeof raw.location === 'string' ? raw.location.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: UpdateCareerProfileArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      const currentProfile = await this.profilesService.getProfileByUserId(context.userId);

      // Merge verified skills safely - never promote detected skills automatically
      const existingSkills = currentProfile.skills || [];
      const existingSkillNames = new Set(existingSkills.map((s) => s.name.toLowerCase()));

      const updatedSkills = [...existingSkills];
      if (args.verifiedSkillsToAdd && args.verifiedSkillsToAdd.length > 0) {
        for (const skillName of args.verifiedSkillsToAdd) {
          const trimmed = skillName.trim();
          if (trimmed && !existingSkillNames.has(trimmed.toLowerCase())) {
            updatedSkills.push({
              name: trimmed,
              category: 'General',
              level: 'intermediate',
            });
            existingSkillNames.add(trimmed.toLowerCase());
          }
        }
      }

      const updatedFields: string[] = [];
      const updatePayload: Record<string, any> = {};

      if (args.headline !== undefined) {
        updatePayload.headline = args.headline;
        updatedFields.push('headline');
      } else if (args.preferredRoles && args.preferredRoles.length > 0 && !currentProfile.headline) {
        updatePayload.headline = args.preferredRoles.join(' | ').slice(0, 200);
        updatedFields.push('preferredRoles');
      }
      if (args.summary !== undefined) {
        updatePayload.summary = args.summary;
        updatedFields.push('summary');
      } else if (args.preferredRoles && args.preferredRoles.length > 0) {
        const rolesNote = `Target Roles: ${args.preferredRoles.join(', ')}`;
        const baseSummary = (currentProfile.summary || '').replace(/\n?Target Roles:[^\n]*/g, '').trim();
        updatePayload.summary = baseSummary ? `${baseSummary}\n${rolesNote}` : rolesNote;
        if (!updatedFields.includes('preferredRoles')) updatedFields.push('preferredRoles');
      }
      if (args.location !== undefined) {
        updatePayload.location = args.location;
        updatedFields.push('location');
      } else if (args.preferredWorkplace) {
        const loc = (currentProfile.location || '').trim();
        if (!loc.toLowerCase().includes(args.preferredWorkplace.toLowerCase())) {
          updatePayload.location = loc ? `${loc} (${args.preferredWorkplace})` : args.preferredWorkplace;
        }
        updatedFields.push('preferredWorkplace');
      }
      if (args.verifiedSkillsToAdd && args.verifiedSkillsToAdd.length > 0) {
        updatePayload.skills = updatedSkills;
        updatedFields.push('skills');
      }

      await this.profilesService.updateProfileByUserId(context.userId, updatePayload);

      return {
        success: true,
        data: {
          success: true,
          updatedFields,
          totalSkills: updatedSkills.length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to update candidate profile',
      };
    }
  }
}

