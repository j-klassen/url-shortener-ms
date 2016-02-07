'use strict';

// Database utility routes

const wrap = require('wrap-fn');

module.exports = (app, collection) => {

	// Clear database collection
	app.get('/db/clear', (req, res, next) => {
		return wrap(function* (req, res, next) {
			try {
				yield collection.remove({});

				res.json({
					message: 'Database successfully cleared'
				});
			} catch (err) {
				console.error(err);
				next(err);
			}
		})(req, res, next);
	});
};
