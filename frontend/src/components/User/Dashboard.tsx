import '../../Styles/User/HomePage.css'
import ProtectedRoute from '../../ProtectedRoute.tsx'
import Navbar from './Assets/Navbar.tsx'
import { Route , Routes} from 'react-router-dom'
import HomePage from './HomePage.tsx'
import { use, useEffect } from 'react'
const Dashboard = () => {

  useEffect(() => {
    const User = localStorage.getItem('LoggedInUser');
    console.log('Dashboard User:', JSON.parse(User || '{}'));
  }, []);

  return (
    <div className="homepage-container">
      <Navbar />
      <HomePage />
      
    </div>
  )
}

export default Dashboard 