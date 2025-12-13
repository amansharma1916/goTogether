import LandingPage from "./components/Default/LandingPage"
import { useEffect } from "react"
import { Routes, Route } from 'react-router-dom'
import Switcher from "./components/Default/Switcher";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./components/User/Dashboard";
import Map from "./components/User/Map";
import Join from "./components/User/Join";
import Rides from "./components/User/Rides";
import Bookings from "./components/User/Bookings";

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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join"
          element={
            <ProtectedRoute>
              <Join />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rides"
          element={
            <ProtectedRoute>
              <Rides />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  )
}

export default App