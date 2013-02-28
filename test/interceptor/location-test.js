/*
 * Copyright (c) 2012-2013 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function (buster, define) {
	'use strict';

	var assert, refute, fail, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;

	define('rest/interceptor/location-test', function (require) {

		var location, rest;

		location = require('rest/interceptor/location');
		rest = require('rest');

		buster.testCase('rest/interceptor/location', {
			'should follow the location header': function (done) {
				var client, spy;
				spy = this.spy(function (request) {
					var response = { request: request, headers: {  } };
					if (spy.callCount < 3) {
						response.headers.Location = '/foo/' + spy.callCount;
					}
					return response;
				});
				client = location(spy);
				client({}).then(function (response) {
					refute(response.headers.Location);
					assert.same(3, spy.callCount);
					assert.same(spy.returnValues[0].headers.Location, '/foo/1');
					assert.same(spy.args[1][0].path, '/foo/1');
					assert.same(spy.args[1][0].method, 'GET');
					assert.same(spy.returnValues[1].headers.Location, '/foo/2');
					assert.same(spy.args[2][0].path, '/foo/2');
					assert.same(spy.args[2][0].method, 'GET');
					refute(spy.returnValues[2].headers.Location);
				}).then(undef, fail).always(done);
			},
			'should return the response if there is no location header': function (done) {
				var client, spy;
				spy = this.spy(function () { return { status: { code: 200 } }; });
				client = location(spy);
				client({}).then(function (response) {
					assert.equals(200, response.status.code);
					assert.same(1, spy.callCount);
				}).then(undef, fail).always(done);
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, location().skip());
			},
			'should support interceptor chaining': function () {
				assert(typeof location().chain === 'function');
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
