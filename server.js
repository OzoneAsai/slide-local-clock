const express = require('express');
const fs = require('fs');
const path = require('path');

function startServer(options = {}) {
  const app = express();
  const port = options.port || process.env.PORT || 3000;
  const appDir = options.appDir || path.join(__dirname, 'public');
  const staticDir = options.staticDir || path.join(appDir, 'static');

  // Serve the app files (index.html, scripts, etc.)
  app.use(express.static(appDir));
  // Serve images from the chosen static directory
  app.use('/static', express.static(staticDir));

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
