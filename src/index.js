const express = require('express');
const path = require('path');
const app = express();

const { getBilingualDetail } = require('./ted');

app.get('/api/:id', (req, res) => {
  // ctx.router
  const { id } = req.params;
  getBilingualDetail(id, ['en', 'zh-cn']).then((bilingual) => {
    if (!bilingual?.paragraphs.length) {
      res.header('Cache-Control', 'max-age=31536000');
    }
    res.json(bilingual);
  });
});
app.get('/abc', (req, res) => {
  res.send('fuck');
});
app.use(express.static(path.join(__dirname, '../dist')));

module.exports = app;
