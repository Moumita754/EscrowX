import "@/polyfills";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "@/contexts/WalletContext";
import { App } from "@/App";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WalletProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(17, 23, 43, 0.9)",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </WalletProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
