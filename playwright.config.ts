import { defineConfig, devices } from '@playwright/test';

/**
 * 🎭 Playwright Configuration for DRE Bug Testing
 * 
 * Configuração específica para testes de bugs do DRE
 */
export default defineConfig({
  // Test directory
  testDir: './__tests__',
  
  // Test file pattern
  testMatch: [
    '**/*playwright*.test.ts',
    '**/*e2e*.test.ts'
  ],
  
  // Timeout configurations
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  
  // Test execution
  fullyParallel: false, // Run tests sequentially for DRE
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 1, // Single worker for stability
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line']
  ],
  
  // Output directory
  outputDir: 'test-results/artifacts',
  
  // Global setup and teardown
  use: {
    // Base URL
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    
    // Screenshots and videos
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    
    // Trace on failure
    trace: 'retain-on-failure',
    
    // Timeout for actions
    actionTimeout: 15000, // 15 seconds for clicks, etc.
    navigationTimeout: 30000, // 30 seconds for page loads
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // Accept downloads
    acceptDownloads: true,
    
    // User agent
    userAgent: 'Playwright-DRE-Testing/1.0',
    
    // Locale and timezone
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    
    // Color scheme
    colorScheme: 'light',
    
    // Permissions
    permissions: ['clipboard-read', 'clipboard-write']
  },

  // Project configurations
  projects: [
    {
      name: 'DRE-Desktop-Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional Chrome-specific settings
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content'
          ]
        }
      },
    },
    {
      name: 'DRE-Desktop-Firefox',
      use: { 
        ...devices['Desktop Firefox'] 
      },
    },
    {
      name: 'DRE-Desktop-Safari',
      use: { 
        ...devices['Desktop Safari'] 
      },
    },
  ],

  // Development server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000, // 2 minutes to start
    reuseExistingServer: true, // Don't start if already running
    stdout: 'pipe',
    stderr: 'pipe'
  },

  // Global setup
  globalSetup: require.resolve('./test-setup/global-setup.ts'),
  globalTeardown: require.resolve('./test-setup/global-teardown.ts')
});

// Export test configuration
export const TEST_CONFIG = {
  baseURL: process.env.TEST_URL || 'http://localhost:3000',
  credentials: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@federalinvest.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
    },
    viewer: {
      email: process.env.TEST_VIEWER_EMAIL || 'viewer@federalinvest.com',
      password: process.env.TEST_VIEWER_PASSWORD || 'viewer123'
    }
  },
  timeouts: {
    test: 60000,
    action: 15000,
    navigation: 30000,
    expect: 10000
  },
  retries: {
    ci: 2,
    local: 1
  },
  workers: {
    ci: 1,
    local: 1
  }
};