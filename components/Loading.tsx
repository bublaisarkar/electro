'use client';

import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 shadow-md" />
      <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
};

export default Loading;