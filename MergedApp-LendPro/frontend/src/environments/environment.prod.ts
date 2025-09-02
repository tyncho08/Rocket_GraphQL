export const environment = {
  production: true,
  
  // API Configuration - Update these URLs for production deployment
  apiUrl: '/api', // Uses relative path in production
  
  // Application Configuration
  appName: 'LendPro - Complete Mortgage Platform',
  version: '1.0.0',
  
  // Features Configuration
  features: {
    enableAnalytics: true,
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    enableServiceWorker: true,
    enableNotifications: true,
    enableDarkMode: true,
    enableOfflineMode: true
  },
  
  // External Services Configuration  
  // Note: For production, these values should be replaced during build process
  externalServices: {
    googleMapsApiKey: '', // Set this during build: GOOGLE_MAPS_API_KEY
    sentry: {
      dsn: '', // Set this during build: SENTRY_DSN
      environment: 'production'
    },
    analytics: {
      googleAnalyticsId: '', // Set this during build: GOOGLE_ANALYTICS_ID
      enabled: true
    }
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    duration: 600000, // 10 minutes in milliseconds
    maxSize: 200 // Maximum number of cached items
  },
  
  // Security Configuration
  security: {
    tokenKey: 'rocket_auth_token',
    sessionTimeout: 1800000, // 30 minutes in milliseconds
    maxLoginAttempts: 3,
    lockoutDuration: 1800000 // 30 minutes in milliseconds
  },
  
  // UI Configuration
  ui: {
    theme: 'default',
    enableAnimations: true,
    pageSize: 10,
    maxFileUploadSize: 10485760, // 10MB in bytes
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    supportedDocumentFormats: ['pdf', 'doc', 'docx']
  },
  
  // Development Configuration
  development: {
    enableLogging: false,
    logLevel: 'error',
    showDebugInfo: false,
    mockData: false,
    bypassAuth: false
  }
};