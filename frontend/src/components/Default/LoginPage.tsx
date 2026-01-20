import { Link } from 'react-router-dom'
import '../../Styles/Default/LoginPage.css'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLoader from './AuthLoader'

const ServerURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LoginPageProps {
  onSwitchToRegister: () => void
}

interface LoginFormData {
  email: string
  password: string
}


const LoginPage = ({ onSwitchToRegister }: LoginPageProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [, setIsLoggedIn] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(formData)
      const response = await axios.post(`${ServerURL}/api/auth/login`, formData);
      if(response.data.success){
        console.log('Login successful');
        // Set localStorage BEFORE navigation
        localStorage.setItem('isAuthenticated', 'true');
        // console.log(response.data.user);
        const LoginUser = {
          id: response.data.user._id,
          fullname: response.data.user.fullname,
          email: response.data.user.email,
          college: response.data.user.college

        }
        localStorage.setItem('LoggedInUser', JSON.stringify(LoginUser));
        console.log('User data stored in localStorage:', LoginUser);
        setIsLoggedIn(true);
        console.log(localStorage.getItem('isAuthenticated'))
        // Navigate after state is updated
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {isLoading && <AuthLoader text="Logging in..." />}
      <h2 className="auth-title">Login to your account</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <div className="input-wrapper">
            <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 5l8 6 8-6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="john.doe@gotogether.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-wrapper">
            <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="5" y="9" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Forgot Password */}
        <div className="forgot-password">
          <a href="#forgot">Forgot password?</a>
        </div>

        {/* Login Button */}
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Divider */}
        <div className="divider">
          <span>or continue with</span>
        </div>

        {/* Social Login Buttons */}
        <div className="social-buttons">
          <button type="button" className="btn-social">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
              <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
              <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 0 0 0 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
              <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" className="btn-social btn-phone">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Login with Phone OTP
          </button>
        </div>

        {/* Switch to Register */}
        <div className="switch-auth">
          Don't have an account? <Link to="/register" className="link-btn" onClick={onSwitchToRegister}>Sign up</Link>
        </div>
      </form>
    </div>
  )
}

export default LoginPage