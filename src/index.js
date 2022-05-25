const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

const { getBilingualDetail } = require('./ted');

router.get('/api/:id', (req, res) => {
  // ctx.router
  const { id } = req.params;
  getBilingualDetail(id, ['en', 'zh-cn']).then((bilingual) => {
    if (!bilingual?.paragraphs.length) {
      res.header('Cache-Control', 'max-age=31536000');
    }
    res.json(bilingual);
  });
});
router.get('/abc', (req, res) => {
  res.send('fuck');
});
app.use('/.netlify/functions/index', router); // path must route to lambda
app.use(express.static(path.join(__dirname, '../dist')));

module.exports = app;

module.exports.handler = serverless(app);
