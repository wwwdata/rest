/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var loader, when;

		loader = require('./util/loader');
		when = require('when');

		/**
		 * Add common helper methods to a client impl
		 *
		 * @param {function} impl the client implementation
		 * @param {Client} [target] target of this client, used when wrapping other clients
		 * @returns {Client} the client impl with additional methods
		 */
		return function client(impl, target) {

			if (target) {

				/**
				 * @returns {Client} the target client
				 */
				impl.skip = function skip() {
					return target;
				};

			}

			/**
			 * Allow a client to easily be wrapped by an interceptor
			 *
			 * @param {Interceptor|string} interceptor either the interceptor,
			 *   or module ID for the interceptor, to wrap this client with
			 * @param [config] configuration for the interceptor
			 * @returns {Client} the newly wrapped client
			 */
			impl.wrap = function wrap(interceptor, config) {
				if (typeof interceptor !== 'string') {
					return interceptor(impl, config);
				}
				var client = loader(interceptor, require).then(function (interceptor) {
					return interceptor(impl, config);
				});
				return function () {
					var ctx = this,
					    args = arguments;
					return client.then(function (client) {
						return client.apply(ctx, args);
					});
				};
			};

			/**
			 * @deprecated
			 */
			impl.chain = function chain() {
				if (console) {
					(console.warn || console.log).call(console, 'rest.js: client.chain() is deprecated, use client.wrap() instead');
				}
				return impl.wrap.apply(this, arguments);
			};

			return impl;

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
