const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(4005, () => console.log('Minimal server listening on 4005'));
