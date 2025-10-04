import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.p`
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
`;

const LoadingSpinner: React.FC = () => {
  return (
    <SpinnerContainer>
      <Spinner />
      <LoadingText>Loading...</LoadingText>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
