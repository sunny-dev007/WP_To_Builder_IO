# WordPress to Builder.io Migration UI-DEV-2

A professional React-based UI application for managing and visualizing the WordPress to Builder.io content migration process. This project provides a robust interface for migrating content while offering real-time progress tracking and detailed reporting.

## Features

- **Modern React UI**: Built with React 18 and styled-components for a beautiful, responsive interface
- **Real-time Migration Progress**: Live visualization of each migration step
- **Centralized Configuration**: Single source of truth for all configuration settings
- **Interactive Configuration**: Easy setup for WordPress and Builder.io credentials
- **Comprehensive Dashboard**: 
  - User role management
  - Pages and Posts tracking
  - Content transformation status
  - Upload progress monitoring
- **Detailed Migration Reports**: Complete statistics with success/failure tracking
- **Error Handling**: Robust error detection and reporting
- **Animated Visualizations**: Beautiful transitions and loading states
- **Professional Styling**: Consistent design system with customizable themes

## Prerequisites

- Node.js (v18 or higher)
- npm (v6 or higher)
- A WordPress site with REST API enabled
- A Builder.io account with API key

## Project Structure

```
builder_io_poc_v2/
├── src/
│   ├── components/     # React components
│   ├── api/           # API integration logic
│   ├── config/        # Centralized configuration
│   │   └── migrationConfig.js  # Main configuration file
│   ├── App.js         # Main application component
│   └── index.js       # Application entry point
├── tools/             # Migration utilities
├── migration-output/  # Migration results and reports
├── public/           # Static assets
├── server.js         # Express backend server
└── package.json      # Project dependencies
```

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd builder_io_poc_v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the application:
   
   Update `src/config/migrationConfig.js` with your settings:
   ```javascript
   const migrationConfig = {
     wordpress: {
       url: 'your-wordpress-site-url',
       authEndpoint: '/wp-json/jwt-auth/v1/token',
       apiEndpoint: '/wp-json/wp/v2',
       credentials: {
         username: 'your-wp-username',
         password: 'your-wp-password'
       }
     },
     builder: {
       apiKey: 'your-builder-io-api-key',
       model: 'page',
       apiEndpoint: 'https://builder.io/api/v1'
     },
     server: {
       port: 3001,
       baseUrl: 'http://localhost:3001/api'
     }
   };
   ```

   This centralized configuration is used throughout the application for:
   - WordPress API connection settings
   - Builder.io API configuration
   - Server configuration
   - Default values for the migration interface

## Running the Application

1. Start the backend server:
   ```bash
   npm run server
   ```
   This will start the Express server using the port specified in migrationConfig

2. In a new terminal, start the React development server:
   ```bash
   npm run dev
   ```
   Access the application at http://localhost:3000

## Migration Process Workflow

The migration process follows these steps:

1. **Configuration**
   - Configuration values are pre-populated from migrationConfig.js
   - Override WordPress site URL if needed
   - Override Builder.io API key if needed
   - Customize content model mapping

2. **Dependencies Check**
   - Verifies required packages
   - Checks API connectivity

3. **WordPress Content Fetching**
   - Users and roles
   - Pages with metadata
   - Posts and categories
   - Media assets

4. **Content Transformation**
   - Converts WordPress format to Builder.io structure
   - Processes media references
   - Maintains metadata and SEO information

5. **Builder.io Upload**
   - Creates content models
   - Uploads transformed content
   - Preserves relationships and metadata

6. **Report Generation**
   - Migration statistics
   - Success/failure counts
   - Detailed error logs

## API Integration

### WordPress API Requirements

- REST API must be enabled
- JWT Authentication configured as specified in migrationConfig
- Proper CORS configuration

### Builder.io API Setup

1. Get your API key from Builder.io dashboard
2. Add the API key to migrationConfig.js
3. Configure space settings
4. Set up content models

## Configuration Management

### Central Configuration

The application uses a centralized configuration system (`src/config/migrationConfig.js`) that manages:

1. **WordPress Settings**
   - Site URL
   - API endpoints
   - Authentication details
   - User credentials

2. **Builder.io Settings**
   - API key
   - Content model
   - API endpoints

3. **Server Configuration**
   - Port settings
   - API base URL
   - Environment-specific settings

### Configuration Override

While default values are provided in the central configuration:

1. The UI allows runtime override of critical values
2. Configuration changes in the UI don't modify the central config file
3. Environment-specific values take precedence over defaults

### Security Considerations

1. Never commit sensitive credentials to version control
2. Use environment variables for production deployments
3. Implement proper credential management in production

## Error Handling

The application handles various error scenarios:

- Network connectivity issues
- API authentication failures
- Content transformation errors
- Upload failures

Error logs are available in the migration report.

## Customization

### Styling

Update theme variables in `src/index.css`:
```css
:root {
  --primary: #4299e1;
  --danger: #f56565;
  --neutral-100: #f7fafc;
  /* ... other variables */
}
```

### Components

Modify components in `src/components/` to customize:
- Progress visualization
- Dashboard layout
- Configuration forms
- Report display

## Production Deployment

1. Build the React application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The server will serve the built React application and handle API requests.

## Troubleshooting

### Common Issues

1. **WordPress API Connection**
   - Verify WordPress URL
   - Check REST API status
   - Confirm authentication settings

2. **Builder.io Upload Failures**
   - Validate API key
   - Check content model configuration
   - Verify space permissions

3. **Performance Issues**
   - Monitor server resources
   - Check network connectivity
   - Review migration batch sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
