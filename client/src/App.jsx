import React from "react"
import { Routes, Route } from "react-router-dom"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"

const HomePage = () => <div></div>

const DashboardPage = () => <div></div>



function App() {
  return (

    <div>
      <h1>Notebooks</h1>
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
