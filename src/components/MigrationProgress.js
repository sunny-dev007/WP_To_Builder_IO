import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaCloudUploadAlt, FaCog } from 'react-icons/fa';

const ProgressContainer = styled.div`
  background-color: var(--neutral-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${props => props.error ? 'var(--danger)' : 'var(--primary)'};
    font-weight: 600;
  }
`;

const ProgressBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProgressBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: 0.875rem;
    color: var(--neutral-700);
    font-weight: 500;
  }
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 10px;
  background-color: var(--neutral-200);
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressBarFill = styled(motion.div)`
  height: 100%;
  background-color: ${props => props.color || 'var(--primary)'};
  border-radius: 5px;
  width: ${props => props.percent || 0}%;
`;

const StepVisual = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background-color: var(--neutral-200);
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const InfoBox = styled.div`
  padding: 1rem;
  background-color: var(--neutral-200);
  border-radius: var(--border-radius-md);
  border-left: 4px solid ${props => props.error ? 'var(--danger)' : 'var(--primary)'};
  
  h3 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: ${props => props.error ? 'var(--danger)' : 'var(--neutral-800)'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--neutral-600);
    line-height: 1.5;
  }
`;

const ErrorBox = styled.div`
  padding: 1rem;
  background-color: #FFF5F5;
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--danger);
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: var(--danger);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--neutral-700);
    line-height: 1.5;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatBox = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  
  h3 {
    font-size: 2rem;
    color: #2d3748;
    margin: 0;
  }
  
  p {
    color: #718096;
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
  }
`;

const CurrentStep = styled.div`
  font-size: 1.25rem;
  color: #4299e1;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #edf2f7;
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #48bb78);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const UploadAnimation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 2rem 0;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  color: #4299e1;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const UploadText = styled.div`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  color: #718096;
  font-size: 0.875rem;
  max-width: 400px;
  text-align: center;
  line-height: 1.5;
`;

const MigrationProgress = ({ currentStep, stats }) => {
  const calculateProgress = () => {
    const totalSteps = 7; // Total number of migration steps
    const currentStepIndex = currentStep ? currentStep.id === 'upload' ? 6 : 
      ['dependencies', 'users', 'pages', 'posts', 'transform'].indexOf(currentStep.id) + 1 : 0;
    return Math.round((currentStepIndex / totalSteps) * 100);
  };

  // Check if the current step has an error
  const hasError = currentStep.status === 'failed' || currentStep.error;
  
  // Get content for the current migration step
  const getStepContent = () => {
    // If this step has an error, show it
    if (hasError) {
      return (
        <InfoBox error>
          <h3>
            <FaExclamationTriangle />
            Error in {currentStep.name}
          </h3>
          <p>{currentStep.error || 'An unexpected error occurred during this step.'}</p>
        </InfoBox>
      );
    }
    
    switch(currentStep.id) {
      case 'dependencies':
        return (
          <InfoBox>
            <h3>Checking Dependencies</h3>
            <p>
              Verifying all required dependencies are installed for the migration process.
              This ensures all necessary tools are available for processing WordPress content.
            </p>
          </InfoBox>
        );
      case 'users':
        return (
          <InfoBox>
            <h3>Fetching WordPress Users</h3>
            <p>
              Retrieving all user accounts from the WordPress site to maintain authorship
              information during the migration process.
            </p>
          </InfoBox>
        );
      case 'pages':
        return (
          <InfoBox>
            <h3>Fetching WordPress Pages</h3>
            <p>
              Retrieving all page content, metadata, and media from the WordPress API to
              prepare for transformation to Builder.io format.
            </p>
          </InfoBox>
        );
      case 'posts':
        return (
          <InfoBox>
            <h3>Fetching WordPress Posts</h3>
            <p>
              Retrieving all blog posts, categories, tags, and associated media from the 
              WordPress API to prepare for migration.
            </p>
          </InfoBox>
        );
      case 'transform':
        return (
          <InfoBox>
            <h3>Transforming Content</h3>
            <p>
              Converting WordPress content structure to Builder.io format, including layout,
              styling, and media references. This preserves your content's appearance while
              adapting it to the Builder.io visual editing system.
            </p>
          </InfoBox>
        );
      case 'upload':
        return (
          <InfoBox>
            <h3>Uploading to Builder.io</h3>
            <p>
              Sending transformed content to your Builder.io account via the API.
              This creates new pages and content entries while preserving metadata,
              SEO information, and original publication dates.
            </p>
          </InfoBox>
        );
      case 'report':
        return (
          <InfoBox>
            <h3>Generating Report</h3>
            <p>
              Creating a detailed migration report with statistics, success rates,
              and any issues encountered during the process. This report will help
              identify any content that may need additional attention.
            </p>
          </InfoBox>
        );
      default:
        return null;
    }
  };
  
  return (
    <ProgressContainer>
      <ProgressHeader error={hasError}>
        <h2>{hasError ? 'Error in' : 'Currently Processing:'} {currentStep.name}</h2>
      </ProgressHeader>
      
      {hasError && (
        <ErrorBox>
          <h3>
            <FaExclamationTriangle />
            Migration Error
          </h3>
          <p>{currentStep.error || 'An unexpected error occurred during this step of the migration process.'}</p>
          <p>Check your configuration settings and try again. If the issue persists, review the logs for more details.</p>
        </ErrorBox>
      )}
      
      <StatsRow>
        <StatBox>
          <h3>{stats.transformedContent}</h3>
          <p>Items Processed</p>
        </StatBox>
        <StatBox>
          <h3>{stats.uploadedContent}</h3>
          <p>Items Uploaded</p>
        </StatBox>
        <StatBox>
          <h3>{stats.failedContent}</h3>
          <p>Failed Items</p>
        </StatBox>
      </StatsRow>

      <CurrentStep>
        <FaCog /> {currentStep?.name || 'Preparing Migration...'}
      </CurrentStep>

      <ProgressBar>
        <ProgressFill progress={calculateProgress()} />
      </ProgressBar>

      {currentStep?.id === 'upload' && (
        <UploadAnimation>
          <UploadIcon>
            <FaCloudUploadAlt />
          </UploadIcon>
          <UploadText>Uploading to Builder.io</UploadText>
          <UploadSubtext>
            Sending transformed content to your Builder.io account via the API. 
            This creates new pages and content entries while preserving metadata, 
            SEO information, and original publication dates.
          </UploadSubtext>
        </UploadAnimation>
      )}
      
      {!hasError && (
        <StepVisual>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {currentStep.id === 'transform' && (
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F14b3a94fb8c64be5a9b6249175572cdb?width=400" 
                alt="Content transformation" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
            
            {currentStep.id === 'upload' && (
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F6747605de3e14f12a4e9de7c31bee673?width=400" 
                alt="Content upload" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
          </motion.div>
        </StepVisual>
      )}
      
      <ActionsContainer>
        {getStepContent()}
      </ActionsContainer>
    </ProgressContainer>
  );
};

export default MigrationProgress; 