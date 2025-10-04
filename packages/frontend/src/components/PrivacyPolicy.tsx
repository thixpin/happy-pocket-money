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

const SectionTitle = styled.h2`
  color: #d4af37;
  font-size: 1.3rem;
  margin-top: 30px;
  margin-bottom: 15px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-top: 20px;
    margin-bottom: 10px;
  }
`;

const List = styled.ul`
  margin-bottom: 20px;
  padding-left: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
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

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Card>
        <Title>🔒 Privacy Policy</Title>
        
        <Content>
          <Paragraph>
            We respect your privacy. This policy explains what information we collect and how we use it.
          </Paragraph>
          
          <SectionTitle>📋 Information We Collect</SectionTitle>
          <List>
            <ListItem>Account information provided during login via Facebook (name, profile picture)</ListItem>
            <ListItem>Giveaway participation details you submit</ListItem>
            <ListItem>Usage data to improve our service</ListItem>
          </List>
          
          <SectionTitle>🎯 How We Use Information</SectionTitle>
          <List>
            <ListItem>To authenticate your account and keep you signed in</ListItem>
            <ListItem>To manage giveaways and show results</ListItem>
            <ListItem>To provide customer support</ListItem>
            <ListItem>To improve our app functionality</ListItem>
          </List>
          
          <SectionTitle>🛡️ Data Protection</SectionTitle>
          <Paragraph>
            We implement appropriate security measures to protect your personal information. 
            We do not sell or share your data with third parties without your consent.
          </Paragraph>
          
          <SectionTitle>📞 Contact</SectionTitle>
          <Paragraph>
            If you have questions about this privacy policy, contact us at support@example.com.
          </Paragraph>
        </Content>

        <Button onClick={() => navigate('/')}>
          🏠 Go Home
        </Button>
      </Card>
    </Container>
  );
};

export default PrivacyPolicy;
