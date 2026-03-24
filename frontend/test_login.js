const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Listen to console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('BROWSER PAGE ERROR:', error.message);
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });

  console.log('Filling form...');
  await page.type('input[type="email"]', 'student@test.com');
  await page.type('input[type="password"]', 'password123');

  console.log('Clicking submit...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(e => console.log('Navigation timeout/error', e.message))
  ]);

  console.log('Current URL after login:', page.url());
  
  // Wait to see if crash happens shortly after
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
