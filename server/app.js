
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/extract', async (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ success: false, message: 'No link provided' });
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(link, { waitUntil: 'networkidle2' });

    await page.waitForSelector('video', { timeout: 10000 });

    const streamUrl = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.src : null;
    });

    await browser.close();

    if (streamUrl) {
      res.json({ success: true, streamUrl });
    } else {
      res.status(404).json({ success: false, message: 'Video URL not found' });
    }
  } catch (error) {
    console.error('Error extracting video URL:', error.message);
    res.status(500).json({ success: false, message: 'Error extracting video URL' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
