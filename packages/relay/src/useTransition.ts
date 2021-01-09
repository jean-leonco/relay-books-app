import React from 'react';

declare module 'react' {
  export function unstable_useTransition(): [(cb: () => void) => void, boolean];
}

const useTransition = React.unstable_useTransition;

export default useTransition;
