import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer style={{
      marginTop: '1rem',
      padding: '1.5rem 1rem',
      borderTop: '2px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: '#ffffff',
      fontSize: '0.9rem',
      textAlign: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.5rem', 
        flexWrap: 'nowrap',
        marginBottom: '1rem',
        alignItems: 'center'
      }}>
        <Link 
          to="/" 
          style={{ 
            color: '#ffffff', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffd700'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
        >
          Home
        </Link>
        {isAuthenticated && (
          <>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>•</span>
            <Link 
              to="/my-giveaways" 
              style={{ 
                color: '#ffffff', 
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffd700'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
            >
              My Giveaways
            </Link>
          </>
        )}
        {/* <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>•</span>
        <Link 
          to="/about" 
          style={{ 
                color: '#ffffff', 
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease'
              }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffd700'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
        >
          About
        </Link> */}
        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>•</span>
        <Link 
          to="/privacy-policy" 
          style={{ 
                color: '#ffffff', 
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease'
              }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffd700'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
        >
          PrivacyPolicy
        </Link>
        {/* <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>•</span>
        <Link 
          to="/data-deletion-instructions" 
          style={{ 
                color: '#ffffff', 
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease'
              }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffd700'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
        >
          Data Deletion
        </Link> */}
      </div>
      <div style={{ 
        fontSize: '0.85rem',
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '400'
      }}>
        Made with ❤️ by thixpin
      </div>
    </footer>
  );
};

export default Footer;
