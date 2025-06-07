const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

function startServer(options = {}) {
  const app = express();
  const port = options.port || process.env.PORT || 3000;
  const appDir = options.appDir || path.join(__dirname, 'public');
  const staticDir =
    options.staticDir || path.join(os.homedir(), 'clocl_wallpapers');

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
  let settings = {
    font: 'noto-sans-jp-default',
    charSizeMultiplier: 1.0,
    displaySeconds: true,
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

  return app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
} else {
  module.exports = startServer;
}
