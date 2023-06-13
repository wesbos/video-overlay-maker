import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

const browser = await puppeteer.launch();
const page = await browser.newPage();
const recorderOptions = {
  format: 'png',
  videoCodec: 'png',
  videoPixelFormat: 'rgba',
  fps: 60,
};
const recorder = new PuppeteerScreenRecorder(page);
await page.goto('http://localhost:5174/visualizer.html');
// Wait for page to load
await page.waitForSelector('audio');
// Click the body
await page.click('body');
// const testHtml =
//   '<!DOCTYPE html>\n<html>\n<head>\n<title>\n</title>\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>\n    body {margin: 0}\n    h1{font-family:Arial, sans-serif;color:red;margin: 0; text-transform: uppercase;}\n    .container {\n        width: 1080px;\n        height: 1080px;\n        text-align: center;\n        padding-top: 100px;\n    }\n</style>\n</head>\n<body>\n<h1>headline</h1>\n</body>\n</html>';
// await page.setContent(testHtml);

// set transparent background in browsers
const client = await page.target().createCDPSession();
await client.send('Emulation.setDefaultBackgroundColorOverride', {
  color: { r: 0, g: 0, b: 0, a: 0 },
});

await recorder.start('./simple.mov'); // supports extension - mp4, avi, webm and mov
await page.waitForTimeout(5000);
await recorder.stop();
await browser.close();
