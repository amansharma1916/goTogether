import '../../Styles/User/HomePage.css'
import ProtectedRoute from '../../ProtectedRoute.tsx'
import Navbar from './Assets/Navbar.tsx'
import { Route , Routes} from 'react-router-dom'
import HomePage from './HomePage.tsx'
const Dashboard = () => {
  return (
    <div className="homepage-container">
      <Navbar />
      <HomePage />
      
    </div>
  )
}

export default Dashboard 