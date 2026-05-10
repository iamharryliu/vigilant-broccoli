'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ModeTransitionWrapperProps {
  children: ReactNode;
  modeKey: string;
  className?: string;
}

export const ModeTransitionWrapper = ({ children, modeKey, className }: ModeTransitionWrapperProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [content, setContent] = useState(children);

  useEffect(() => {
    setIsVisible(false);

    const timer = setTimeout(() => {
      setContent(children);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [modeKey]);

  useEffect(() => {
    if (isVisible) {
      setContent(children);
    }
  }, [children, isVisible]);

  return (
    <div
      className={`transition-opacity duration-150 ease-out${className ? ` ${className}` : ''}`}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {content}
    </div>
  );
};
