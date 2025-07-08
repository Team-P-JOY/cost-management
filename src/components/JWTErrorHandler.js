"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function JWTErrorHandler() {
  useEffect(() => {
    // Listen for JWT errors and clear session
    const handleJWTError = async () => {
      console.log("JWT Error detected, clearing session...");
      
      // Clear cookies server-side
      try {
        await fetch('/api/clear-cookies', { method: 'POST' });
      } catch (error) {
        console.error('Error clearing cookies:', error);
      }
      
      // Sign out and redirect
      signOut({ callbackUrl: "/login?error=JWTSessionError", redirect: true });
    };

    // Check if there's a JWT error in the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'JWTSessionError') {
      handleJWTError();
    }

    // Also check for session errors in console
    const originalError = console.error;
    console.error = (...args) => {
      if (args.some(arg => 
        typeof arg === 'string' && 
        arg.includes('JWT_SESSION_ERROR')
      )) {
        handleJWTError();
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
