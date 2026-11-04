import { describe, it, expect } from 'vitest';
import { RequestContext } from './request-context.js';

describe('RequestContext', () => {
  it('should isolate context across asynchronous execution flows', async () => {
    const runFlowA = async () => {
      return RequestContext.run(
        { requestId: 'req-flow-a', userId: 'user-a' },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return {
            requestId: RequestContext.getRequestId(),
            userId: RequestContext.getUserId(),
          };
        },
      );
    };

    const runFlowB = async () => {
      return RequestContext.run(
        { requestId: 'req-flow-b', userId: 'user-b' },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return {
            requestId: RequestContext.getRequestId(),
            userId: RequestContext.getUserId(),
          };
        },
      );
    };

    const [resultA, resultB] = await Promise.all([runFlowA(), runFlowB()]);

    expect(resultA.requestId).toBe('req-flow-a');
    expect(resultA.userId).toBe('user-a');
    expect(resultB.requestId).toBe('req-flow-b');
    expect(resultB.userId).toBe('user-b');
  });

  it('should allow updating userId dynamically within context', () => {
    RequestContext.run({ requestId: 'initial-req' }, () => {
      expect(RequestContext.getUserId()).toBeUndefined();
      RequestContext.setUserId('authenticated-user-42');
      expect(RequestContext.getUserId()).toBe('authenticated-user-42');
    });
  });
});
