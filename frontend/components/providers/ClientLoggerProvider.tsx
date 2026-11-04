'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function ClientLoggerProvider() {
  useEffect(() => {
    logger.initGlobalErrorHandlers();

    if (process.env.NODE_ENV === 'development') {
      logger.info('Application client mounted', {
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        logLevel: logger.getLogLevel(),
      });
    }
  }, []);

  return null;
}
