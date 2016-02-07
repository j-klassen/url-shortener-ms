'use strict';

// Main routes

const wrap = require('wrap-fn');

module.exports = (app, collection) => {
	app.get('/', (req, res) => {
		res.render('index');
	});

	// Redirect route
	app.get('/:id', (req, res) => {
		return wrap(function* (req, res) {
			try {
				let url = yield collection.findOne({
					short_url: req.params.id
				});

				if (!url) {
					return res.json({
						error: 'No short url found for given input'
					});
				}

				res.redirect(url.original_url);
			} catch (err) {
				console.error(err);
				return res.json(err);
			}
		})(req, res);
	});
};
