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

const OrderedList = styled.ol`
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

const DataDeletionInstructions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Card>
        <Title>🗑️ Data Deletion Instructions</Title>
        
        <Content>
          <Paragraph>
            You can request deletion of your data associated with this app at any time. 
            We respect your privacy and will process your request promptly.
          </Paragraph>
          
          <SectionTitle>📧 How to Request Deletion</SectionTitle>
          <OrderedList>
            <ListItem>Send an email to privacy@thixpin.me from your account email</ListItem>
            <ListItem>Include your account identifier and any relevant giveaway IDs</ListItem>
            <ListItem>We will confirm the request and delete your data within 30 days</ListItem>
            <ListItem>You will receive a confirmation email once deletion is complete</ListItem>
          </OrderedList>
          
          <SectionTitle>🔧 Alternative Method</SectionTitle>
          <Paragraph>
            Alternatively, you may revoke app permissions in your Facebook account settings, 
            which removes our access to your data immediately.
          </Paragraph>
          
          <SectionTitle>📋 What Gets Deleted</SectionTitle>
          <Paragraph>
            When you request data deletion, we will remove:
          </Paragraph>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Your account information</li>
            <li>Giveaway participation history</li>
            <li>Any personal data we have stored</li>
          </ul>
          
          <SectionTitle>⏱️ Processing Time</SectionTitle>
          <Paragraph>
            Data deletion requests are typically processed within 30 days. 
            You will receive confirmation once your data has been completely removed from our systems.
          </Paragraph>
        </Content>

        <Button onClick={() => navigate('/')}>
          🏠 Go Home
        </Button>
      </Card>
    </Container>
  );
};

export default DataDeletionInstructions;
