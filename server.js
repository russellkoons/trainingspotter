const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();
app.use(express.static('public'));

let server;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function() {
    console.info(`App listening on ${this.address().port}`);
  });
}

module.exports = { app };