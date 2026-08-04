import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/Layout/AppLayout";
import { RequireAuth, RequirePermission } from "@/components/ProtectedRoute";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import LoansPage from "@/pages/LoansPage";
import ClientsPage from "@/pages/ClientsPage";
import PawnshopsPage from "@/pages/PawnshopsPage";
import OwnersPage from "@/pages/OwnersPage";
import DictionariesPage from "@/pages/DictionariesPage";
import ReportsPage from "@/pages/ReportsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route
              path="loans"
              element={
                <RequirePermission resource="loans">
                  <LoansPage />
                </RequirePermission>
              }
            />
            <Route
              path="clients"
              element={
                <RequirePermission resource="clients">
                  <ClientsPage />
                </RequirePermission>
              }
            />
            <Route
              path="pawnshops"
              element={
                <RequirePermission resource="pawnshops">
                  <PawnshopsPage />
                </RequirePermission>
              }
            />
            <Route
              path="owners"
              element={
                <RequirePermission resource="owners">
                  <OwnersPage />
                </RequirePermission>
              }
            />
            <Route
              path="dictionaries"
              element={
                <RequirePermission resource="dictionaries">
                  <DictionariesPage />
                </RequirePermission>
              }
            />
            <Route
              path="reports"
              element={
                <RequirePermission resource="reports">
                  <ReportsPage />
                </RequirePermission>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
