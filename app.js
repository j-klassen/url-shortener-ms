'use strict';

// URL shortener service

const MongoClient = require('mongodb').MongoClient;
const co = require('co');
const express = require('express');
const app = express();

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 3000);

// In development, load our .env file.
// In production (heroku) we'll use the heroku env variables.
if (app.get('env') === 'development') {
	// Load .env
	require('dotenv').config();

	app.set('MONGO_HOST', process.env.MONGO_HOST);
	app.set('MONGO_DB', process.env.MONGO_DB);
}

app.set('MONGO_COLLECTION', process.env.MONGO_COLLECTION);

app.set('views', './views');
app.set('view engine', 'jade');

// Setup app
co(function* run() {
	const routes = require('./routes');
	let mongoUrl;

	if (app.get('env') === 'development') {
		mongoUrl = `mongodb://${app.get('MONGO_HOST')}/${app.get('MONGO_DB')}`;
	} else if (app.get('env') === 'production') {
		// Heroku variable
		mongoUrl = process.env.MONGOLAB_URI;
	}

	let db;
	let collection;

	try {
		db = yield MongoClient.connect(mongoUrl);
		collection = db.collection(app.get('MONGO_COLLECTION'));
	} catch (err) {
		console.error(err);
		return;
	}

	routes.main(app, collection);
	routes.db(app, collection);
	routes.url(app, collection);

	app.listen(app.get('port'), () => {
		console.log(`Server listening on port ${app.get('port')}`);
	});
});
