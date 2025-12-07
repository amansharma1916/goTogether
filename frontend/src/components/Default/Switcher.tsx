import { useState } from 'react'
import '../../Styles/Default/Switcher.css'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import logo from '../../images/logo/gotogetherLogo.png'
import { Link } from 'react-router-dom'

const Switcher = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-container">
          <img src={logo} alt="goTogether Logo" className="auth-logo" />
          <span className="auth-logo-text">goTogether</span>
        </div>

        {/* Toggle Switcher */}
        <div className="auth-switcher">
          <Link to="/login" className={`switcher-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</Link>
          <Link to="/register" className={`switcher-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Sign Up</Link>
          <div className={`switcher-slider ${!isLogin ? 'right' : ''}`} />
        </div>

        {/* Dynamic Content */}
        <div className="auth-content">
          {isLogin ? (
            <LoginPage onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Switcher