import React, { useEffect } from 'react';
import FacebookLogin from 'react-facebook-login';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { FacebookAuthResponse } from '../types';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h1`
  color: #d4af37;
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: bold;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
`;

const FestivalIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
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

interface FacebookLoginComponentProps {
  onSuccess?: () => void;
}

const FacebookLoginComponent: React.FC<FacebookLoginComponentProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const responseFacebook = async (response: any) => {
    try {
      setError(null);
      
      if (!response.accessToken) {
        setError('Facebook login was cancelled');
        return;
      }

      const authResponse = await apiService.facebookLogin(response.accessToken);
      login(authResponse.tokens, authResponse.user);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Facebook login error:', error);
      setError(error.response?.data?.error?.message || 'Login failed. Please try again.');
    }
  };

  const handleFailure = (error: any) => {
    console.error('Facebook login failure:', error);
    setError('Facebook login failed. Please try again.');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <FestivalIcon>🎊</FestivalIcon>
        <Title>Thadingyut Festival</Title>
        <Subtitle>Share pocket money with your loved ones</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FacebookLogin
          appId={import.meta.env.VITE_FACEBOOK_APP_ID || ''}
          fields="name,picture"
          scope="public_profile"
          callback={responseFacebook}
          onFailure={handleFailure}
        />
        
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#666', 
          marginTop: '20px',
          lineHeight: '1.4'
        }}>
          We use Facebook to verify your identity and create your account securely.
        </p>
      </LoginCard>
    </LoginContainer>
  );
};

export default FacebookLoginComponent;
