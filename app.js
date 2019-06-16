const express = require('express');

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

module.exports = app;
