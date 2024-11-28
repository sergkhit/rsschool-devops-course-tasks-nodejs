const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Simple test app');
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
} else {
  module.exports = app; // Exportable application for testing
}