import LandingPage from "./components/Default/LandingPage"
import { useEffect } from "react"
import { Routes, Route } from 'react-router-dom'
import Switcher from "./components/Default/Switcher";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "./components/User/HomePage";

const App = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Switcher />} />
        <Route path="/register" element={<Switcher />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  )
}

export default App