import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck, FaSpinner, FaExclamationCircle, FaClock } from 'react-icons/fa';

const StepsContainer = styled.div`
  background-color: var(--neutral-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
`;

const StepsHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--neutral-900);
  }
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StepIconContainer = styled(motion.div)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => {
    switch(props.status) {
      case 'completed': return 'var(--success)';
      case 'running': return 'var(--primary)';
      case 'failed': return 'var(--danger)';
      default: return 'var(--neutral-300)';
    }
  }};
  color: white;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepName = styled.div`
  font-weight: 500;
  color: ${props => {
    if (props.error) return 'var(--danger)';
    if (props.active) return 'var(--primary)';
    return 'var(--neutral-800)';
  }};
  font-size: 1rem;
`;

const StepDetails = styled.div`
  color: ${props => props.error ? 'var(--danger)' : 'var(--neutral-600)'};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const ProgressLine = styled.div`
  width: 2px;
  height: 20px;
  background-color: ${props => 
    props.error ? 'var(--danger)' :
    props.completed ? 'var(--success)' : 
    props.active ? 'var(--primary)' : 'var(--neutral-300)'
  };
  margin-left: 18px; // Center with the step icon
`;

const ErrorIndicator = styled.div`
  margin-top: 0.25rem;
  color: var(--danger);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const stepIconVariants = {
  initial: { scale: 0.8 },
  animate: { scale: 1 },
  pulse: { 
    scale: [1, 1.1, 1],
    transition: { 
      repeat: Infinity,
      duration: 1.5
    }
  }
};

const MigrationSteps = ({ steps, currentStep }) => {
  const getStepIcon = (status, isCurrentStep) => {
    switch(status) {
      case 'completed':
        return <FaCheck size={16} />;
      case 'running':
        return <FaSpinner size={16} className="fa-spin" />;
      case 'failed':
        return <FaExclamationCircle size={16} />;
      default:
        return <FaClock size={16} />;
    }
  };
  
  const getStepDetails = (step, index) => {
    // If step has an error, show the error message
    if (step.status === 'failed' || step.error) {
      return 'Failed';
    }
    
    switch(step.status) {
      case 'completed':
        if (step.id === 'users') 
          return `Found ${step.data?.length || 0} users`;
        if (step.id === 'pages') 
          return `Found ${step.data?.length || 0} pages`;
        if (step.id === 'posts') 
          return `Found ${step.data?.length || 0} posts`;
        if (step.id === 'transform') 
          return `Transformed ${step.data?.succeeded || 0} items`;
        if (step.id === 'upload') 
          return `Uploaded ${step.data?.succeeded || 0} items`;
        if (step.id === 'report') 
          return `Report generated at ${new Date().toLocaleTimeString()}`;
        return 'Completed';
      case 'running':
        return 'In progress...';
      case 'failed':
        return 'Failed';
      default:
        return 'Waiting to start';
    }
  };
  
  return (
    <StepsContainer>
      <StepsHeader>
        <h2>Migration Steps</h2>
      </StepsHeader>
      
      <StepsList>
        {steps.map((step, index) => {
          const hasError = step.status === 'failed' || step.error;
          
          return (
            <React.Fragment key={step.id}>
              <Step>
                <StepIconContainer 
                  status={step.status}
                  variants={stepIconVariants}
                  initial="initial"
                  animate={step.status === 'running' ? 'pulse' : 'animate'}
                  transition={{ duration: 0.2 }}
                >
                  {getStepIcon(step.status, index === currentStep)}
                </StepIconContainer>
                
                <StepContent>
                  <StepName 
                    active={index === currentStep || step.status === 'running'} 
                    error={hasError}
                  >
                    {step.name}
                  </StepName>
                  <StepDetails error={hasError}>
                    {getStepDetails(step, index)}
                  </StepDetails>
                  {hasError && step.error && (
                    <ErrorIndicator>
                      <FaExclamationCircle size={12} />
                      {step.error}
                    </ErrorIndicator>
                  )}
                </StepContent>
              </Step>
              
              {index < steps.length - 1 && (
                <ProgressLine 
                  completed={step.status === 'completed'} 
                  active={index === currentStep || step.status === 'running'} 
                  error={hasError}
                />
              )}
            </React.Fragment>
          );
        })}
      </StepsList>
    </StepsContainer>
  );
};

export default MigrationSteps; 