'use strict';

// Url routes

const shortid = require('shortid');
const wrap = require('wrap-fn');

// Used to check for a few key areas: protocol, slashes and host.
function httpURLValidate(url) {
	let urlObj = require('url').parse(url);
	let protocols = ['http:', 'https:'];

	return (!!~protocols.indexOf(urlObj.protocol) &&
					!!urlObj.slashes &&
					!!urlObj.host.match(/\w+\.{1,}\w+/));
}

module.exports = (app, collection) => {
	// Create a new url entry, or return an existing one.
	app.get('/new/*', (req, res) => {
		return wrap(function* (req, res) {
			if (req.params[0]) {
				let url = req.params[0];

				if (httpURLValidate(url)) {
					let id = shortid.generate();

					// We won't store the host along with the short code.
					// If we moved hosts, this would fail.
					try {
						// If the url exists, return existing data.
						let existing = yield collection.findOne({
							original_url: url
						});

						if (existing) {
							return res.json({
								original_url: url,
								short_url: `${req.protocol}://${req.get('host')}/${existing.short_url}`
							});
						}

						// Create new entry
						yield collection.insertOne({
							_id: id,
							original_url: url,
							short_url: id
						});

						res.json({
							original_url: url,
							short_url: `${req.protocol}://${req.get('host')}/${id}`
						});
					} catch (err) {
						console.error(err);
						return res.json(err);
					}
				} else {
					res.json({
						error: "Invalid URL"
					});
				}
			} else {
				res.json({
					error: 'No URL provided to generate short code'
				});
			}
		})(req, res);
	});
};
