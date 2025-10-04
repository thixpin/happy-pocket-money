import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 15px;
    border-radius: 15px;
  }
`;

const Title = styled.h1`
  color: #d4af37;
  font-size: 2rem;
  margin-bottom: 20px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the authorization code from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('AuthCallback - URL params:', { 
          code: code ? 'present' : 'missing', 
          error, 
          errorDescription,
          currentUrl: window.location.href 
        });

        if (error) {
          throw new Error(errorDescription || 'Authentication failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for access token
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://pocket-api.thixpin.me';
        const callbackUrl = `${apiBaseUrl}/auth/facebook/callback`;
        
        console.log('AuthCallback - Making API call to:', callbackUrl);
        
        const response = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        console.log('AuthCallback - API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('AuthCallback - API error:', errorData);
          throw new Error(errorData.error?.message || 'Authentication failed');
        }

        const authData = await response.json();
        
        // Login the user
        login(authData.tokens, authData.user);

        // Get the intended redirect URL from localStorage
        const redirectUrl = localStorage.getItem('intendedRedirectUrl') || '/';
        
        console.log('AuthCallback - Retrieved redirect URL:', redirectUrl);
        
        // Clear the stored redirect URL
        localStorage.removeItem('intendedRedirectUrl');
        
        console.log('AuthCallback - Redirecting to:', redirectUrl);
        
        // Navigate to the intended destination
        navigate(redirectUrl, { replace: true });
        
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError(error.message || 'Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, login, navigate]);

  if (loading) {
    return (
      <Container>
        <Card>
          <Title>Completing Login...</Title>
          <LoadingSpinner />
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Please wait while we complete your authentication.
          </p>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <Title>Login Failed</Title>
          <ErrorMessage>{error}</ErrorMessage>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              marginTop: '20px'
            }}
          >
            Try Again
          </button>
        </Card>
      </Container>
    );
  }

  return null;
};

export default AuthCallback;
