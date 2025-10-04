import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer style={{
      marginTop: '2rem',
      padding: '1rem',
      borderTop: '1px solid #e5e7eb',
      color: '#6b7280',
      fontSize: '0.9rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/">Home</Link>
        {isAuthenticated && (
          <>
            <span>•</span>
            <Link to="/my-giveaways">My Giveaways</Link>
          </>
        )}
        <span>•</span>
        <Link to="/about">About</Link>
        <span>•</span>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <span>•</span>
        <Link to="/data-deletion-instructions">Data Deletion</Link>
      </div>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '1rem', 
        fontSize: '0.8rem',
        color: '#ffffff'
      }}>
        Made with love by thixpin
      </div>
    </footer>
  );
};

export default Footer;
