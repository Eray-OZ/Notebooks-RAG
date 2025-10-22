import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import NotebookPage from "./pages/NotebookPage"




function App() {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <main style={{ paddingTop: '4.5rem' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notebook/:notebookId" element={<NotebookPage />}></Route>
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;