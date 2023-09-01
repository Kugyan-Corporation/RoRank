module.exports = async function(config, db, noblox) {
const express = require('express');
const app = express();
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(require('body-parser').json());

app.all('*', function (req, res, next) {
  if (config['api']['places'][0] && req.headers['roblox-id']) {
    for (let place of config['api']['places']) {
      if (place === Number(req.headers['roblox-id'])) return next();
    }
    return res.sendStatus(401);
  }
  next();
});

app.all('*', function (req, res, next) {
  if (process.env['KEY'] && req.query['key']) {
    for (let key of process.env['KEY'].split(' ')) {
      if (req.query['key'] === key) return next();
    }
    return res.sendStatus(401);
  }
  next();
});

app.post('/shout', async function(req, res) {
  try {
    if (!req.body.text) return res.sendStatus(400);
    if (await noblox.shout(req.body.text))
    { res.sendStatus(200) } else { res.sendStatus(503) }
  } catch (err) { res.sendStatus(500) }
});

app.post('/rank', async function(req, res) {
  try {
    if (!req.body.player || !req.body.rank) return res.sendStatus(400);
    if (await noblox.setRank(req.body.player, req.body.rank.trim()))
    { res.sendStatus(200) } else { res.sendStatus(503) }
  } catch (err) { res.sendStatus(500) }
});

app.post('/promote', async function(req, res) {
  try {
    if (!req.body.player) return res.sendStatus(400);
    if (await noblox.promote(req.body.player))
    { res.sendStatus(200) } else { res.sendStatus(503) }
  } catch (err) { res.sendStatus(500) }
});

app.post('/suspend', async function(req, res) {
  try {
    if (!req.body.player || !req.body.length) return res.sendStatus(400);
    if (await noblox.suspend(req.body.player, req.body.length.trim()))
    { res.sendStatus(200) } else { res.sendStatus(503) }
  } catch (err) { res.sendStatus(500) }
});

app.post('/demote', async function(req, res) {
  try {
    if (!req.body.player) return res.sendStatus(400);
    if (await noblox.demote(req.body.player))
    { res.sendStatus(200) } else { res.sendStatus(503) }
  } catch (err) { res.sendStatus(500) }
});

app.post('/exile', async function(req, res) {
  try {
    if (!req.body.player) return res.sendStatus(400);
    if (await noblox.exile(req.body.player))
    { res.sendStatus(200) } else { res.sendStatus(503) }
  } catch (err) { res.sendStatus(500) }
});

app.get('/bae', async function(req, res) {
  try { res.send(JSON.stringify(config['in-game'])); } catch (err) { res.sendStatus(500) }
});

app.listen(process.env['PORT'] || 80 || 7000); return true;
}