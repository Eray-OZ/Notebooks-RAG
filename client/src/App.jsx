import React, { useContext } from "react";
import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotebookPage from "./pages/NotebookPage";

function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-screen w-64 border-r border-[#1E293B] bg-[#0C0C0C] py-8 flex-shrink-0 z-20">
        <div className="px-6 mb-8 flex flex-col gap-2">
          <span className="font-['Plus_Jakarta_Sans'] text-lg font-black text-[#6750A4] uppercase tracking-widest">NoteBrain</span>
          <span className="text-on-surface-variant font-label-caps text-label-caps">Professional Suite</span>
        </div>
        <div className="px-4 mb-6">
          <Link to="/dashboard">
            <button className="w-full bg-[#6750A4] text-white py-3 px-4 rounded font-label-caps text-label-caps flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Notebook
            </button>
          </Link>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-3 flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-sm font-medium uppercase tracking-wider cursor-pointer active:opacity-80 transition-all ${
                isActive
                  ? 'text-white bg-[#050505] border-l-4 border-[#6750A4]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#141414] border-l-4 border-transparent'
              }`
            }
            end
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
            Library
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-3 flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-sm font-medium uppercase tracking-wider cursor-pointer active:opacity-80 transition-all ${
                isActive
                  ? 'text-white bg-[#050505] border-l-4 border-[#6750A4]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#141414] border-l-4 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined">description</span>
            Notebooks
          </NavLink>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-[#1E293B] mx-4">
          <a className="text-slate-500 hover:text-slate-300 hover:bg-[#141414] transition-all px-4 py-3 flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-sm font-medium uppercase tracking-wider cursor-pointer active:opacity-80 rounded" href="#">
            <span className="material-symbols-outlined">help_outline</span>
            Help
          </a>
          {user ? (
            <button onClick={handleLogout} className="text-slate-500 hover:text-slate-300 hover:bg-[#141414] transition-all px-4 py-3 flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-sm font-medium uppercase tracking-wider cursor-pointer active:opacity-80 rounded text-left">
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-slate-500 hover:text-slate-300 hover:bg-[#141414] transition-all px-4 py-3 flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-sm font-medium uppercase tracking-wider cursor-pointer active:opacity-80 rounded">
              <span className="material-symbols-outlined">login</span>
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* TopNavBar */}
        <header className="flex justify-between items-center h-16 px-6 w-full bg-[#050505] border-b border-[#1E293B] z-10 flex-shrink-0">
          <div className="flex items-center gap-lg">
            <div className="md:hidden text-lg font-bold text-white uppercase tracking-widest font-['Plus_Jakarta_Sans'] antialiased tracking-tight">
              NoteBrain
            </div>
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                className="bg-[#0C0C0C] border border-[#1E293B] text-white rounded-DEFAULT pl-10 pr-4 py-1.5 focus:border-[#6750A4] focus:outline-none font-body-sm text-body-sm w-72 placeholder-slate-500 transition-colors"
                placeholder="Search across spaces..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-sm text-[#6750A4]">
            <button className="hover:bg-[#0C0C0C] hover:text-white transition-colors duration-200 p-2 rounded-full active:scale-95 transition-transform flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hover:bg-[#0C0C0C] hover:text-white transition-colors duration-200 p-2 rounded-full active:scale-95 transition-transform flex items-center justify-center">
              <span className="material-symbols-outlined">settings</span>
            </button>
            {user && (
              <div className="w-8 h-8 rounded-full border border-outline-variant ml-sm overflow-hidden bg-surface-container-highest cursor-pointer flex items-center justify-center text-on-surface font-label-caps text-label-caps">
                {user.username?.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#050505]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notebook/:notebookId" element={<NotebookPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

export default App;