/**
 * Configuration for Elite Cards Application
 * 
 * This file contains environment-specific settings for connecting
 * your frontend to your NodeLumes PocketBase server.
 */

window.EliteCardsConfig = {
    // Your NodeLumes PocketBase server configuration
    pocketbase: {
        // Your PocketBase server URL (hosted on NodeLumes)
        url: 'http://node68.lunes.host:3246',
        
        // Collection names
        collections: {
            cards: 'Cards',
            users: 'users',
            payments: 'payment_proofs'
        }
    },
    
    // Frontend hosting configurations
    hosting: {
        // Development (localhost)
        development: {
            allowMixedContent: true,
            corsMode: 'no-cors'
        },
        
        // Production hosting scenarios
        production: {
            // For HTTPS hosted frontends
            httpsHosting: {
                // Mixed content warning
                warnMixedContent: true,
                // Fallback behavior when PocketBase is unreachable
                fallbackToLocalStorage: true
            },
            
            // For HTTP hosted frontends (recommended for NodeLumes PocketBase)
            httpHosting: {
                // Direct connection should work
                directConnection: true
            }
        }
    },
    
    // Error handling
    errorHandling: {
        // Show detailed error messages in console
        verboseLogging: true,
        
        // Retry attempts for failed requests
        retryAttempts: 3,
        
        // Timeout for requests (milliseconds)
        requestTimeout: 30000
    },
    
    // UI Configuration
    ui: {
        // Show connection status to users
        showConnectionStatus: true,
        
        // Notification duration (milliseconds)
        notificationDuration: 5000
    }
};

/**
 * Helper function to detect hosting environment
 */
window.EliteCardsConfig.detectEnvironment = function() {
    const host = window.location.host.toLowerCase();
    const protocol = window.location.protocol;
    
    const environment = {
        isLocalhost: host.includes('localhost') || host.includes('127.0.0.1'),
        isCodespace: host.includes('codespace'),
        isHttps: protocol === 'https:',
        isProduction: !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('codespace'),
        host: host,
        protocol: protocol
    };
    
    console.log('🔍 Environment Detection:', environment);
    return environment;
};

/**
 * Get recommended configuration based on current environment
 */
window.EliteCardsConfig.getRecommendedConfig = function() {
    const env = this.detectEnvironment();
    
    if (env.isLocalhost) {
        return {
            environment: 'development',
            pocketbaseUrl: this.pocketbase.url,
            expectedIssues: [],
            recommendations: ['Direct connection should work perfectly']
        };
    }
    
    if (env.isProduction && env.isHttps) {
        return {
            environment: 'production-https',
            pocketbaseUrl: this.pocketbase.url,
            expectedIssues: [
                'Mixed content warnings (HTTPS → HTTP)',
                'Possible browser blocking of HTTP requests',
                'CORS policy restrictions'
            ],
            recommendations: [
                'Consider hosting frontend on HTTP if possible',
                'Or upgrade PocketBase to HTTPS',
                'Or use a reverse proxy with SSL termination'
            ]
        };
    }
    
    if (env.isProduction && !env.isHttps) {
        return {
            environment: 'production-http',
            pocketbaseUrl: this.pocketbase.url,
            expectedIssues: [
                'Possible CORS policy restrictions'
            ],
            recommendations: [
                'Direct connection should work',
                'Ensure PocketBase CORS settings allow your domain'
            ]
        };
    }
    
    return {
        environment: 'unknown',
        pocketbaseUrl: this.pocketbase.url,
        expectedIssues: ['Unknown environment'],
        recommendations: ['Check console for detailed environment info']
    };
};

console.log('⚙️ Elite Cards Configuration Loaded');
console.log('🔧 Current Environment Analysis:', window.EliteCardsConfig.getRecommendedConfig());