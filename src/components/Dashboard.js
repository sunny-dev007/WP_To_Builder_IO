import React from 'react';
import styled from 'styled-components';
import { FaUser, FaFile, FaNewspaper } from 'react-icons/fa';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.bgColor};
  color: white;
`;

const StatInfo = styled.div`
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
  }

  p {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.875rem;
  }
`;

const TablesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
`;

const TableCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #2c3e50;
  }
`;

const TableContent = styled.div`
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f8f9fa;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f8f9fa;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 3px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th, td {
    padding: 0.75rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
  }

  th {
    font-weight: 600;
    color: #2c3e50;
    background: #f8f9fa;
  }

  td {
    color: #4a5568;
  }

  tbody tr:hover {
    background: #f8f9fa;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.bgColor || '#e2e8f0'};
  color: ${props => props.textColor || '#4a5568'};
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #a0aec0;
`;

const Dashboard = ({ stats, status, contentData }) => {
  const getBadgeColors = (role) => {
    const colors = {
      administrator: { bg: '#fed7d7', text: '#c53030' },
      editor: { bg: '#feebc8', text: '#c05621' },
      author: { bg: '#fefcbf', text: '#b7791f' },
      contributor: { bg: '#c6f6d5', text: '#2f855a' },
      subscriber: { bg: '#e9d8fd', text: '#6b46c1' },
      default: { bg: '#e2e8f0', text: '#4a5568' }
    };
    return colors[role] || colors.default;
  };

  const formatRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return 'N/A';
    return roles.map(role => {
      const { bg, text } = getBadgeColors(role);
      return (
        <Badge key={role} bgColor={bg} textColor={text}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      );
    });
  };

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard>
          <IconWrapper bgColor="#4299e1">
            <FaUser size={20} />
          </IconWrapper>
          <StatInfo>
            <h3>{stats.totalUsers}</h3>
            <p>WordPress Users</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconWrapper bgColor="#48bb78">
            <FaFile size={20} />
          </IconWrapper>
          <StatInfo>
            <h3>{stats.totalPages}</h3>
            <p>WordPress Pages</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconWrapper bgColor="#ed8936">
            <FaNewspaper size={20} />
          </IconWrapper>
          <StatInfo>
            <h3>{stats.totalPosts}</h3>
            <p>WordPress Posts</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <TablesContainer>
        <TableCard>
          <TableHeader>
            <FaUser />
            <h3>WordPress Users</h3>
          </TableHeader>
          <TableContent>
            {contentData.users && contentData.users.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {contentData.users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{formatRoles(user.roles)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState>No users found</EmptyState>
            )}
          </TableContent>
        </TableCard>

        <TableCard>
          <TableHeader>
            <FaFile />
            <h3>WordPress Pages</h3>
          </TableHeader>
          <TableContent>
            {contentData.pages && contentData.pages.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contentData.pages.map(page => (
                    <tr key={page.id}>
                      <td>{page.title?.rendered || 'Untitled'}</td>
                      <td>
                        <Badge 
                          bgColor={page.status === 'publish' ? '#c6f6d5' : '#e2e8f0'}
                          textColor={page.status === 'publish' ? '#2f855a' : '#4a5568'}
                        >
                          {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState>No pages found</EmptyState>
            )}
          </TableContent>
        </TableCard>

        <TableCard>
          <TableHeader>
            <FaNewspaper />
            <h3>WordPress Posts</h3>
          </TableHeader>
          <TableContent>
            {contentData.posts && contentData.posts.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contentData.posts.map(post => (
                    <tr key={post.id}>
                      <td>{post.title?.rendered || 'Untitled'}</td>
                      <td>
                        <Badge 
                          bgColor={post.status === 'publish' ? '#c6f6d5' : '#e2e8f0'}
                          textColor={post.status === 'publish' ? '#2f855a' : '#4a5568'}
                        >
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState>No posts found</EmptyState>
            )}
          </TableContent>
        </TableCard>
      </TablesContainer>
    </DashboardContainer>
  );
};

export default Dashboard; 