"use client";

import { AuthProvider } from "@/lib/AuthContext";
import { ContentProvider } from "@/lib/ContentContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ContentProvider>{children}</ContentProvider>
    </AuthProvider>
  );
}
