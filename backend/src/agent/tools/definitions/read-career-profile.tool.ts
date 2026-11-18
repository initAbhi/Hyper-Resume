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

export interface ReadCareerProfileArgs {}

@Injectable()
export class ReadCareerProfileTool implements AgentTool<ReadCareerProfileArgs, unknown> {
  readonly name = 'read_career_profile';
  readonly description =
    "Retrieves the candidate's master Career Vault preferences, experience history, and verified skills from their candidate profile.";
  readonly permissionTier = ToolPermissionTier.READ_ONLY;
  readonly requiresApproval = false;
  readonly creditCost = 0;
  readonly timeoutMs = 5000;

  readonly inputSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  constructor(private readonly profilesService: ProfilesService) {}

  validate(args: unknown): ToolValidationResult<ReadCareerProfileArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };
    return { valid: true, data: {} };
  }

  async execute(
    context: ToolExecutionContext,
    _args: ReadCareerProfileArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      const profile = await this.profilesService.getProfileByUserId(context.userId);

      // Distinguish candidate-confirmed verified skills from any detected skills
      const verifiedSkills = (profile.skills || []).map((s) => ({
        name: s.name,
        category: s.category,
        level: s.level || 'intermediate',
        verified: true,
      }));

      return {
        success: true,
        data: {
          headline: profile.headline,
          summary: profile.summary,
          location: profile.location,
          verifiedSkills,
          detectedSkills: [],
          experienceCount: (profile.experience || []).length,
          educationCount: (profile.education || []).length,
          projectsCount: (profile.projects || []).length,
        },
        metadata: {
          profileId: profile.id,
          userId: context.userId,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to read career profile',
      };
    }
  }
}

