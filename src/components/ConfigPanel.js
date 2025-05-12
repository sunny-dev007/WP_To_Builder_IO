import React from 'react';
import styled from 'styled-components';
import { FaCog, FaPlay, FaSpinner } from 'react-icons/fa';
import migrationConfig from '../config/migrationConfig';

const PanelContainer = styled.div`
  background-color: var(--neutral-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    margin-left: 0.75rem;
    font-size: 1.25rem;
    color: var(--neutral-900);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--neutral-700);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--neutral-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color var(--transition-speed);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 90, 251, 0.1);
  }
`;

const StartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: var(--primary);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-speed);
  margin-top: 1.5rem;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    background-color: var(--neutral-400);
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ConfigPanel = ({ 
  config = {
    wordpressUrl: migrationConfig.wordpress.url,
    builderApiKey: migrationConfig.builder.apiKey,
    builderModel: migrationConfig.builder.model
  }, 
  updateConfig = () => {}, 
  startMigration = () => {}, 
  isMigrating = false 
}) => {
  const safeConfig = config || {
    wordpressUrl: migrationConfig.wordpress.url,
    builderApiKey: migrationConfig.builder.apiKey,
    builderModel: migrationConfig.builder.model
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateConfig({ [name]: value });
  };
  
  return (
    <PanelContainer>
      <PanelHeader>
        <FaCog size={20} color="var(--primary)" />
        <h2>Migration Configuration</h2>
      </PanelHeader>
      
      <FormGroup>
        <Label htmlFor="wordpressUrl">WordPress Site URL</Label>
        <Input
          type="text"
          id="wordpressUrl"
          name="wordpressUrl"
          value={safeConfig.wordpressUrl}
          onChange={handleChange}
          placeholder={migrationConfig.wordpress.url}
          disabled={isMigrating}
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="builderApiKey">Builder.io API Key</Label>
        <Input
          type="text"
          id="builderApiKey"
          name="builderApiKey"
          value={safeConfig.builderApiKey}
          onChange={handleChange}
          placeholder={migrationConfig.builder.apiKey}
          disabled={isMigrating}
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="builderModel">Builder.io Model</Label>
        <Input
          type="text"
          id="builderModel"
          name="builderModel"
          value={safeConfig.builderModel}
          onChange={handleChange}
          placeholder={migrationConfig.builder.model}
          disabled={isMigrating}
        />
      </FormGroup>
      
      <StartButton 
        onClick={startMigration} 
        disabled={isMigrating}
      >
        {isMigrating ? (
          <>
            <FaSpinner className="fa-spin" size={16} />
            <span>Migration in Progress...</span>
          </>
        ) : (
          <>
            <FaPlay size={16} />
            <span>Start Migration</span>
          </>
        )}
      </StartButton>
    </PanelContainer>
  );
};

export default ConfigPanel; 