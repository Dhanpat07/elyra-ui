/**
 * Screenshot Utility for UI Review
 * 
 * Takes screenshots of the running app at various viewport sizes
 * and page states for AI-assisted UI review.
 * 
 * Features:
 * - Automatic compression if file > 5MB
 * - JPEG fallback for large screenshots
 * - Configurable quality settings
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_DIMENSION = 1000; // Max width/height in pixels (API limit is 2000 for multi-image)

// Viewport sizes to test - all under 1000px for API compatibility
const VIEWPORTS = {
  mobile: { width: 375, height: 700 },
  tablet: { width: 768, height: 900 },
  desktop: { width: 1000, height: 700 },
};

// Pages/routes to capture
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'laali', path: '/laali' },
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshot(page, name, viewport) {
  const pngFilename = `${name}_${viewport}.png`;
  const pngFilepath = path.join(SCREENSHOT_DIR, pngFilename);
  
  // First try PNG with lower scale factor to reduce size
  await page.screenshot({ 
    path: pngFilepath, 
    fullPage: false,  // Don't capture full page to reduce size
    scale: 'css',     // Use CSS pixels instead of device pixels
  });
  
  // Check file size
  const stats = fs.statSync(pngFilepath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  if (stats.size > MAX_FILE_SIZE) {
    console.log(`⚠️  ${pngFilename} is ${fileSizeMB}MB, converting to JPEG...`);
    
    // Take JPEG screenshot instead (much smaller)
    const jpegFilename = `${name}_${viewport}.jpg`;
    const jpegFilepath = path.join(SCREENSHOT_DIR, jpegFilename);
    
    await page.screenshot({ 
      path: jpegFilepath, 
      fullPage: false,
      type: 'jpeg',
      quality: 80,  // Good quality, smaller size
    });
    
    // Remove the large PNG
    fs.unlinkSync(pngFilepath);
    
    const jpegStats = fs.statSync(jpegFilepath);
    const jpegSizeMB = (jpegStats.size / (1024 * 1024)).toFixed(2);
    console.log(`📸 Captured: ${jpegFilename} (${jpegSizeMB}MB)`);
    
    return jpegFilepath;
  }
  
  console.log(`📸 Captured: ${pngFilename} (${fileSizeMB}MB)`);
  return pngFilepath;
}

async function captureAllPages() {
  await ensureDir(SCREENSHOT_DIR);
  
  const browser = await chromium.launch({ headless: true });
  const screenshots = [];
  
  try {
    for (const [viewportName, viewportSize] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({
        viewport: viewportSize,
        deviceScaleFactor: 1, // Use 1x scale to reduce file size (was 2x retina)
      });
      const page = await context.newPage();
      
      // Collect console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      page.on('pageerror', err => {
        errors.push(err.message);
      });
      
      for (const pageConfig of PAGES) {
        const url = `${BASE_URL}${pageConfig.path}`;
        console.log(`\n🌐 Loading ${url} (${viewportName})...`);
        
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(1000); // Wait for animations
          
          const filepath = await takeScreenshot(page, pageConfig.name, viewportName);
          screenshots.push({
            page: pageConfig.name,
            viewport: viewportName,
            path: filepath,
            url,
            errors: [...errors],
          });
          errors.length = 0; // Clear for next page
          
        } catch (err) {
          console.error(`❌ Failed to capture ${pageConfig.name}: ${err.message}`);
          screenshots.push({
            page: pageConfig.name,
            viewport: viewportName,
            error: err.message,
            url,
          });
        }
      }
      
      await context.close();
    }
    
    // Write summary
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
      screenshots,
    };
    
    const summaryPath = path.join(SCREENSHOT_DIR, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n✅ Summary written to ${summaryPath}`);
    
  } finally {
    await browser.close();
  }
  
  return screenshots;
}

// Utility to check and compress existing screenshots
async function compressExisting() {
  const files = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));
  
  for (const file of files) {
    const filepath = path.join(SCREENSHOT_DIR, file);
    const stats = fs.statSync(filepath);
    
    if (stats.size > MAX_FILE_SIZE) {
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`⚠️  ${file} is ${sizeMB}MB - consider manual compression`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--check')) {
    compressExisting();
  } else {
    captureAllPages()
      .then(screenshots => {
        console.log(`\n🎉 Captured ${screenshots.length} screenshots`);
        process.exit(0);
      })
      .catch(err => {
        console.error('Screenshot capture failed:', err);
        process.exit(1);
      });
  }
}

module.exports = { captureAllPages, takeScreenshot, compressExisting };
