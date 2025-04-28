"use client";

import React, { useState } from "react";
import { AppProvider } from "./context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>{children}</AppProvider>
    </QueryClientProvider>
  );
}
