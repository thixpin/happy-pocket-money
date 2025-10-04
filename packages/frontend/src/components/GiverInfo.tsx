import React from 'react';
import styled from 'styled-components';
import { Giveaway } from '../types';

const GiverInfoContainer = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
`;

const GiverProfilePicture = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
  flex-shrink: 0;
`;

const DefaultProfilePicture = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  border: 3px solid #e9ecef;
  flex-shrink: 0;
`;

const GiverDetails = styled.div`
  flex: 1;
`;

const GiverLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const GiverName = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const ProfileLink = styled.a`
  background: #1877f2;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: bold;
  display: inline-block;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    color: white;
  }
  
  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

interface GiverInfoProps {
  giveaway: Giveaway;
}

const GiverInfo: React.FC<GiverInfoProps> = ({ giveaway }) => {
  if (!giveaway.giver) {
    return null;
  }

  const { name, profilePicture, profileLink } = giveaway.giver;

  return (
    <GiverInfoContainer>
      {profilePicture ? (
        <GiverProfilePicture 
          src={profilePicture} 
          alt={name}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextElement) {
              nextElement.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <DefaultProfilePicture style={{ display: profilePicture ? 'none' : 'flex' }}>
        {name.charAt(0).toUpperCase()}
      </DefaultProfilePicture>
      
      <GiverDetails>
        <GiverLabel>🎊 Giver</GiverLabel>
        <GiverName>{name}</GiverName>
        <ProfileLink 
          href={profileLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          👤 View Profile
        </ProfileLink>
      </GiverDetails>
    </GiverInfoContainer>
  );
};

export default GiverInfo;
