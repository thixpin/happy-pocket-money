import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Giveaway, Participant } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 15px;
    margin-top: 10px;
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

const SectionTitle = styled.h2`
  color: #d4af37;
  font-size: 1.5rem;
  margin-top: 30px;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-top: 20px;
    margin-bottom: 15px;
  }
`;

const GiveawayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
`;

const GiveawayCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  border: 2px solid #e9ecef;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: left;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const GiveawayTitle = styled.h3`
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: bold;
`;

const GiveawayInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 15px 0;
`;

const InfoItem = styled.div`
  background: white;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#e8f5e8';
      case 'completed': return '#fff3cd';
      case 'expired': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#27ae60';
      case 'completed': return '#856404';
      case 'expired': return '#721c24';
      default: return '#6c757d';
    }
  }};
`;

const Button = styled.button`
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
  margin-top: 10px;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
  margin-top: 10px;
  
  &:hover {
    transform: translateY(-1px);
  }
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

const ErrorMessage = styled.div`
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
  font-size: 1.1rem;
`;

const MyGiveaways: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [giveaways, setGiveaways] = useState<{
    created: Giveaway[];
    participated: Array<{
      giveaway: Giveaway;
      participant: Participant;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadGiveaways();
    }
  }, [isAuthenticated]);

  const loadGiveaways = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getUserGiveaways();
      setGiveaways(response);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to load giveaways');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  if (authLoading || isLoading) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <p style={{ marginTop: '20px', color: '#666' }}>Loading your giveaways...</p>
        </Card>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Card>
          <Title>🔐 Authentication Required</Title>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Please login to view your giveaways.
          </p>
          <Button onClick={() => navigate('/login')}>
            Login with Facebook
          </Button>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
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

  return (
    <Container>
      <Card>
        <Title>🎊 My Giveaways</Title>
        
        {giveaways && (
          <>
            {/* Created Giveaways */}
            <SectionTitle>📝 Giveaways I Created</SectionTitle>
            {giveaways.created.length > 0 ? (
              <GiveawayGrid>
                {giveaways.created.map((giveaway) => (
                  <GiveawayCard key={giveaway.id}>
                    <GiveawayTitle>{giveaway.budget.toLocaleString()} MMK Giveaway</GiveawayTitle>
                    <StatusBadge status={giveaway.status}>
                      {getStatusText(giveaway.status)}
                    </StatusBadge>
                    
                    <GiveawayInfo>
                      <InfoItem>
                        <InfoLabel>Participants</InfoLabel>
                        <InfoValue>{giveaway.participantsCount || 0} / {giveaway.receiverCount}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Created</InfoLabel>
                        <InfoValue>{formatDate(giveaway.createdAt)}</InfoValue>
                      </InfoItem>
                    </GiveawayInfo>
                    
                    <Button onClick={() => navigate(`/giveaway/${giveaway.hash}/dashboard`)}>
                      📊 View Dashboard
                    </Button>
                  </GiveawayCard>
                ))}
              </GiveawayGrid>
            ) : (
              <EmptyState>
                <p>You haven't created any giveaways yet.</p>
                <Button onClick={() => navigate('/create')} style={{ marginTop: '20px' }}>
                  🎊 Create Your First Giveaway
                </Button>
              </EmptyState>
            )}

            {/* Participated Giveaways */}
            <SectionTitle>🎉 Giveaways I Participated In</SectionTitle>
            {giveaways.participated.length > 0 ? (
              <GiveawayGrid>
                {giveaways.participated.map(({ giveaway, participant }) => (
                  <GiveawayCard key={giveaway.id}>
                    <GiveawayTitle>{giveaway.budget.toLocaleString()} MMK Giveaway</GiveawayTitle>
                    <StatusBadge status={giveaway.status}>
                      {getStatusText(giveaway.status)}
                    </StatusBadge>
                    
                    <GiveawayInfo>
                      <InfoItem>
                        <InfoLabel>My Portion</InfoLabel>
                        <InfoValue>{participant.portion.toLocaleString()} MMK</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Participated</InfoLabel>
                        <InfoValue>{formatDate(participant.participatedAt)}</InfoValue>
                      </InfoItem>
                    </GiveawayInfo>
                    
                    <Button onClick={() => navigate(`/giveaway/${giveaway.hash}`)}>
                      👀 View Giveaway
                    </Button>
                    
                    {participant.profileLink && (
                      <SecondaryButton 
                        onClick={() => window.open(participant.profileLink, '_blank')}
                      >
                        👤 View Giver Profile
                      </SecondaryButton>
                    )}
                  </GiveawayCard>
                ))}
              </GiveawayGrid>
            ) : (
              <EmptyState>
                <p>You haven't participated in any giveaways yet.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                  Join a giveaway to see it here!
                </p>
              </EmptyState>
            )}
          </>
        )}

        <Button onClick={() => navigate('/')} style={{ marginTop: '30px' }}>
          🏠 Go Home
        </Button>
      </Card>
    </Container>
  );
};

export default MyGiveaways;
