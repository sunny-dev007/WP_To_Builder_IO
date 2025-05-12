import axios from 'axios';
import migrationConfig from '../config/migrationConfig';

// This file serves as a bridge between the React UI and the Node.js migration script
// Connect to the actual migrate-wp-to-builder.js script

// Configuration settings for the migration
let migrationConfig = {
  wordpressUrl: migrationConfig.wordpress.url,
  builderApiKey: migrationConfig.builder.apiKey,
  builderModel: migrationConfig.builder.model
};

// Store migration progress
let migrationProgress = {
  status: 'idle',
  currentStep: 0,
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
    failedContent: 0
  },
  report: null,
  error: null // Global error for the entire migration
};

// API endpoints
const API_URL = 'http://localhost:3001/api';

/**
 * Update migration configuration
 * @param {Object} config - New configuration settings
 */
export const updateMigrationConfig = (config) => {
  migrationConfig = {
    ...migrationConfig,
    ...config
  };
  return migrationConfig;
};

/**
 * Get current migration configuration
 */
export const getMigrationConfig = () => {
  return migrationConfig;
};

/**
 * Get current migration progress
 */
export const getMigrationProgress = () => {
  return migrationProgress;
};

/**
 * Reset all errors in migration progress
 */
export const resetErrors = () => {
  migrationProgress.error = null;
  migrationProgress.steps = migrationProgress.steps.map(step => ({
    ...step,
    error: null
  }));
};

/**
 * Set an error for a specific step
 * @param {string} stepId - The ID of the step
 * @param {string} errorMessage - The error message
 */
export const setStepError = (stepId, errorMessage) => {
  const stepIndex = migrationProgress.steps.findIndex(step => step.id === stepId);
  
  if (stepIndex !== -1) {
    migrationProgress.steps[stepIndex] = {
      ...migrationProgress.steps[stepIndex],
      status: 'failed',
      error: errorMessage
    };
  }
  
  // Also set the global error state
  migrationProgress.error = `Error in ${migrationProgress.steps[stepIndex].name}: ${errorMessage}`;
  migrationProgress.status = 'failed';
  
  return migrationProgress;
};

/**
 * Start the migration process
 * Connects to the backend server that runs the migration script
 */
export const startMigration = async () => {
  try {
    // Reset the migration state
    migrationProgress = {
      ...migrationProgress,
      status: 'running',
      currentStep: 0,
      steps: migrationProgress.steps.map(step => ({ ...step, status: 'pending', data: null, error: null })),
      stats: {
        totalUsers: 0,
        totalPages: 0,
        totalPosts: 0,
        transformedContent: 0,
        uploadedContent: 0,
        failedContent: 0
      },
      report: null,
      error: null
    };

    // Call the server API to start the migration
    try {
      const response = await axios.post(`${API_URL}/migration/start`, migrationConfig);
      
      if (response.data.status === 'started') {
        console.log('Migration started successfully');
      } else {
        throw new Error('Server response indicates migration failed to start');
      }
      
      return migrationProgress;
    } catch (scriptError) {
      console.error('Migration script execution error:', scriptError);
      migrationProgress.status = 'failed';
      migrationProgress.error = `Server error: ${scriptError.message || 'Unknown error'}`;
      return migrationProgress;
    }
  } catch (error) {
    console.error('Migration start error:', error);
    migrationProgress.status = 'failed';
    migrationProgress.error = `Failed to start migration: ${error.message || 'Unknown error'}`;
    return migrationProgress;
  }
};

/**
 * Fetch the latest migration progress from the server
 */
export const fetchMigrationProgress = async () => {
  try {
    const response = await axios.get(`${API_URL}/migration/progress`);
    
    if (response.data) {
      // Update our local state with the server state
      migrationProgress = response.data;
    }
    
    return migrationProgress;
  } catch (error) {
    console.error('Error fetching migration progress:', error);
    return migrationProgress;
  }
};

/**
 * For demonstration purposes, this function simulates migration progress
 * when the server is not available
 */
export const simulateMigrationProcess = () => {
  // First reset any errors
  resetErrors();
  
  // Simulate a possible error (uncomment to test error handling)
  // const simulateRandomError = Math.random() > 0.7;
  
  // Simulate the dependencies check step
  setTimeout(() => {
    updateMigrationStep('dependencies', 'running');
    
    setTimeout(() => {
      // Check for simulated error
      // if (simulateRandomError) {
      //   setStepError('dependencies', 'Could not install required dependencies');
      //   return;
      // }
      
      // Succeed
      updateMigrationStep('dependencies', 'completed', {
        installedDependencies: ['cheerio', 'axios', 'cli-progress'],
        missingDependencies: []
      });
      
      // Simulate the users fetch step
      setTimeout(() => {
        updateMigrationStep('users', 'running');
        
        setTimeout(() => {
          // if (simulateRandomError) {
          //   setStepError('users', 'Failed to connect to WordPress API');
          //   return;
          // }
          
          updateMigrationStep('users', 'completed', Array(5).fill().map((_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            role: i === 0 ? 'admin' : 'author'
          })));
          updateMigrationStats({ totalUsers: 5 });
          
          // Simulate the pages fetch step
          setTimeout(() => {
            updateMigrationStep('pages', 'running');
            
            setTimeout(() => {
              // if (simulateRandomError) {
              //   setStepError('pages', 'WordPress API returned invalid page data');
              //   return;
              // }
              
              updateMigrationStep('pages', 'completed', Array(15).fill().map((_, i) => ({
                id: i + 1,
                title: `Page ${i + 1}`,
                status: i < 12 ? 'publish' : 'draft'
              })));
              updateMigrationStats({ totalPages: 15 });
              
              // Simulate the posts fetch step
              setTimeout(() => {
                updateMigrationStep('posts', 'running');
                
                setTimeout(() => {
                  // if (simulateRandomError) {
                  //   setStepError('posts', 'Access denied to WordPress posts');
                  //   return;
                  // }
                  
                  updateMigrationStep('posts', 'completed', Array(25).fill().map((_, i) => ({
                    id: i + 1,
                    title: `Post ${i + 1}`,
                    status: i < 20 ? 'publish' : 'draft',
                    author: i % 5 + 1
                  })));
                  updateMigrationStats({ totalPosts: 25 });
                  
                  // Simulate the content transformation step
                  setTimeout(() => {
                    updateMigrationStep('transform', 'running');
                    
                    setTimeout(() => {
                      // if (simulateRandomError) {
                      //   setStepError('transform', 'Error converting content to Builder.io format');
                      //   return;
                      // }
                      
                      const total = 40; // Pages + Posts
                      updateMigrationStep('transform', 'completed', {
                        processed: total,
                        succeeded: total - 3,
                        failed: 3,
                        failedItems: [
                          { id: 8, type: 'post', reason: 'Invalid content format' },
                          { id: 15, type: 'post', reason: 'Missing required fields' },
                          { id: 10, type: 'page', reason: 'Content too large' }
                        ]
                      });
                      updateMigrationStats({ transformedContent: 40 });
                      
                      // Simulate the upload step
                      setTimeout(() => {
                        updateMigrationStep('upload', 'running');
                        
                        setTimeout(() => {
                          // if (simulateRandomError) {
                          //   setStepError('upload', 'Builder.io API rate limit exceeded');
                          //   return;
                          // }
                          
                          const uploadTotal = 40;
                          updateMigrationStep('upload', 'completed', {
                            processed: uploadTotal,
                            succeeded: uploadTotal - 4,
                            failed: 4,
                            failedItems: [
                              { id: 8, type: 'post', reason: 'API rate limit exceeded' },
                              { id: 15, type: 'post', reason: 'Network error' },
                              { id: 10, type: 'page', reason: 'Duplicate content' },
                              { id: 7, type: 'page', reason: 'Validation failed' }
                            ]
                          });
                          updateMigrationStats({
                            uploadedContent: 36,
                            failedContent: 4
                          });
                          
                          // Simulate the report generation step
                          setTimeout(() => {
                            updateMigrationStep('report', 'running');
                            
                            setTimeout(() => {
                              // if (simulateRandomError) {
                              //   setStepError('report', 'Failed to generate migration report');
                              //   return;
                              // }
                              
                              updateMigrationStep('report', 'completed', {
                                generatedAt: new Date().toISOString(),
                                reportFile: 'migration-report.json'
                              });
                              
                              // Set the final report
                              setMigrationReport({
                                summary: {
                                  totalContent: 40,
                                  migratedContent: 36,
                                  failedContent: 4,
                                  migrationTime: '00:03:45',
                                  startTime: new Date(Date.now() - 225000).toISOString(),
                                  endTime: new Date().toISOString()
                                },
                                contentBreakdown: {
                                  pages: {
                                    total: 15,
                                    migrated: 13,
                                    failed: 2
                                  },
                                  posts: {
                                    total: 25,
                                    migrated: 23,
                                    failed: 2
                                  }
                                },
                                failureReasons: [
                                  { reason: 'API rate limit exceeded', count: 1 },
                                  { reason: 'Network error', count: 1 },
                                  { reason: 'Duplicate content', count: 1 },
                                  { reason: 'Validation failed', count: 1 }
                                ]
                              });
                            }, 2000);
                          }, 1000);
                        }, 3000);
                      }, 1000);
                    }, 3000);
                  }, 1000);
                }, 2000);
              }, 1000);
            }, 2000);
          }, 1000);
        }, 2000);
      }, 1000);
    }, 2000);
  }, 1000);
};

/**
 * Update a step in the migration progress
 */
export const updateMigrationStep = (stepId, status, data = null) => {
  try {
    const stepIndex = migrationProgress.steps.findIndex(step => step.id === stepId);
    
    if (stepIndex !== -1) {
      migrationProgress.steps[stepIndex] = {
        ...migrationProgress.steps[stepIndex],
        status,
        data,
        error: null // Clear any errors when updating successfully
      };
      
      migrationProgress.currentStep = stepIndex;
      
      // Update overall status if the last step is completed or failed
      if (stepIndex === migrationProgress.steps.length - 1 && status === 'completed') {
        migrationProgress.status = 'completed';
      } else if (status === 'failed') {
        migrationProgress.status = 'failed';
      }
    } else {
      console.error(`Could not find step with ID: ${stepId}`);
    }
  } catch (error) {
    console.error(`Error updating step ${stepId}:`, error);
    // Set a fallback error
    migrationProgress.error = `Error updating migration progress: ${error.message || 'Unknown error'}`;
  }
  
  return migrationProgress;
};

/**
 * Update migration statistics
 */
export const updateMigrationStats = (newStats) => {
  try {
    migrationProgress.stats = {
      ...migrationProgress.stats,
      ...newStats
    };
  } catch (error) {
    console.error('Error updating migration stats:', error);
    migrationProgress.error = `Error updating migration statistics: ${error.message || 'Unknown error'}`;
  }
  
  return migrationProgress;
};

/**
 * Set the final migration report
 */
export const setMigrationReport = (report) => {
  try {
    migrationProgress.report = report;
    migrationProgress.status = 'completed';
  } catch (error) {
    console.error('Error setting migration report:', error);
    migrationProgress.error = `Error generating migration report: ${error.message || 'Unknown error'}`;
    migrationProgress.status = 'failed';
  }
  
  return migrationProgress;
};

// Get JWT token
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