import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FacebookShareButton, FacebookIcon } from 'react-share';
import GiverInfo from './GiverInfo';
import { updateMetaTags, generateResultMetaTags } from '../utils/metaTags';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  margin-top: 20px;
  text-align: center;
`;

const CelebrationIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #d4af37;
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: bold;
`;

const Amount = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #27ae60;
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Currency = styled.span`
  font-size: 1.5rem;
  color: #666;
  margin-left: 10px;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const ShareSection = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
`;

const ShareTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
`;

const ShareButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  margin: 5px;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ContactButton = styled.a`
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  display: inline-block;
  transition: transform 0.2s;
  margin: 5px;
  
  &:hover {
    transform: translateY(-2px);
    color: white;
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

const Toast = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.type === 'success' ? '#27ae60' : '#e74c3c'};
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideIn 0.3s ease-out;
  max-width: 300px;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const ResultPage: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<any>(null);
  const [giveaway, setGiveaway] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (location.state?.participant && location.state?.giveaway) {
      setParticipant(location.state.participant);
      setGiveaway(location.state.giveaway);
      
      // Update meta tags for social sharing
      const metaTags = generateResultMetaTags(location.state.participant, location.state.giveaway);
      updateMetaTags(metaTags);
    } else {
      setError('No result data found. Please participate in the giveaway first.');
    }
  }, [location.state]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000); // Auto-hide after 3 seconds
  };

  const shareUrl = window.location.origin + `/giveaway/${hash}`;
  const shareTitle = `I just won ${participant?.portion} MMK in a Thadingyut Festival pocket money giveaway! 🎊`;

  const copyToClipboard = async () => {
    const text = `I won ${participant?.portion} MMK in a Thadingyut Festival pocket money giveaway! 🎊 Join me: ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(text);
      showToast('🎉 Share text copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        showToast('🎉 Share text copied to clipboard!', 'success');
      } catch (fallbackError) {
        showToast('❌ Failed to copy text. Please copy manually.', 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  if (error) {
    return (
      <Container>
        {toast && (
          <Toast type={toast.type}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </Toast>
        )}
        <Card>
          <Title>❌ Error</Title>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Card>
      </Container>
    );
  }

  if (!participant) {
    return (
      <Container>
        {toast && (
          <Toast type={toast.type}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </Toast>
        )}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
            <p>Loading your result...</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      {toast && (
        <Toast type={toast.type}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </Toast>
      )}
      <Card>
        <CelebrationIcon>🎉</CelebrationIcon>
        <Title>Congratulations!</Title>
        <Message>You received a portion of the pocket money!</Message>
        
        <Amount>
          {participant.portion.toLocaleString()}
          <Currency>MMK</Currency>
        </Amount>
        
        <Message>
          Contact the giver via their Facebook profile to receive your money.
        </Message>

        {giveaway && <GiverInfo giveaway={giveaway} />}

        <ShareSection>
          <ShareTitle>Share Your Win! 🎊</ShareTitle>
          <ShareButtons>
            <FacebookShareButton
              url={shareUrl}
              hashtag="#ThadingyutFestival #PocketMoney"
            >
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            
            <Button onClick={copyToClipboard}>
              📋 Copy Text
            </Button>
          </ShareButtons>
        </ShareSection>

        <Button 
          onClick={() => navigate('/')}
          style={{ marginTop: '20px', background: '#6c757d' }}
        >
          Create Your Own Giveaway
        </Button>
      </Card>
    </Container>
  );
};

export default ResultPage;
