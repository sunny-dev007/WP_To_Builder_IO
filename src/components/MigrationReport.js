import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaFileDownload, FaExclamationTriangle } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const ReportContainer = styled(motion.div)`
  background-color: var(--neutral-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
`;

const ReportHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--neutral-300);
  
  h2 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.75rem;
    color: var(--success);
  }
`;

const ReportDate = styled.div`
  color: var(--neutral-600);
  font-size: 0.875rem;
`;

const ReportSummary = styled.div`
  margin-bottom: 2rem;
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const SummaryCard = styled.div`
  background-color: var(--neutral-200);
  border-radius: var(--border-radius-md);
  padding: 1.25rem;
  text-align: center;
  
  h3 {
    margin: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: var(--neutral-600);
  }
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.color || 'var(--neutral-900)'};
  }
`;

const ChartsSection = styled.div`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background-color: var(--neutral-200);
  border-radius: var(--border-radius-md);
  padding: 1.25rem;
  
  h3 {
    margin: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
    color: var(--neutral-800);
  }
`;

const FailuresContainer = styled.div`
  margin-top: 2rem;
`;

const FailuresList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FailureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--neutral-200);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  
  .icon {
    color: var(--danger);
  }
  
  .reason {
    flex: 1;
    font-weight: 500;
    color: var(--neutral-800);
  }
  
  .count {
    background-color: var(--danger);
    color: white;
    font-weight: 600;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-speed);
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const MigrationReport = ({ report }) => {
  const { summary, contentBreakdown, failureReasons } = report;
  
  // Format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Data for pie chart
  const pieData = [
    { name: 'Successfully Migrated', value: summary.migratedContent },
    { name: 'Failed Content', value: summary.failedContent }
  ];
  
  // Data for bar chart
  const barData = [
    { 
      name: 'Pages',
      Migrated: contentBreakdown.pages.migrated,
      Failed: contentBreakdown.pages.failed
    },
    {
      name: 'Posts',
      Migrated: contentBreakdown.posts.migrated,
      Failed: contentBreakdown.posts.failed
    }
  ];
  
  const COLORS = ['var(--success)', 'var(--danger)'];
  
  return (
    <ReportContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ReportHeader>
        <h2>
          <FaCheckCircle />
          Migration Completed
        </h2>
        <DownloadButton>
          <FaFileDownload />
          Download Full Report
        </DownloadButton>
      </ReportHeader>
      
      <ReportSummary>
        <h3>Migration Summary</h3>
        <ReportDate>
          Completed on {formatDate(summary.endTime)}
          <br />
          Migration duration: {summary.migrationTime}
        </ReportDate>
        
        <SummaryCards>
          <SummaryCard>
            <h3>Total Content</h3>
            <div className="value">{summary.totalContent}</div>
          </SummaryCard>
          
          <SummaryCard color="var(--success)">
            <h3>Successfully Migrated</h3>
            <div className="value">{summary.migratedContent}</div>
          </SummaryCard>
          
          <SummaryCard color="var(--danger)">
            <h3>Failed Items</h3>
            <div className="value">{summary.failedContent}</div>
          </SummaryCard>
          
          <SummaryCard>
            <h3>Success Rate</h3>
            <div className="value">
              {Math.round((summary.migratedContent / summary.totalContent) * 100)}%
            </div>
          </SummaryCard>
        </SummaryCards>
      </ReportSummary>
      
      <ChartsSection>
        <ChartContainer>
          <h3>Migration Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <ChartContainer>
          <h3>Content Type Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Migrated" fill="var(--success)" />
              <Bar dataKey="Failed" fill="var(--danger)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsSection>
      
      {failureReasons && failureReasons.length > 0 && (
        <FailuresContainer>
          <h3>Common Failure Reasons</h3>
          <FailuresList>
            {failureReasons.map((failure, index) => (
              <FailureItem key={index}>
                <FaExclamationTriangle className="icon" />
                <div className="reason">{failure.reason}</div>
                <div className="count">{failure.count}</div>
              </FailureItem>
            ))}
          </FailuresList>
        </FailuresContainer>
      )}
    </ReportContainer>
  );
};

export default MigrationReport; 