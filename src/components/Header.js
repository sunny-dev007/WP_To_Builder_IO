import React from 'react';
import styled from 'styled-components';
import { FaWordpress, FaArrowRight, FaCubes } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background-color: var(--neutral-100);
  box-shadow: var(--shadow-sm);
  padding: 1rem 0;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-size: 1.5rem;
    margin: 0;
    color: var(--neutral-900);
  }
`;

const MigrationTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.bgColor || 'var(--primary)'};
  color: white;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <div className="container">
        <HeaderContent>
          <Logo>
            <h1>WordPress to Builder.io Migration</h1>
          </Logo>
          
          <MigrationTitle>
            <IconContainer bgColor="#21759b">
              <FaWordpress size={20} />
            </IconContainer>
            
            <FaArrowRight color="var(--neutral-600)" />
            
            <IconContainer bgColor="#000000">
              <FaCubes size={20} />
            </IconContainer>
          </MigrationTitle>
        </HeaderContent>
      </div>
    </HeaderContainer>
  );
};

export default Header; 