import '../../Styles/Default/RegisterPage.css'

interface RegisterPageProps {
  onSwitchToLogin: () => void
}

const RegisterPage = ({ onSwitchToLogin }: RegisterPageProps) => {
  return (
    <div className="register-page">
      <h2 className="auth-title">Create your account</h2>

      <form className="auth-form">
        {/* Full Name Field */}
        <div className="form-group">
          <label htmlFor="fullname" className="form-label">Full Name</label>
          <input
            type="text"
            id="fullname"
            className="form-input"
            placeholder="John Doe"
          />
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email</label>
          <input
            type="email"
            id="reg-email"
            className="form-input"
            placeholder="john.doe@example.com"
          />
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">Password</label>
          <input
            type="password"
            id="reg-password"
            className="form-input"
            placeholder="••••••••"
          />
        </div>

        {/* Confirm Password Field */}
        <div className="form-group">
          <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            className="form-input"
            placeholder="••••••••"
          />
        </div>

        {/* College Name Field */}
        <div className="form-group">
          <label htmlFor="college" className="form-label">College Name (Optional)</label>
          <select id="college" className="form-input form-select">
            <option value="">Select your college</option>
            <option value="ucb">University of California, Berkeley</option>
            <option value="stanford">Stanford University</option>
            <option value="mit">Massachusetts Institute of Technology</option>
            <option value="harvard">Harvard University</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Create Account Button */}
        <button type="submit" className="btn-primary btn-register">
          Create Account
        </button>

        {/* Verification Notice */}
        <p className="verification-notice">
          We will send a verification link to your college email.
        </p>

        {/* Divider */}
        <div className="divider">
          <span>or sign up with</span>
        </div>

        {/* Social Sign Up Button */}
        <button type="button" className="btn-social btn-google-signup">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
            <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
            <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 0 0 0 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
            <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        {/* Switch to Login */}
        <div className="switch-auth">
          Already have an account? <button type="button" onClick={onSwitchToLogin} className="link-btn">Login</button>
        </div>
      </form>
    </div>
  )
}

export default RegisterPage