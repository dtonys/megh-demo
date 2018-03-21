const path = require('path');
const auth = require('basic-auth');
const express = require('express');

const app = express();

const viewPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'views/build')
  : path.join(__dirname, 'views');

app.set('views', viewPath);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));

const basicAuthMiddleware = (req, res, next) => {
  const credentials = auth(req);
  if ( !credentials || credentials.name !== 'megh' || credentials.pass !== 'megh' ) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
    return;
  }
  next();
};

app.use( basicAuthMiddleware );

app.get('/', (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard - Megh Networks',
  });
});

app.get('/node-detail', (req, res) => {
  res.render('pages/node-detail', {
    title: 'Node Detail - Megh Networks',
  });
});

app.get('/chart', (req, res) => {
  res.render('pages/chart', {
    title: 'Chart Page - Megh Networks',
  });
});

app.listen( process.env.PORT, () => {
  console.log('HTTP server is listening on port ' + process.env.PORT);
});
