import React from 'react';
import { useGlobalLoader } from '../context/GlobalLoaderContext';
import '../Styles/GlobalLoader.css';

const GlobalLoader: React.FC = () => {
  const { isLoading, message } = useGlobalLoader();

  if (!isLoading) return null;

  return (
    <div className="global-loader-overlay">
      <div className="global-loader-content">
        <div className="global-loader-circle">
          <div className="global-loader-dot"></div>
          <div className="global-loader-dot"></div>
          <div className="global-loader-dot"></div>
        </div>
        <p className="global-loader-text">{message}</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
