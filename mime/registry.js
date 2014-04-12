/*
 * Copyright 2012-2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var loader, when, registry;

		loader = require('../util/loader');
		when = require('when');

		function normalizeMime(mime) {
			// TODO we're dropping info that may be important
			return mime.split(/[;\+]/)[0].trim();
		}

		function Registry(parent) {
			var mimes = {};

			if (typeof parent === 'undefined') {
				// coerce a lookup function into the registry API
				parent = {
					lookup: function (mime) {
						// cache to avoid duplicate lookups
						mimes[mime] = loader('./type/' + mime, require);
						return mimes[mime];
					}
				};
			}

			/**
			 * Lookup the converter for a MIME type
			 *
			 * @param {string} mime the MIME type
			 * @return a promise for the converter
			 */
			this.lookup = function lookup(mime) {
				mime = normalizeMime(mime);
				return mime in mimes ? mimes[mime] : parent.lookup(mime);
			};

			/**
			 * Register a custom converter for a MIME type
			 *
			 * @param {string} mime the MIME type
			 * @param converter the converter for the MIME type
			 * @return a promise for the converter
			 */
			this.register = function register(mime, converter) {
				mime = normalizeMime(mime);
				mimes[mime] = when.resolve(converter);
				return mimes[mime];
			};

		}

		Registry.prototype = {

			/**
			 * Create a child registry whoes registered converters remain local, while
			 * able to lookup converters from its parent.
			 *
			 * @returns child MIME registry
			 */
			child: function child() {
				return new Registry(this);
			}

		};

		registry = new Registry();

		// include text/plain and application/json by default
		registry.register('text/plain', require('./type/text/plain'));
		registry.register('application/json', require('./type/application/json'));

		return registry;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
