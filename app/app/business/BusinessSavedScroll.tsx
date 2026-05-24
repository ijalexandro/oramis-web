"use client";

import { useEffect } from "react";

export default function BusinessSavedScroll({ saved }: { saved: boolean }) {
  useEffect(() => {
    if (!saved) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [saved]);

  return null;
}
