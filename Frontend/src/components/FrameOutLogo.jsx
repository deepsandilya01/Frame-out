import React from 'react';

/**
 * Standard Frame-Out Logo Component
 * Consistent with Auth, Landing, and Dashboard branding.
 */
export const FrameOutLogo = ({ className = '', size = 28 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="30" height="30" rx="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="8" y="8" width="16" height="1.8" rx="0.9" fill="currentColor"/>
    <rect x="8" y="8" width="1.8" height="16" rx="0.9" fill="currentColor"/>
    <rect x="8" y="14.5" width="11" height="1.8" rx="0.9" fill="currentColor"/>
    <circle cx="23.5" cy="23.5" r="2.5" fill="var(--theme-accent, #00F5FF)"/>
  </svg>
);

export default FrameOutLogo;
