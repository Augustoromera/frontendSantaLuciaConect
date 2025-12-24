
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from '../pages/Login-Registro/LoginPage';
import RegisterPage from '../pages/Login-Registro/RegisterPage';
import { AuthProvider, useAuth } from "../context/AuthContext";
import ProtectedRoute from "../../ProtectedRoute";
import { HomeScreen } from '../pages/HomeScreen'
import { AdminScreen } from '../pages/admin/AdminScreen'
import { ContactScreen } from '../pages/ContactScreen'
import { AboutUs } from '../pages/AboutUs'

import { PanelDeHorarios } from "../pages/PanelDeHorarios";
import SpecialTrips from "../pages/SpecialTrips";
import TicketPurchase from "../pages/TicketPurchase";
import UserInbox from "../pages/user/UserInbox";
import HistoryScreen from "../pages/HistoryScreen";
import DevTeamScreen from "../pages/DevTeamScreen";

function AppRouter() {
  return (
    <AppLR />
  );
}

function AppLR() {
  const auth = useAuth(); // hook useAuth para obtener la información del usuario

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomeScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
        <Route path='/aboutus' element={<AboutUs />} />
        <Route path='/paneldehorarios' element={<PanelDeHorarios />} />

        <Route path="/viajes-especiales" element={<SpecialTrips />} />
        <Route path="/compra-abonos" element={<TicketPurchase />} />

        <Route element={<ProtectedRoute />}>
          n
          {/* Ruta ADMIN */}
          <Route path="/admin" element={auth.user?.role === 'admin' ? <AdminScreen /> : <Navigate to="/" />} />
          <Route path="/mis-consultas" element={<UserInbox />} />
        </Route>
        <Route path="/historia" element={<HistoryScreen />} />
        <Route path="/dev-team" element={<DevTeamScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;