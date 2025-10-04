import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Giveaway, Participant } from '../types';
import { apiService } from '../services/api';
import GiverInfo from './GiverInfo';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 100%;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
    margin-top: 10px;
    border-radius: 15px;
  }
`;

const Title = styled.h1`
  color: #d4af37;
  font-size: 2rem;
  margin-bottom: 30px;
  font-weight: bold;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const ParticipantsSection = styled.div`
  margin-top: 30px;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
`;

const ParticipantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ParticipantCard = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const ParticipantInfo = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfilePicture = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
`;

const DefaultProfilePicture = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  border: 2px solid #e9ecef;
`;

const ParticipantDetails = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const ParticipantAmount = styled.div`
  color: #27ae60;
  font-weight: bold;
  font-size: 1.1rem;
`;

const ProfileLink = styled.a`
  background: #1877f2;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: bold;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    color: white;
  }
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
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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

const Dashboard: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (hash) {
      loadDashboard();
    }
  }, [hash]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000); // Auto-hide after 3 seconds
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getDashboard(hash!);
      setGiveaway(response.giveaway);
      setParticipants(response.participants);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const copyGiveawayLink = async () => {
    if (giveaway?.url) {
      try {
        await navigator.clipboard.writeText(giveaway.url);
        showToast('🎉 Giveaway link copied to clipboard!', 'success');
      } catch (error) {
        // Fallback for older browsers or when clipboard API fails
        const textArea = document.createElement('textarea');
        textArea.value = giveaway.url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          showToast('🎉 Giveaway link copied to clipboard!', 'success');
        } catch (fallbackError) {
          showToast('❌ Failed to copy link. Please copy manually.', 'error');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } else {
      showToast('❌ Giveaway URL not available', 'error');
    }
  };

  if (isLoading) {
    return (
      <Container>
        {toast && (
          <Toast type={toast.type}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </Toast>
        )}
        <Card>
          <LoadingSpinner />
          <p style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>Loading dashboard...</p>
        </Card>
      </Container>
    );
  }

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

  if (!giveaway) {
    return (
      <Container>
        {toast && (
          <Toast type={toast.type}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </Toast>
        )}
        <Card>
          <Title>❌ Giveaway Not Found</Title>
          <p>The giveaway you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Card>
      </Container>
    );
  }

  const totalDistributed = participants.reduce((sum, p) => sum + p.portion, 0);
  const isComplete = giveaway.status === 'completed';

  return (
    <Container>
      {toast && (
        <Toast type={toast.type}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </Toast>
      )}
      <Card>
        <Title>🎊 Giveaway Dashboard</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <GiverInfo giveaway={giveaway} />
        
        <StatsGrid>
          <StatCard>
            <StatLabel>Total Budget</StatLabel>
            <StatValue>{giveaway.budget.toLocaleString()} MMK</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Distributed</StatLabel>
            <StatValue>{totalDistributed.toLocaleString()} MMK</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Participants</StatLabel>
            <StatValue>{participants.length} / {giveaway.receiverCount}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Status</StatLabel>
            <StatValue style={{ 
              color: isComplete ? '#27ae60' : '#f39c12',
              fontSize: '1.2rem'
            }}>
              {isComplete ? '✅ Complete' : '⏳ Active'}
            </StatValue>
          </StatCard>
        </StatsGrid>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Button onClick={copyGiveawayLink}>
            📋 Copy Giveaway Link
          </Button>
          <Button 
            onClick={() => navigate('/')}
            style={{ background: '#6c757d' }}
          >
            🏠 Go Home
          </Button>
        </div>

        <ParticipantsSection>
          <SectionTitle>
            Participants ({participants.length})
          </SectionTitle>
          
          {participants.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No participants yet. Share the giveaway link to get started!
            </p>
          ) : (
            <ParticipantList>
              {participants.map((participant, index) => (
                <ParticipantCard key={index}>
                  <ParticipantInfo>
                    {participant.profilePicture ? (
                      <ProfilePicture 
                        src={participant.profilePicture} 
                        alt={participant.userName}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <DefaultProfilePicture style={{ display: participant.profilePicture ? 'none' : 'flex' }}>
                      {participant.userName.charAt(0).toUpperCase()}
                    </DefaultProfilePicture>
                    <ParticipantDetails>
                      <ParticipantName>{participant.userName}</ParticipantName>
                      <ParticipantAmount>{participant.portion.toLocaleString()} MMK</ParticipantAmount>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        Joined: {new Date(participant.participatedAt).toLocaleDateString()}
                      </div>
                    </ParticipantDetails>
                  </ParticipantInfo>
                  <ProfileLink 
                    href={participant.profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    👤 View Profile
                  </ProfileLink>
                </ParticipantCard>
              ))}
            </ParticipantList>
          )}
        </ParticipantsSection>

        {isComplete && (
          <div style={{ 
            background: '#e8f5e8', 
            border: '1px solid #a7f3d0', 
            borderRadius: '10px', 
            padding: '20px', 
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>🎉 Giveaway Complete!</h3>
            <p style={{ color: '#666', margin: 0 }}>
              All participants have received their portions. Contact them via Messenger to send the money.
            </p>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default Dashboard;
