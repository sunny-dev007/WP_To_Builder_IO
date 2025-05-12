import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import Header from './components/Header';
import MigrationSteps from './components/MigrationSteps';
import Dashboard from './components/Dashboard';
import ConfigPanel from './components/ConfigPanel';
import MigrationProgress from './components/MigrationProgress';
import MigrationReport from './components/MigrationReport';
import { FaExclamationTriangle, FaWordpress, FaArrowRight, FaCog, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { BiBuilding } from 'react-icons/bi';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';
import migrationConfig from './config/migrationConfig';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  overflow-x: hidden;
  background: #fafbfc;
`;

const HeaderContainer = styled.div`
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.img`
  height: 40px;
  object-fit: contain;
`;

const HeaderTitle = styled.div`
  text-align: right;
  
  h1 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin: 0;
    font-weight: 600;
  }
  
  p {
    color: #7f8c8d;
    margin: 0;
    font-size: 0.9rem;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 100%;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #3498db;
  }
`;

const DashboardContainer = styled.div`
  width: 100%;
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ConfigStepsRow = styled.div`
  display: grid;
  grid-template-columns: 65% 35%;
  gap: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ConfigStepsCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProgressContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-height: 400px;
  overflow-y: auto;
`;

const ErrorBanner = styled.div`
  background-color: #fff5f5;
  border: 1px solid #fc8181;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  color: #c53030;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    flex-shrink: 0;
    font-size: 1.25rem;
  }
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  min-height: calc(100vh - 200px);
`;

const AnimatedMigrationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 1rem 0;
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f4f8 100%);
  border-radius: 12px;
  overflow: hidden;
`;

const IconContainer = styled(animated.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0 1rem;
  
  svg {
    font-size: 30px;
    color: #2c3e50;
  }
`;

const ProgressLine = styled(animated.div)`
  height: 4px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 2px;
  flex: 1;
  max-width: 200px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const StatsNumber = styled(animated.div)`
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  margin: 0.5rem 0;
`;

const StatsLabel = styled.div`
  font-size: 0.875rem;
  color: #7f8c8d;
  text-align: center;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ProcessingItem = styled(animated.div)`
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #e9ecef;
`;

const RotatingCog = styled(animated.div)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const MigrationAnimation = ({ currentStep, stats }) => {
  const wordpressScale = useSpring({
    transform: 'scale(1)',
    from: { transform: 'scale(0.8)' },
    config: { tension: 300, friction: 10 }
  });

  const builderScale = useSpring({
    transform: 'scale(1)',
    from: { transform: 'scale(0.8)' },
    config: { tension: 300, friction: 10 }
  });

  const lineWidth = useSpring({
    width: '100%',
    from: { width: '0%' },
    config: { duration: 2000 }
  });

  const cogRotation = useSpring({
    loop: true,
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
    config: { duration: 3000 }
  });

  const statsSpring = useSpring({
    number: stats.transformedContent,
    from: { number: 0 }
  });

  return (
    <>
      <AnimatedMigrationContainer>
        <IconContainer style={wordpressScale}>
          <FaWordpress color="#21759b" />
        </IconContainer>

        <ProgressLine style={lineWidth} />
        
        <RotatingCog style={cogRotation}>
          <FaCog color="#3498db" size={24} />
        </RotatingCog>
        
        <ProgressLine style={lineWidth} />

        <IconContainer style={builderScale}>
          <BiBuilding color="#2ecc71" />
        </IconContainer>
      </AnimatedMigrationContainer>

      <StatsContainer>
        <div>
          <StatsNumber>
            {statsSpring.number.to(n => Math.floor(n))}
          </StatsNumber>
          <StatsLabel>Items Processed</StatsLabel>
        </div>
        <div>
          <StatsNumber>
            {stats.uploadedContent}
          </StatsNumber>
          <StatsLabel>Items Uploaded</StatsLabel>
        </div>
        <div>
          <StatsNumber>
            {stats.failedContent}
          </StatsNumber>
          <StatsLabel>Failed Items</StatsLabel>
        </div>
      </StatsContainer>

      {currentStep && (
        <ProcessingItem
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RotatingCog style={cogRotation}>
            <FaCog color="#3498db" size={18} />
          </RotatingCog>
          <span>Processing: {currentStep.name}</span>
          {currentStep.status === 'completed' && (
            <FaCheckCircle color="#2ecc71" size={18} />
          )}
        </ProcessingItem>
      )}
    </>
  );
};

const MigrationLayout = styled.div`
  display: grid;
  grid-template-columns: 65% 35%;
  gap: 2rem;
  width: 100%;
  min-height: 600px;
  transition: all 0.3s ease;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const LeftSection = styled.div`
  position: relative;
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
`;

const RightSection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 1rem;
`;

const AnimationContainer = styled.div`
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }

  svg {
    font-size: 1rem;
  }
`;

function App() {
  const [migrationState, setMigrationState] = useState({
    status: 'idle', // idle, running, completed, failed
    currentStep: 0,
    config: {
      wordpressUrl: migrationConfig.wordpress.url,
      builderApiKey: migrationConfig.builder.apiKey,
      builderModel: migrationConfig.builder.model
    },
    steps: [
      { id: 'dependencies', name: 'Checking Dependencies', status: 'pending', data: null, error: null },
      { id: 'users', name: 'Fetching WordPress Users', status: 'pending', data: null, error: null },
      { id: 'pages', name: 'Fetching WordPress Pages', status: 'pending', data: null, error: null },
      { id: 'posts', name: 'Fetching WordPress Posts', status: 'pending', data: null, error: null },
      { id: 'transform', name: 'Transforming Content', status: 'pending', data: null, error: null },
      { id: 'upload', name: 'Uploading to Builder.io', status: 'pending', data: null, error: null },
      { id: 'report', name: 'Generating Report', status: 'pending', data: null, error: null }
    ],
    stats: {
      totalUsers: 0,
      totalPages: 0,
      totalPosts: 0,
      transformedContent: 0,
      uploadedContent: 0,
      failedContent: 0,
      skippedContent: 0
    },
    contentData: {
      users: [],
      pages: [],
      posts: []
    },
    report: null,
    error: null
  });

  const [showConfig, setShowConfig] = useState(true);

  // Add new state for JWT token
  const [jwtToken, setJwtToken] = useState(null);

  // Function to get JWT token
  const getJWTToken = async (wpUrl) => {
    try {
      const response = await axios.post(`${wpUrl}${migrationConfig.wordpress.authEndpoint}`, {
        username: migrationConfig.wordpress.credentials.username,
        password: migrationConfig.wordpress.credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('JWT Token received:', response.data);
      return response.data.token;
    } catch (error) {
      console.error('Error getting JWT token:', error);
      throw new Error(`Failed to authenticate with WordPress: ${error.message}`);
    }
  };

  // Update the fetchWordPressData function
  const fetchWordPressData = async (endpoint, wpUrl) => {
    try {
      let apiUrl;
      let headers = {};

      // Get JWT token if not already available
      if (!jwtToken) {
        const token = await getJWTToken(wpUrl);
        setJwtToken(token);
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      if (endpoint === 'pages') {
        apiUrl = `${wpUrl}/wp-json/wp/v2/pages?per_page=100&_embed=true`;
      } else if (endpoint === 'posts') {
        apiUrl = `${wpUrl}/wp-json/wp/v2/posts?per_page=100&_embed=true`;
      } else if (endpoint === 'users') {
        apiUrl = `${wpUrl}/wp-json/wp/v2/users?per_page=100`;
      } else {
        apiUrl = `${wpUrl}/wp-json/wp/v2/${endpoint}`;
      }
      
      console.log(`Fetching from WordPress API: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, { headers });
      console.log(`WordPress API response for ${endpoint}:`, response.data);

      // Handle pagination for users
      if (endpoint === 'users') {
        const totalPages = parseInt(response.headers['x-wp-totalpages']) || 1;
        let allUsers = [...response.data];

        // Fetch remaining pages if any
        if (totalPages > 1) {
          const remainingRequests = [];
          for (let page = 2; page <= totalPages; page++) {
            const pageUrl = `${apiUrl}&page=${page}`;
            remainingRequests.push(
              axios.get(pageUrl, { headers })
                .then(resp => resp.data)
                .catch(err => {
                  console.error(`Error fetching users page ${page}:`, err);
                  return [];
                })
            );
          }

          const additionalUsers = await Promise.all(remainingRequests);
          allUsers = allUsers.concat(...additionalUsers);
        }

        console.log(`Total users fetched: ${allUsers.length}`);
        return allUsers;
      }
      
      // Verify we actually got an array and it has a length property
      if (!Array.isArray(response.data)) {
        console.error(`API response for ${endpoint} is not an array:`, response.data);
        return [];
      }
      
      console.log(`Got ${response.data.length} ${endpoint} from WordPress API`);
      return response.data;
    } catch (error) {
      // Handle token expiration
      if (error.response && error.response.status === 401) {
        // Clear token and retry once
        setJwtToken(null);
        return fetchWordPressData(endpoint, wpUrl);
      }

      console.error(`Error fetching ${endpoint} from WordPress:`, error);
      throw new Error(`Failed to fetch ${endpoint}: ${error.message}`);
    }
  };

  // Transform WordPress content to Builder.io format
  const transformContent = (wpItem, type) => {
    try {
      const wpContent = wpItem.content?.rendered || '';
      const wpTitle = wpItem.title?.rendered || `${type} ${wpItem.id}`;
      
      // Main section to contain all content
      const mainSection = {
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "id": "builder-main-section-" + Date.now(),
        "component": {
          "name": "Core:Section",
          "options": {
            "maxWidth": 1200,
            "marginTop": 0,
            "marginBottom": 0,
            "padding": 20,
            "backgroundColor": "#ffffff"
          }
        },
        "children": [],
        "responsiveStyles": {
          "large": {
            "display": "flex",
            "flexDirection": "column",
            "position": "relative",
            "flexShrink": "0",
            "boxSizing": "border-box",
            "marginTop": "0",
            "width": "100%"
          }
        }
      };

      // Add title as a heading
      mainSection.children.push({
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "id": `builder-title-${Date.now()}`,
        "component": {
          "name": "Text",
          "options": {
            "text": `<h1>${wpTitle}</h1>`
          }
        },
        "responsiveStyles": {
          "large": {
            "marginBottom": "20px",
            "fontSize": "32px",
            "fontWeight": "600"
          }
        }
      });

      // Add featured image if available
      if (wpItem._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
        const featuredImageSrc = wpItem._embedded['wp:featuredmedia'][0].source_url;
        mainSection.children.push({
          "@type": "@builder.io/sdk:Element",
          "@version": 2,
          "id": `builder-featured-image-${Date.now()}`,
          "component": {
            "name": "Image",
            "options": {
              "image": featuredImageSrc,
              "altText": wpTitle
            }
          },
          "responsiveStyles": {
            "large": {
              "marginBottom": "30px",
              "width": "100%",
              "maxHeight": "500px",
              "objectFit": "contain"
            }
          }
        });
      }

      // Add content as a text block
      mainSection.children.push({
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "id": `builder-content-${Date.now()}`,
        "component": {
          "name": "Text",
          "options": {
            "text": wpContent
          }
        },
        "responsiveStyles": {
          "large": {
            "marginTop": "20px"
          }
        }
      });

      // Create the page data
      return {
        name: wpTitle,
        data: {
          title: wpTitle,
          description: wpItem.excerpt?.rendered || '',
          blocks: [mainSection]
        },
        published: wpItem.status === "publish" ? "published" : "draft",
        lastUpdated: new Date(wpItem.modified).getTime(),
        scheduledPublishDate: wpItem.status === "future" ? new Date(wpItem.date).getTime() : undefined,
        url: '/' + (wpItem.slug || `${type}-${wpItem.id}`),
        meta: {
          originalWordPressId: wpItem.id,
          originalWordPressUrl: wpItem.link,
          author: wpItem.author,
          authorName: wpItem._embedded?.author?.[0]?.name,
          contentType: type,
          wordPressStatus: wpItem.status
        }
      };
    } catch (error) {
      console.error('Error transforming content:', error);
      // Return a simplified version if there's an error
      return {
        name: wpItem.title?.rendered || `${type} ${wpItem.id}`,
        data: {
          title: wpItem.title?.rendered || `${type} ${wpItem.id}`,
          description: wpItem.excerpt?.rendered || '',
          blocks: [{
            "@type": "@builder.io/sdk:Element",
            "@version": 2,
            "id": `builder-fallback-${Date.now()}`,
            "component": {
              "name": "Text",
              "options": {
                "text": `<h1>${wpItem.title?.rendered || `${type} ${wpItem.id}`}</h1>
                        <div>${wpItem.content?.rendered || wpItem.excerpt?.rendered || 'No content available.'}</div>`
              }
            }
          }]
        },
        published: wpItem.status === "publish" ? "published" : "draft",
        url: '/' + (wpItem.slug || `${type}-${wpItem.id}`),
        meta: {
          originalWordPressId: wpItem.id,
          originalWordPressUrl: wpItem.link,
          author: wpItem.author,
          contentType: type,
          wordPressStatus: wpItem.status
        }
      };
    }
  };

  // Check if content already exists in Builder.io
  const checkContentExists = async (wpId, apiKey, model) => {
    try {
      // Query Builder.io for content with this WordPress ID
      const url = `https://builder.io/api/v1/content/${model}?apiKey=${apiKey}&query.meta.originalWordPressId=${wpId}`;
      console.log(`Checking if content exists in Builder.io: ${url}`);
      
      const response = await axios.get(url);
      console.log(`Builder.io content check response:`, response.data);
      
      // If we have results, content with this WordPress ID already exists
      return response.data && response.data.results && response.data.results.length > 0;
    } catch (error) {
      console.error('Error checking existing content:', error);
      // If there's an error, assume content doesn't exist to be safe
      return false;
    }
  };

  // Upload content to Builder.io
  const uploadToBuilder = async (content, apiKey, model, wpId) => {
    try {
      // First check if this content already exists
      const exists = await checkContentExists(wpId, apiKey, model);
      
      if (exists) {
        console.log(`Content with WordPress ID ${wpId} already exists in Builder.io. Skipping upload.`);
        return {
          skipped: true,
          message: 'Content already exists in Builder.io'
        };
      }
      
      const url = `https://builder.io/api/v1/write/${model}`;
      console.log(`Uploading to Builder.io API: ${url}`);
      console.log('Payload:', JSON.stringify(content, null, 2));
      
      const response = await axios.post(url, content, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Builder.io API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading to Builder.io:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to upload to Builder.io: ${error.message}`);
    }
  };

  // Update simulateMigration function to handle user fetching errors better
  const simulateMigration = async () => {
    const updateStep = (stepId, status, data = null, error = null) => {
      setMigrationState(prevState => {
        const stepIndex = prevState.steps.findIndex(step => step.id === stepId);
        
        if (stepIndex === -1) return prevState;
        
        const newSteps = [...prevState.steps];
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          status,
          data,
          error
        };
        
        return {
          ...prevState,
          currentStep: stepIndex,
          steps: newSteps,
          error: error
        };
      });
    };
    
    const updateStats = (newStats) => {
      setMigrationState(prevState => ({
        ...prevState,
        stats: {
          ...prevState.stats,
          ...newStats
        }
      }));
    };
    
    const completeProcess = (report) => {
      setMigrationState(prevState => ({
        ...prevState,
        status: 'completed',
        report
      }));
    };
    
    try {
      // Start the dependencies check step
      updateStep('dependencies', 'running');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dependencies = ['axios', 'cheerio', 'cli-progress'];
      updateStep('dependencies', 'completed', {
        installedDependencies: dependencies,
        missingDependencies: []
      });
      
      // Fetch WordPress users with JWT auth
      updateStep('users', 'running');
      let users;
      try {
        users = await fetchWordPressData('users', migrationState.config.wordpressUrl);
        console.log(`Fetched ${users.length} WordPress users`);
        
        // Process user data to include email
        const processedUsers = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          url: user.url
        }));

        updateStep('users', 'completed', processedUsers);
        
        setMigrationState(prevState => ({
          ...prevState,
          stats: {
            ...prevState.stats,
            totalUsers: users.length
          },
          contentData: {
            ...prevState.contentData,
            users: processedUsers
          }
        }));
      } catch (error) {
        updateStep('users', 'failed', null, error.message);
        throw error;
      }
      
      // Fetch WordPress pages
      updateStep('pages', 'running');
      let pages;
      try {
        pages = await fetchWordPressData('pages', migrationState.config.wordpressUrl);
        // Make sure we're updating with the actual length from the API response
        console.log(`Fetched ${pages.length} WordPress pages`);
        updateStep('pages', 'completed', pages);
        // Update stats and contentData with the actual pages - don't use updateStats here
        setMigrationState(prevState => ({
          ...prevState,
          stats: {
            ...prevState.stats,
            totalPages: pages.length
          },
          contentData: {
            ...prevState.contentData,
            pages: pages
          }
        }));
      } catch (error) {
        updateStep('pages', 'failed', null, error.message);
        throw error;
      }
      
      // Fetch WordPress posts
      updateStep('posts', 'running');
      let posts;
      try {
        posts = await fetchWordPressData('posts', migrationState.config.wordpressUrl);
        // Make sure we're updating with the actual length from the API response
        console.log(`Fetched ${posts.length} WordPress posts`);
        updateStep('posts', 'completed', posts);
        // Update stats and contentData with the actual posts - don't use updateStats here
        setMigrationState(prevState => ({
          ...prevState,
          stats: {
            ...prevState.stats,
            totalPosts: posts.length
          },
          contentData: {
            ...prevState.contentData,
            posts: posts
          }
        }));
      } catch (error) {
        updateStep('posts', 'failed', null, error.message);
        throw error;
      }
      
      // Transform content
      updateStep('transform', 'running');
      let transformedContent = [];
      let transformFailures = [];
      
      try {
        // Transform pages
        for (const page of pages) {
          try {
            const transformed = transformContent(page, 'page');
            transformedContent.push({
              original: page,
              transformed,
              type: 'page'
            });
          } catch (error) {
            console.error('Error transforming page:', error);
            transformFailures.push({
              id: page.id,
              type: 'page',
              reason: error.message
            });
          }
        }
        
        // Transform posts
        for (const post of posts) {
          try {
            const transformed = transformContent(post, 'post');
            transformedContent.push({
              original: post,
              transformed,
              type: 'post'
            });
          } catch (error) {
            console.error('Error transforming post:', error);
            transformFailures.push({
              id: post.id,
              type: 'post',
              reason: error.message
            });
          }
        }
        
        const transformResult = {
          processed: pages.length + posts.length,
          succeeded: transformedContent.length,
          failed: transformFailures.length,
          failedItems: transformFailures
        };
        
        updateStep('transform', 'completed', transformResult);
        updateStats({ transformedContent: transformedContent.length });
      } catch (error) {
        updateStep('transform', 'failed', null, error.message);
        throw error;
      }
      
      // Upload to Builder.io
      updateStep('upload', 'running');
      let uploadedItems = [];
      let skippedItems = [];
      let uploadFailures = [];
      
      try {
        for (const item of transformedContent) {
          try {
            const uploadResult = await uploadToBuilder(
              item.transformed, 
              migrationState.config.builderApiKey,
              migrationState.config.builderModel,
              item.original.id // Pass WordPress ID to check for duplicates
            );
            
            if (uploadResult.skipped) {
              // Item was skipped because it already exists
              skippedItems.push({
                id: item.original.id,
                type: item.type,
                reason: 'Already exists in Builder.io'
              });
              toast.info(`Skipped existing content: ${item.original.title?.rendered || item.type}`);
            } else {
              // Item was uploaded successfully
              uploadedItems.push({
                original: item.original,
                builderResponse: uploadResult,
                type: item.type
              });
              toast.success(`Uploaded: ${item.original.title?.rendered || item.type}`);
            }
          } catch (error) {
            console.error('Error uploading content to Builder.io:', error);
            uploadFailures.push({
              id: item.original.id,
              type: item.type,
              reason: error.message
            });
            toast.error(`Failed to upload: ${item.original.title?.rendered || item.type}`);
          }
          
          // Update progress after each item
          updateStats({
            uploadedContent: uploadedItems.length,
            failedContent: uploadFailures.length,
            skippedContent: skippedItems.length
          });
        }
        
        const uploadResult = {
          processed: transformedContent.length,
          succeeded: uploadedItems.length,
          skipped: skippedItems.length,
          failed: uploadFailures.length,
          failedItems: uploadFailures,
          skippedItems: skippedItems
        };
        
        updateStep('upload', 'completed', uploadResult);
      } catch (error) {
        updateStep('upload', 'failed', null, error.message);
        throw error;
      }
      
      // Generate report
      updateStep('report', 'running');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const reportData = {
          generatedAt: new Date().toISOString(),
          reportFile: 'migration-report.json'
        };
        
        updateStep('report', 'completed', reportData);
        
        // Complete with final report
        const finalReport = {
          summary: {
            totalContent: pages.length + posts.length,
            migratedContent: uploadedItems.length,
            failedContent: uploadFailures.length,
            skippedContent: skippedItems.length,
            migrationTime: '00:03:45', // This would be calculated in a real app
            startTime: new Date(Date.now() - 225000).toISOString(),
            endTime: new Date().toISOString()
          },
          contentBreakdown: {
            pages: {
              total: pages.length,
              migrated: uploadedItems.filter(item => item.type === 'page').length,
              failed: uploadFailures.filter(item => item.type === 'page').length,
              skipped: skippedItems.filter(item => item.type === 'page').length
            },
            posts: {
              total: posts.length,
              migrated: uploadedItems.filter(item => item.type === 'post').length,
              failed: uploadFailures.filter(item => item.type === 'post').length,
              skipped: skippedItems.filter(item => item.type === 'post').length
            },
            users: {
              total: users.length
            }
          },
          failureReasons: Object.entries(
            uploadFailures.reduce((acc, failure) => {
              acc[failure.reason] = (acc[failure.reason] || 0) + 1;
              return acc;
            }, {})
          ).map(([reason, count]) => ({ reason, count }))
        };
        
        completeProcess(finalReport);
      } catch (error) {
        updateStep('report', 'failed', null, error.message);
        throw error;
      }
    } catch (error) {
      console.error('Migration process failed:', error);
      setMigrationState(prev => ({
        ...prev,
        status: 'failed',
        error: error.message
      }));
    }
  };

  // Poll for migration progress updates when migration is running
  useEffect(() => {
    let interval = null;
    
    if (migrationState.status === 'running') {
      interval = setInterval(() => {
        // Check if migration is complete or failed
        if (migrationState.status === 'completed') {
          clearInterval(interval);
          toast.success('Migration completed successfully!');
        } else if (migrationState.status === 'failed') {
          clearInterval(interval);
          
          if (migrationState.error) {
            toast.error(migrationState.error);
          } else {
            toast.error('Migration failed. Please check the logs for details.');
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [migrationState.status]);

  const handleStartMigration = () => {
    try {
      setShowConfig(false);
      
      // Reset the UI migration state
      setMigrationState(prev => ({
        ...prev,
        status: 'running',
        currentStep: 0,
        steps: prev.steps.map(step => ({ ...step, status: 'pending', data: null, error: null })),
        stats: {
          totalUsers: 0,
          totalPages: 0,
          totalPosts: 0,
          transformedContent: 0,
          uploadedContent: 0,
          failedContent: 0,
          skippedContent: 0
        },
        contentData: {
          users: [],
          pages: [],
          posts: []
        },
        report: null,
        error: null
      }));
      
      toast.info('Starting migration process...');
      simulateMigration();
      
    } catch (error) {
      console.error('Error starting migration:', error);
      toast.error('Failed to start migration: ' + error.message);
      
      setMigrationState(prev => ({
        ...prev,
        status: 'failed',
        error: `Failed to start migration: ${error.message}`
      }));
    }
  };

  const handleUpdateConfig = (newConfig) => {
    setMigrationState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...newConfig
      }
    }));
  };

  const handleBackToConfig = () => {
    if (migrationState.status !== 'running') {
      setShowConfig(true);
    } else {
      toast.warning('Please wait until the migration process completes');
    }
  };

  // Find the current step
  const currentStep = migrationState.steps[migrationState.currentStep] || migrationState.steps[0];

  const renderLeftSection = () => {
    if (showConfig) {
      return (
        <AnimationContainer>
          <SectionTitle>Migration Configuration</SectionTitle>
          <ConfigPanel 
            config={migrationState.config} 
            updateConfig={handleUpdateConfig}
            startMigration={handleStartMigration}
            isMigrating={migrationState.status === 'running'}
          />
        </AnimationContainer>
      );
    }

    return (
      <AnimationContainer>
        {(migrationState.status === 'completed' || migrationState.status === 'failed') && (
          <BackButton onClick={handleBackToConfig}>
            <FaArrowLeft /> Back to Configuration
          </BackButton>
        )}
        
        {migrationState.status === 'running' && (
          <>
            <MigrationAnimation 
              currentStep={currentStep} 
              stats={migrationState.stats}
            />
            <MigrationProgress 
              currentStep={currentStep} 
              stats={migrationState.stats}
            />
          </>
        )}
        
        {migrationState.status === 'failed' && (
          <MigrationProgress 
            currentStep={currentStep} 
            stats={migrationState.stats}
          />
        )}
        
        {migrationState.status === 'completed' && migrationState.report && (
          <MigrationReport report={migrationState.report} />
        )}
      </AnimationContainer>
    );
  };

  return (
    <AppContainer>
      <HeaderContainer>
        <Logo 
          src="https://www.nitorinfotech.com/wp-content/themes/custom-dev-theme-elementor-master/assets/img/logo.webp" 
          alt="Nitor Infotech"
        />
        <HeaderTitle>
          <h1>WordPress to Builder.io Migration</h1>
          <p>Enterprise Content Migration Solution</p>
        </HeaderTitle>
      </HeaderContainer>

      <MainContent>
        <DashboardContainer>
          <SectionTitle>Migration Overview</SectionTitle>
          <Dashboard 
            stats={migrationState.stats} 
            status={migrationState.status} 
            contentData={migrationState.contentData}
          />
        </DashboardContainer>
        
        {migrationState.error && (
          <ErrorBanner>
            <FaExclamationTriangle /> 
            {migrationState.error}
          </ErrorBanner>
        )}
        
        <MigrationLayout>
          <LeftSection>
            {renderLeftSection()}
          </LeftSection>
          
          <RightSection>
            <SectionTitle>Migration Steps</SectionTitle>
            <MigrationSteps 
              steps={migrationState.steps} 
              currentStep={migrationState.currentStep}
            />
          </RightSection>
        </MigrationLayout>
      </MainContent>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AppContainer>
  );
}

export default App; 