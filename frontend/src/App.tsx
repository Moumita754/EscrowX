import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ConfigBanner } from "@/components/ConfigBanner";
import { RequireWallet } from "@/components/RequireWallet";
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";
import { CreateEscrow } from "@/pages/CreateEscrow";
import { EscrowDetails } from "@/pages/EscrowDetails";
import { History } from "@/pages/History";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";

export const App = () => (
  <>
    <ConfigBanner />
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route
          path="dashboard"
          element={
            <RequireWallet>
              <Dashboard />
            </RequireWallet>
          }
        />
        <Route
          path="create"
          element={
            <RequireWallet>
              <CreateEscrow />
            </RequireWallet>
          }
        />
        <Route
          path="escrow/:id"
          element={
            <RequireWallet>
              <EscrowDetails />
            </RequireWallet>
          }
        />
        <Route
          path="history"
          element={
            <RequireWallet>
              <History />
            </RequireWallet>
          }
        />
        <Route
          path="settings"
          element={
            <RequireWallet>
              <Settings />
            </RequireWallet>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </>
);
