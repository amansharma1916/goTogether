import '../../Styles/Default/AuthLoader.css';

interface AuthLoaderProps {
  text?: string;
}

const AuthLoader = ({ text = 'Loading...' }: AuthLoaderProps) => {
  return (
    <div className="auth-loader-overlay">
      <div className="auth-loader-content">
        <div className="auth-loader-circle">
          <div className="auth-loader-dot"></div>
          <div className="auth-loader-dot"></div>
          <div className="auth-loader-dot"></div>
        </div>
        <p className="auth-loader-text">{text}</p>
      </div>
    </div>
  );
};

export default AuthLoader;
