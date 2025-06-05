const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to list backgrounds
app.get('/backgrounds', (req, res) => {
  const bgDir = path.join(__dirname, 'public', 'static');
  fs.readdir(bgDir, (err, files) => {
    if (err) {
      res.status(500).json([]);
      return;
    }
    const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
    res.json(images);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
