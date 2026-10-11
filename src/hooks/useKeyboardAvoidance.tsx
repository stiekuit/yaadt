import { useState, useEffect } from 'react';

/**
 * Hook to detect keyboard visibility on mobile devices
 * Returns keyboard height and visibility state
 */
export const useKeyboardAvoidance = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;

      // Keyboard is likely visible if viewport shrinks by more than 150px
      if (heightDifference > 150) {
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDifference);
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    };

    // Detect focus on input elements
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Small delay to let the keyboard appear
        setTimeout(handleResize, 300);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};
