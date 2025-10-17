import React from "react"
import { Routes, Route } from "react-router-dom"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"


const DashboardPage = () => <div></div>



function App() {
  return (

    <div>
      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

      </Routes>
    </div>


  )
}

export default App
