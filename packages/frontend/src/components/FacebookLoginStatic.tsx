import React from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 15px;
  }
`;

const Title = styled.h1`
  color: #d4af37;
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 20px;
  }
`;

const FestivalIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const FacebookButton = styled.button`
  background: #1877f2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover {
    transform: translateY(-2px);
    background: #166fe5;
  }
  
  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 1rem;
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

interface FacebookLoginStaticProps {
  onSuccess?: () => void;
}

const FacebookLoginStatic: React.FC<FacebookLoginStaticProps> = ({ onSuccess }) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleFacebookLogin = () => {
    try {
      setError(null);
      
      // Store the current URL as the intended redirect destination
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('intendedRedirectUrl', currentPath);
      
      console.log('FacebookLoginStatic - Storing redirect URL:', currentPath);
      
      // Construct Facebook OAuth URL with static redirect URI
      const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
      const scope = 'public_profile';
      const state = 'facebookdirect';
      
      const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
      
      console.log('FacebookLoginStatic - Redirecting to Facebook OAuth');
      
      // Redirect to Facebook OAuth
      window.location.href = facebookAuthUrl;
      
    } catch (error: any) {
      console.error('Facebook login error:', error);
      setError('Failed to initiate Facebook login. Please try again.');
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <FestivalIcon>🎊</FestivalIcon>
        <Title>Thadingyut Festival</Title>
        <Subtitle>Share pocket money with your loved ones</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FacebookButton onClick={handleFacebookLogin}>
          <span>📘</span>
          Continue with Facebook
        </FacebookButton>
        
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

export default FacebookLoginStatic;
