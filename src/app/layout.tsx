"use client";

import "./globals.css";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache par défaut plus long
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Cache en arrière-plan plus long
        gcTime: 1000 * 60 * 10, // 10 minutes (anciennement cacheTime)
        // Pas de refetch automatique
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        // Retry limité
        retry: 1,
        retryDelay: 1000,
        // Optimisations réseau
        networkMode: 'online',
        // Optimisations de performance
        structuralSharing: true,
        // Suspense pour le SSR
        suspense: false
      },
      mutations: {
        // Retry pour les mutations
        retry: 1,
        retryDelay: 1000,
        // Optimisations réseau
        networkMode: 'online'
      }
    }
  }));

  return (
    <html lang="fr" className="dark bg-neutral-950 h-full w-full">
      <body className="h-full w-full overflow-hidden">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
