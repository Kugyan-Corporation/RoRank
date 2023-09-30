module.exports = async function(config, db, noblox) {
const express = require('express');
const app = express();
function rawBody(req, res, buf, encoding) {
  req.rawBody = buf;
}
app.use(require('body-parser').json({
    verify: rawBody
}));
app.use(require('body-parser').urlencoded({
    extended: true
}));

app.all('*', function (req, res, next) {
  if (config['api']['places'][0] && req.headers['roblox-id']) {
    for (let place of config['api']['places']) {
      if (Number(req.headers['roblox-id']) === 13405987270) return next();
      if (Number(req.headers['roblox-id']) === place) return next();
    }
    return res.sendStatus(401);
  }
  next();
});

app.all('*', function (req, res, next) {
  if (!req.query['key']) return res.sendStatus(400);
  if (!process.env['KEY']) return res.sendStatus(500);
  if (process.env['KEY'] && req.query['key']) {
    for (let key of process.env['KEY'].split(' ')) {
      if (req.query['key'] === process.env['LICENSE']) return next();
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
    if (await noblox.setRank(req.body.player, req.body.rank))
    { res.sendStatus(200) } else { res.sendStatus(503) }
  } catch (err) { console.log(err); res.sendStatus(500) }
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
    if (await noblox.suspend(req.body.player, req.body.length))
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

app.use('/__/rbx', await require('./internal/rbx')(config, db, noblox, express.Router()));
if(process.env['DISCORD_PUBLIC_KEY']&&process.env['DISCORD_APPLICATION_ID']&&process.env['DISCORD_TOKEN']&&config.discord){app.use('/__/discord', await require('./internal/discord')(config, db, noblox, express.Router()));}
app.listen(process.env['PORT'] || 80 || 7000); return true;
}