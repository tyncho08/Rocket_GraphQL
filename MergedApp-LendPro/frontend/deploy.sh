#!/bin/bash

# Rocket Mortgage Platform Deployment Script
# This script handles building and deploying the application for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="rocket-mortgage-platform"
BUILD_DIR="dist"
BACKUP_DIR="backup"
LOG_FILE="deployment.log"
NODE_VERSION="18"
ANGULAR_VERSION="17"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_CURRENT=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        print_warning "Node.js version $NODE_CURRENT detected. Recommended: $NODE_VERSION+"
    else
        print_success "Node.js version check passed"
    fi
    
    # Check Angular CLI
    if ! command -v ng &> /dev/null; then
        print_error "Angular CLI is not installed"
        print_status "Installing Angular CLI..."
        npm install -g @angular/cli@$ANGULAR_VERSION
    fi
    
    # Check if we're in the right directory
    if [ ! -f "angular.json" ]; then
        print_error "angular.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
    log_message "Prerequisites check completed successfully"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "pnpm-lock.yaml" ]; then
        print_status "Using pnpm..."
        if ! command -v pnpm &> /dev/null; then
            print_status "Installing pnpm..."
            npm install -g pnpm
        fi
        pnpm install
    elif [ -f "yarn.lock" ]; then
        print_status "Using yarn..."
        yarn install
    else
        print_status "Using npm..."
        npm install
    fi
    
    print_success "Dependencies installed"
    log_message "Dependencies installed successfully"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run unit tests
    if npm run test -- --watch=false --browsers=ChromeHeadless; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
    
    # Run linting
    if npm run lint; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        exit 1
    fi
    
    log_message "Tests and linting completed successfully"
}

# Function to build the application
build_application() {
    print_status "Building application for production..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        print_status "Cleaning previous build..."
        rm -rf $BUILD_DIR
    fi
    
    # Build with production configuration
    if ng build --configuration production --aot --build-optimizer --optimization; then
        print_success "Build completed successfully"
        
        # Show build stats
        print_status "Build statistics:"
        du -sh $BUILD_DIR/*
        
        # Check bundle sizes
        print_status "Checking bundle sizes..."
        find $BUILD_DIR -name "*.js" -exec du -h {} + | sort -h
        
    else
        print_error "Build failed"
        exit 1
    fi
    
    log_message "Production build completed successfully"
}

# Function to optimize build
optimize_build() {
    print_status "Optimizing build..."
    
    # Compress static assets
    if command -v gzip &> /dev/null; then
        print_status "Compressing assets with gzip..."
        find $BUILD_DIR -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -9 -c {} \; > {}.gz
        print_success "Assets compressed"
    fi
    
    # Generate service worker if not exists
    if [ ! -f "$BUILD_DIR/sw.js" ]; then
        print_status "Generating service worker..."
        cat > $BUILD_DIR/sw.js << 'EOF'
const CACHE_NAME = 'rocket-mortgage-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/polyfills.js',
  '/runtime.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
EOF
        print_success "Service worker generated"
    fi
    
    # Generate robots.txt
    cat > $BUILD_DIR/robots.txt << 'EOF'
User-agent: *
Allow: /
Sitemap: https://your-domain.com/sitemap.xml
EOF
    
    # Generate basic sitemap
    cat > $BUILD_DIR/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://your-domain.com/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.com/mortgage-tools</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
EOF
    
    log_message "Build optimization completed"
}

# Function to create backup
create_backup() {
    if [ -d "$BACKUP_DIR" ]; then
        print_status "Creating backup..."
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        BACKUP_NAME="backup_$TIMESTAMP"
        
        # Create backup directory if it doesn't exist
        mkdir -p "$BACKUP_DIR"
        
        # Copy current build to backup (if exists)
        if [ -d "current_build" ]; then
            cp -r current_build "$BACKUP_DIR/$BACKUP_NAME"
            print_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
        fi
        
        # Keep only last 5 backups
        cd $BACKUP_DIR
        ls -1t | tail -n +6 | xargs -r rm -rf
        cd ..
        
        log_message "Backup created successfully"
    fi
}

# Function to deploy to staging/production
deploy_application() {
    local ENVIRONMENT=${1:-staging}
    
    print_status "Deploying to $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        "staging")
            # Staging deployment (could be to AWS S3, Firebase, etc.)
            print_status "Deploying to staging environment..."
            # Example: aws s3 sync $BUILD_DIR s3://staging-bucket --delete
            ;;
        "production")
            # Production deployment
            print_status "Deploying to production environment..."
            # Example: aws s3 sync $BUILD_DIR s3://production-bucket --delete
            # Example: aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
            ;;
        "local")
            # Local server deployment
            print_status "Starting local server..."
            if command -v http-server &> /dev/null; then
                http-server $BUILD_DIR -p 8080 -c-1
            else
                print_status "Installing http-server..."
                npm install -g http-server
                http-server $BUILD_DIR -p 8080 -c-1
            fi
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log_message "Deployment to $ENVIRONMENT completed"
}

# Function to run security checks
security_check() {
    print_status "Running security checks..."
    
    # Check for known vulnerabilities
    if npm audit; then
        print_success "Security audit passed"
    else
        print_warning "Security vulnerabilities found. Run 'npm audit fix' to resolve."
    fi
    
    # Check for sensitive data in build
    print_status "Checking for sensitive data..."
    if grep -r -i "password\|secret\|key\|token" $BUILD_DIR --exclude-dir=node_modules 2>/dev/null; then
        print_warning "Potential sensitive data found in build files"
    else
        print_success "No sensitive data detected"
    fi
    
    log_message "Security checks completed"
}

# Function to run performance checks
performance_check() {
    print_status "Running performance checks..."
    
    # Check bundle sizes
    print_status "Checking bundle sizes..."
    MAIN_JS_SIZE=$(du -k $BUILD_DIR/main*.js | cut -f1)
    if [ "$MAIN_JS_SIZE" -gt 1000 ]; then
        print_warning "Main bundle size is large (${MAIN_JS_SIZE}KB). Consider code splitting."
    else
        print_success "Bundle size is optimal"
    fi
    
    # Check for unused files
    print_status "Checking for optimization opportunities..."
    
    log_message "Performance checks completed"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove temporary files
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -not -name "$LOG_FILE" -delete 2>/dev/null || true
    
    print_success "Cleanup completed"
    log_message "Cleanup completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  build     - Build the application for production"
    echo "  test      - Run tests and linting"
    echo "  deploy    - Deploy to specified environment (staging|production|local)"
    echo "  full      - Run complete deployment pipeline"
    echo "  check     - Run security and performance checks only"
    echo ""
    echo "Environments:"
    echo "  staging   - Deploy to staging environment"
    echo "  production- Deploy to production environment"
    echo "  local     - Start local development server"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 deploy staging"
    echo "  $0 full production"
}

# Main deployment pipeline
main() {
    local COMMAND=${1:-full}
    local ENVIRONMENT=${2:-staging}
    
    # Start logging
    echo "Starting deployment at $(date)" > $LOG_FILE
    
    print_status "🚀 Rocket Mortgage Platform Deployment"
    print_status "Command: $COMMAND, Environment: $ENVIRONMENT"
    
    case $COMMAND in
        "build")
            check_prerequisites
            install_dependencies
            build_application
            optimize_build
            ;;
        "test")
            check_prerequisites
            install_dependencies
            run_tests
            ;;
        "deploy")
            deploy_application $ENVIRONMENT
            ;;
        "full")
            check_prerequisites
            install_dependencies
            run_tests
            create_backup
            build_application
            optimize_build
            security_check
            performance_check
            deploy_application $ENVIRONMENT
            cleanup
            ;;
        "check")
            security_check
            performance_check
            ;;
        "help"|"--help"|"-h")
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
    
    print_success "✅ Deployment completed successfully!"
    log_message "Deployment completed successfully at $(date)"
}

# Error handling
trap 'print_error "Deployment failed at line $LINENO"; exit 1' ERR

# Run main function with all arguments
main "$@"