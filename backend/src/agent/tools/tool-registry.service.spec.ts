import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ToolRegistryService } from './tool-registry.service.js';
import { ToolPermissionTier } from './tool.interface.js';

describe('ToolRegistryService', () => {
  let registry: ToolRegistryService;

  // Mock tools
  const mockTools: any[] = [
    { name: 'read_resume', permissionTier: ToolPermissionTier.READ_ONLY, requiresApproval: false, creditCost: 0, timeoutMs: 5000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'read_resume_versions', permissionTier: ToolPermissionTier.READ_ONLY, requiresApproval: false, creditCost: 0, timeoutMs: 5000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'search_discovered_jobs', permissionTier: ToolPermissionTier.READ_ONLY, requiresApproval: false, creditCost: 0, timeoutMs: 15000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'read_career_profile', permissionTier: ToolPermissionTier.READ_ONLY, requiresApproval: false, creditCost: 0, timeoutMs: 5000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'run_ats_audit', permissionTier: ToolPermissionTier.AI_ANALYSIS, requiresApproval: false, creditCost: 0, timeoutMs: 10000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'match_job_description', permissionTier: ToolPermissionTier.AI_ANALYSIS, requiresApproval: false, creditCost: 1, timeoutMs: 20000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'generate_bullet_variations', permissionTier: ToolPermissionTier.AI_ANALYSIS, requiresApproval: false, creditCost: 1, timeoutMs: 15000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'propose_resume_edits', permissionTier: ToolPermissionTier.AI_ANALYSIS, requiresApproval: false, creditCost: 2, timeoutMs: 25000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'generate_cover_letter', permissionTier: ToolPermissionTier.AI_ANALYSIS, requiresApproval: false, creditCost: 2, timeoutMs: 25000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'start_interview_session', permissionTier: ToolPermissionTier.AI_ANALYSIS, requiresApproval: false, creditCost: 2, timeoutMs: 20000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'save_job_to_tracker', permissionTier: ToolPermissionTier.SAFE_MUTATING, requiresApproval: false, creditCost: 0, timeoutMs: 8000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'create_resume', permissionTier: ToolPermissionTier.SAFE_MUTATING, requiresApproval: false, creditCost: 0, timeoutMs: 8000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'apply_approved_edits', permissionTier: ToolPermissionTier.STATE_MUTATING, requiresApproval: true, creditCost: 0, timeoutMs: 10000, isModelCallable: false, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'restore_resume_version', permissionTier: ToolPermissionTier.STATE_MUTATING, requiresApproval: true, creditCost: 0, timeoutMs: 8000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
    { name: 'update_career_profile', permissionTier: ToolPermissionTier.STATE_MUTATING, requiresApproval: true, creditCost: 0, timeoutMs: 8000, inputSchema: {}, validate: vi.fn().mockReturnValue({ valid: true, data: {} }), execute: vi.fn() },
  ];

  beforeEach(() => {
    registry = new ToolRegistryService(...(mockTools as any));
  });

  it('should initialize and register exactly 15 tools', () => {
    expect(registry.count).toBe(15);
    expect(registry.getAll().length).toBe(15);
  });

  it('should look up registered tools by name', () => {
    const tool = registry.get('read_resume');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('read_resume');
  });

  it('should throw NotFoundException for unknown tools in getOrThrow', () => {
    expect(() => registry.getOrThrow('non_existent_tool')).toThrow();
  });

  it('should reject duplicate tool registration', () => {
    expect(() =>
      registry.register({
        name: 'read_resume',
        description: 'Duplicate mock tool',
        permissionTier: ToolPermissionTier.READ_ONLY,
        requiresApproval: false,
        creditCost: 0,
        timeoutMs: 5000,
        inputSchema: {},
        validate: vi.fn(),
        execute: vi.fn(),
      }),
    ).toThrow(/already registered/);
  });

  it('CRITICAL: must not expose apply_approved_edits to model-callable tools', () => {
    const callableTools = registry.getModelCallableTools();
    const names = callableTools.map((t) => t.name);

    expect(names).not.toContain('apply_approved_edits');
    expect(names.length).toBeLessThan(15);
  });

  it('should generate Gemini function declarations for model-callable tools', () => {
    const declarations = registry.getGeminiFunctionDeclarations();
    expect(declarations.length).toBeGreaterThan(0);
    expect(declarations.some((d) => d.name === 'apply_approved_edits')).toBe(false);
  });

  it('should reject execution when validation fails', async () => {
    const failingTool = mockTools.find((t) => t.name === 'read_resume');
    failingTool.validate.mockReturnValueOnce({ valid: false, errors: ['Invalid ID'] });

    const result = await registry.executeTool(
      'read_resume',
      { userId: '11111111-1111-1111-1111-111111111111' },
      { resumeId: 'bad' },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation error');
  });

  it('should execute tool and return result on valid input', async () => {
    const passingTool = mockTools.find((t) => t.name === 'read_resume');
    passingTool.validate.mockReturnValueOnce({ valid: true, data: { resumeId: 'res-1' } });
    passingTool.execute.mockResolvedValueOnce({ success: true, data: { title: 'Engineer' } });

    const result = await registry.executeTool(
      'read_resume',
      { userId: '11111111-1111-1111-1111-111111111111' },
      { resumeId: 'res-1' },
    );

    expect(result.success).toBe(true);
    expect((result.data as any).title).toBe('Engineer');
  });
});
