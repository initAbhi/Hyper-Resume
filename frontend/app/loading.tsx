import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-1 min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading HyperResume...</p>
      </div>
    </div>
  );
}
