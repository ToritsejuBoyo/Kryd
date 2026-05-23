const puppeteer = require('puppeteer');

async function run() {
  console.log('Starting Puppeteer browser test with coordinate clicks...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactPath = (name) => `C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\c3ddca5e-fbfe-42d5-8e0d-0da0d6f048ca\\${name}.png`;

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1024, height: 768 });

    // Handle console logs from the page
    page.on('console', msg => {
      console.log(`[PAGE LOG] ${msg.text()}`);
    });

    console.log('Navigating to http://localhost:8082...');
    await page.goto('http://localhost:8082', { waitUntil: 'networkidle2' });

    // Wait a few seconds for hydration/ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Current URL:', page.url());
    await page.screenshot({ path: artifactPath('test_1_loaded') });

    // Find email input
    console.log('Locating email input...');
    const emailInput = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('input')).find(el => el.placeholder && el.placeholder.toLowerCase().includes('email'));
    });

    if (!emailInput.asElement()) {
      throw new Error('Email input field not found');
    }

    // Find password input
    console.log('Locating password input...');
    const passwordInput = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('input')).find(el => el.placeholder && el.placeholder.toLowerCase().includes('password'));
    });

    if (!passwordInput.asElement()) {
      throw new Error('Password input field not found');
    }

    // Enter credentials
    console.log('Entering credentials...');
    
    // Use focus and coordinates or native element typing
    await emailInput.asElement().focus();
    await emailInput.asElement().type('testuser_1779472416371@example.com', { delay: 50 });
    
    await passwordInput.asElement().focus();
    await passwordInput.asElement().type('TestPassword123!', { delay: 50 });

    await page.screenshot({ path: artifactPath('test_2_typed') });

    const signInButton = await page.evaluateHandle(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const matches = elements.filter(el => {
        const text = (el.innerText || '').trim().toUpperCase();
        return text === 'SIGN IN';
      });
      if (matches.length === 0) return null;
      matches.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return (rectA.width * rectA.height) - (rectB.width * rectB.height);
      });
      return matches[0];
    });

    if (!signInButton || !signInButton.asElement()) {
      throw new Error('Sign In button not found');
    }

    // Get coordinates for click
    const rect = await page.evaluate(el => {
      const { top, left, width, height } = el.getBoundingClientRect();
      return { x: left + width / 2, y: top + height / 2 };
    }, signInButton);

    console.log(`Clicking Sign In button at coordinate: x=${rect.x}, y=${rect.y}`);
    await page.mouse.click(rect.x, rect.y);

    // Wait 3 seconds and take a screenshot to capture any click/loading state
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: artifactPath('test_3_after_click') });

    // Wait and watch for page redirection
    console.log('Waiting for redirection (up to 15s)...');
    let redirected = false;
    for (let i = 0; i < 150; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const currentUrl = page.url();
      if (currentUrl.includes('(tabs)') || currentUrl.includes('dashboard')) {
        console.log(`SUCCESS: Redirected to dashboard! Current URL: ${currentUrl}`);
        redirected = true;
        break;
      }
      if (currentUrl.includes('role-select') || currentUrl.includes('onboarding')) {
        console.log(`FAILURE: Redirected to onboarding! Current URL: ${currentUrl}`);
        break;
      }
    }

    await page.screenshot({ path: artifactPath('test_4_final') });

    if (!redirected) {
      console.log(`Finished waiting. Final URL is: ${page.url()}`);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
