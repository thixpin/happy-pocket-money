import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Giveaway, GiveawayResponse, ParticipantResult, DashboardData } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FacebookLoginStatic from './FacebookLoginStatic';
import GiverInfo from './GiverInfo';
import { updateMetaTags, generateGiveawayMetaTags } from '../utils/metaTags';

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
  max-width: 500px;
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
`;

const InfoItem = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

const PaymentMethods = styled.div`
  margin: 20px 0;
`;

const PaymentMethodTag = styled.span`
  display: inline-block;
  background: #e8f5e8;
  color: #27ae60;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
  margin: 2px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 1rem;
    margin-top: 15px;
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

const GiveawayPage: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [giveawayData, setGiveawayData] = useState<GiveawayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    if (hash) {
      loadGiveaway();
    }
  }, [hash]);

  const loadGiveaway = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getGiveaway(hash!);
      setGiveawayData(response);
      
      // Update meta tags for social sharing
      if (response.giveaway) {
        const metaTags = generateGiveawayMetaTags(response.giveaway);
        updateMetaTags(metaTags);
      }
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to load giveaway');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipate = async () => {
    if (!user?.name) {
      setError('User name not available');
      return;
    }

    try {
      setIsParticipating(true);
      setError(null);
      const response = await apiService.participateInGiveaway(hash!, { userName: user.name });
      
      // Redirect to result page
      navigate(`/giveaway/${hash}/result`, { 
        state: { 
          participant: response.participant,
          giveaway: response.giveaway 
        }
      });
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to participate');
    } finally {
      setIsParticipating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <p style={{ marginTop: '20px', color: '#666' }}>Loading...</p>
        </Card>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Card>
          <Title>🎊 Join the Giveaway!</Title>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Please login with Facebook to participate in this pocket money giveaway.
          </p>
          <FacebookLoginStatic onSuccess={() => {
            // The AuthCallback component will handle the redirect
            // This onSuccess is just a fallback
            window.location.reload();
          }} />
        </Card>
      </Container>
    );
  }

  if (error && !giveawayData) {
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

  if (!giveawayData) {
    return (
      <Container>
        <Card>
          <Title>❌ Giveaway Not Found</Title>
          <p>The giveaway you're looking for doesn't exist or has expired.</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Card>
      </Container>
    );
  }

  const { giveaway, participant, dashboard } = giveawayData;
  const isFull = giveaway.participantsCount! >= giveaway.receiverCount;
  const remainingSlots = giveaway.remainingSlots || 0;
  const isCompleted = giveaway.status === 'completed';

  // Owner view - show dashboard
  if (dashboard) {
    return (
      <Container>
        <Card>
          <Title>🎊  Giveaway Results 🎊 </Title>
          
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Total Budget</InfoLabel>
              <InfoValue>{giveaway.budget.toLocaleString()} MMK</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Total Distributed</InfoLabel>
              <InfoValue>{dashboard.totalDistributed.toLocaleString()} MMK</InfoValue>
            </InfoItem>
          </InfoGrid>

          <InfoGrid>
            <InfoItem>
              <InfoLabel>Participants</InfoLabel>
              <InfoValue>{dashboard.participants.length} / {giveaway.receiverCount}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Remaining</InfoLabel>
              <InfoValue>{giveaway.receiverCount - dashboard.participants.length}</InfoValue>
            </InfoItem>
          </InfoGrid>

          <PaymentMethods>
            <h4>Payment Methods:</h4>
            {giveaway.paymentMethods.map(method => (
              <PaymentMethodTag key={method}>
                {method.replace('_', ' ').toUpperCase()}
              </PaymentMethodTag>
            ))}
          </PaymentMethods>

          {dashboard.participants.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              <h3>🎉 Participants</h3>
              {dashboard.participants.map((p, index) => (
                <div key={p.userId} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '10px',
                  margin: '10px 0',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {p.profilePicture ? (
                        <img 
                          src={p.profilePicture} 
                          alt={p.userName}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e9ecef'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
                        display: p.profilePicture ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        border: '2px solid #e9ecef'
                      }}>
                        {p.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{p.userName}</strong>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          {new Date(p.participatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                        {p.portion.toLocaleString()} MMK
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
              <p>No participants yet. Share the link to get started!</p>
            </div>
          )}

          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Card>
      </Container>
    );
  }

  // Participant view - show their results
  if (participant) {
    // Redirect to result page
    navigate(`/giveaway/${hash}/result`, { 
      state: { 
        participant: participant,
        giveaway: giveaway 
      }
    });
    // return (
    //   <Container>
    //     <Card>
    //       <Title>🎉 Congratulations!</Title>
    //       <p style={{ marginBottom: '20px', color: '#666' }}>
    //         You've successfully joined this giveaway!
    //       </p>
          
    //       <InfoGrid>
    //         <InfoItem>
    //           <InfoLabel>Your Portion</InfoLabel>
    //           <InfoValue style={{ color: '#27ae60', fontSize: '1.5rem' }}>
    //             {participant.portion.toLocaleString()} MMK
    //           </InfoValue>
    //         </InfoItem>
    //         <InfoItem>
    //           <InfoLabel>Participated At</InfoLabel>
    //           <InfoValue style={{ fontSize: '0.9rem' }}>
    //             {new Date(participant.participatedAt).toLocaleString()}
    //           </InfoValue>
    //         </InfoItem>
    //       </InfoGrid>

    //       <div style={{ marginTop: '20px', textAlign: 'center' }}>
    //         <p style={{ marginBottom: '15px' }}>
    //           Contact the giveaway owner to receive your portion:
    //         </p>
    //         <Button 
    //           onClick={() => window.open(participant.profileLink, '_blank')}
    //           style={{ background: '#007bff' }}
    //         >
    //           💬 Contact Owner on Messenger
    //         </Button>
    //       </div>

    //       <Button onClick={() => navigate('/')} style={{ marginTop: '15px', background: '#6c757d' }}>
    //         Go Home
    //       </Button>
    //     </Card>
    //   </Container>
    // );
  }

  // Completed giveaway view - show results
  if (isCompleted && dashboard) {
    const dashboardData = dashboard as DashboardData;
    return (
      <Container>
        <Card>
          <Title>🎉 Giveaway Results</Title>
          
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Total Budget</InfoLabel>
              <InfoValue>{giveaway.budget.toLocaleString()} MMK</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Total Distributed</InfoLabel>
              <InfoValue>{dashboardData.totalDistributed.toLocaleString()} MMK</InfoValue>
            </InfoItem>
          </InfoGrid>

          <InfoGrid>
            <InfoItem>
              <InfoLabel>Participants</InfoLabel>
              <InfoValue>{dashboardData.participants.length} / {giveaway.receiverCount}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Status</InfoLabel>
              <InfoValue style={{ color: '#27ae60' }}>✅ Completed</InfoValue>
            </InfoItem>
          </InfoGrid>

          <PaymentMethods>
            <h4>Payment Methods:</h4>
            {giveaway.paymentMethods.map(method => (
              <PaymentMethodTag key={method}>
                {method.replace('_', ' ').toUpperCase()}
              </PaymentMethodTag>
            ))}
          </PaymentMethods>

          {dashboardData.participants.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              <h3>🎊 Winners & Results</h3>
              {dashboardData.participants.map((p: any, index: number) => (
                <div key={p.userId} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '10px',
                  margin: '10px 0',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {p.profilePicture ? (
                        <img 
                          src={p.profilePicture} 
                          alt={p.userName}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e9ecef'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
                        display: p.profilePicture ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        border: '2px solid #e9ecef'
                      }}>
                        {p.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{p.userName}</strong>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          {new Date(p.participatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                        {p.portion.toLocaleString()} MMK
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
              <p>No participants in this giveaway.</p>
            </div>
          )}

          <Button onClick={() => navigate('/')}>
            🏠 Go Home
          </Button>
        </Card>
      </Container>
    );
  }

  // Regular view - show participation form
  return (
    <Container>
      <Card>
        <Title>🎊 Pocket Money Giveaway</Title>
        
        <GiverInfo giveaway={giveaway} />
        
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Total Budget</InfoLabel>
            <InfoValue>{giveaway.budget.toLocaleString()} MMK</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Receivers</InfoLabel>
            <InfoValue>{giveaway.participantsCount || 0} / {giveaway.receiverCount}</InfoValue>
          </InfoItem>
        </InfoGrid>

        <PaymentMethods>
          <h4>Payment Methods:</h4>
          {giveaway.paymentMethods.map(method => (
            <PaymentMethodTag key={method}>
              {method.replace('_', ' ').toUpperCase()}
            </PaymentMethodTag>
          ))}
        </PaymentMethods>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isFull ? (
          <div>
            <h3>🎉 Giveaway Complete!</h3>
            <p>All slots have been filled. Check back later for the results!</p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        ) : (
          <div>
            <h3>Join the Giveaway!</h3>
            <p>{remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining</p>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Participating as: <strong>{user?.name}</strong>
            </p>
            
            <div style={{ marginTop: '20px' }}>
              <Button 
                onClick={handleParticipate}
                disabled={isParticipating}
              >
                {isParticipating ? 'Participating...' : 'Get My Portion!'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default GiveawayPage;
