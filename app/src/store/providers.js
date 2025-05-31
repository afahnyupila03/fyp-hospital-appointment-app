"use client";

import React, { useState } from "react";
import { AppProvider } from "./context";
import { SocketProvider } from "./socket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <SocketProvider>{children}</SocketProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
