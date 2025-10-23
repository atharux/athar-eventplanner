import React, { useEffect } from "react";

export default function Toast({ message, clear }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => clear(), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clear]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg z-50">
      {message}
    </div>
  );
}
