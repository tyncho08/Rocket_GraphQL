export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:5001/api',
  
  // Application Configuration
  appName: 'LendPro - Complete Mortgage Platform',
  version: '1.0.0',
  
  // Features Configuration
  features: {
    enableAnalytics: false,
    enablePerformanceMonitoring: false,
    enableErrorTracking: true,
    enableServiceWorker: false,
    enableNotifications: true,
    enableDarkMode: true,
    enableOfflineMode: false
  },
  
  // External Services Configuration
  externalServices: {
    googleMapsApiKey: '', // Add your Google Maps API key here
    sentry: {
      dsn: '', // Add your Sentry DSN here for error tracking
      environment: 'development'
    },
    analytics: {
      googleAnalyticsId: '', // Add your Google Analytics ID here
      enabled: false
    }
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    duration: 300000, // 5 minutes in milliseconds
    maxSize: 100 // Maximum number of cached items
  },
  
  // Security Configuration
  security: {
    tokenKey: 'rocket_auth_token',
    sessionTimeout: 3600000, // 1 hour in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 900000 // 15 minutes in milliseconds
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
    enableLogging: true,
    logLevel: 'debug',
    showDebugInfo: true,
    mockData: false,
    bypassAuth: false
  }
};