"use client";

import { useEffect } from "react";

export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash || "";

    if (!hash.includes("access_token=")) return;

    window.location.replace(`/reset-password${hash}`);
  }, []);

  return null;
}
