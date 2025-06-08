const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const osLocale = require('os-locale');
const supportedLangs = require('./public/lang-constants');

function startServer(options = {}) {
  const app = express();
  const port = options.port || process.env.PORT || 3000;
  const host = options.host || process.env.HOST || '127.0.0.1';
  const appDir = options.appDir || path.join(__dirname, 'public');
  const staticDir =
    options.staticDir || path.join(os.homedir(), 'clock_wallpapers');

  function getDataDir() {
    if (process.platform === 'win32') {
      return process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    }
    return process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  }
  const dataDir = path.join(getDataDir(), 'slide-local-clock');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const settingsFile = path.join(dataDir, 'settings.json');
  function matchLang(locale) {
    if (!locale) return 'en-US';
    const norm = locale.replace('_','-');
    const found = supportedLangs.find(l => norm.toLowerCase().startsWith(l.toLowerCase().substring(0,2)));
    return found || 'en-US';
  }
  const defaultLocale = matchLang(osLocale.sync());

  let settings = {
    font: 'noto-sans-jp-default',
    charSizeMultiplier: 1.0,
    dateSizeRatio: 0.5,
    timeFormat: 'HH:mm:ss',
    dateFormat: 'numeric',
    dateLang: defaultLocale,
    lang: defaultLocale,
    bgConfigs: [],
  };
  if (fs.existsSync(settingsFile)) {
    try {
      const loaded = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
      Object.assign(settings, loaded);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  // Serve the app files (index.html, scripts, etc.)
  app.use(express.static(appDir));
  // Serve images from the chosen static directory
  app.use('/static', express.static(staticDir));

  app.use(express.json());

  app.get('/settings', (req, res) => {
    res.json(settings);
  });

  app.post('/settings', (req, res) => {
    settings = req.body;
    fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), err => {
      if (err) {
        console.error('Failed to save settings:', err);
        res.status(500).end();
      } else {
        res.json({ ok: true });
      }
    });
  });

  // Endpoint to list background images
  app.get('/backgrounds', (req, res) => {
    fs.readdir(staticDir, (err, files) => {
      if (err) {
        res.status(500).json([]);
        return;
      }
      const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      res.json(images);
    });
  });

  return app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
  });
}

if (require.main === module) {
  startServer();
} else {
  module.exports = startServer;
}
