
const express = require('express');

const app = express();

app.get('/api', (req, res) => {
  setTimeout((() => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json({ data: 'API response'});
  }), 300)

});
app.listen(4300, () => {
  console.log('Server listening on port http://localhost:4206');
});
