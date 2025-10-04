import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
  max-width: 600px;
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

const Content = styled.div`
  text-align: left;
  line-height: 1.6;
  color: #333;
`;

const Paragraph = styled.p`
  margin-bottom: 20px;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 15px;
    line-height: 1.4;
  }
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
  
  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 1rem;
    margin-top: 15px;
  }
`;

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Card>
        <Title>🎊 About Pocket Money</Title>
        
        <Content>
          <Paragraph>
            Pocket Money helps you run transparent giveaways and distribute prizes fairly among participants. 
            Perfect for festivals, celebrations, and special occasions!
          </Paragraph>
          
          <Paragraph>
            This app uses secure Facebook authentication and provides tools for managing entries, 
            drawing results, and sharing updates with your community.
          </Paragraph>
          
          <Paragraph>
            <strong>Key Features:</strong>
          </Paragraph>
          <ul style={{ textAlign: 'left', marginLeft: '20px', marginBottom: '20px' }}>
            <li>🎯 Fair and transparent distribution</li>
            <li>🔐 Secure Facebook login</li>
            <li>📱 Mobile-friendly design</li>
            <li>💬 Easy sharing and communication</li>
            <li>📊 Real-time participation tracking</li>
          </ul>
        </Content>

        <Button onClick={() => navigate('/')}>
          🏠 Go Home
        </Button>
      </Card>
    </Container>
  );
};

export default About;
