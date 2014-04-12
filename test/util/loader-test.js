/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (buster, define) {
	'use strict';

	var assert, refute, fail;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;

	define('rest/util/loader-test', function (require) {

		var loader = require('rest/util/loader'),
		    interceptor = require('rest/interceptor'),
		    when = require('when');

		buster.testCase('rest/util/loader', {
			'should load a module within the rest pacakge': function () {
				return loader('rest/interceptor').then(
					function (module) {
						assert.same(module, interceptor);
					},
					fail
				);
			},
			'should load a module outside the rest pacakge': function () {
				return loader('when').then(
					function (module) {
						assert.same(module, when);
					},
					fail
				);
			},
			'should fail to load a bogus module ID': function () {
				return loader('rest/not/a/module').then(
					fail,
					function (err) {
						// error content is loader specific...
						assert(err);
					}
				);
			}
		});
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
