/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
    'use strict';

    var undef;

    define(function (require) {

        var when, prefix;

        when = require('when');
        prefix = 'rest/';

        /**
         * Load an AMD module dynamically
         *
         * As error handling is not reliable, the attempt to load the module
         * will time out after 1 second.
         *
         * @param {string} moduleId the module to load
         * @param {function} [req] local require to use
         * @returns {Promise<?>} promise for the module content
         */
        function loadAMD(moduleId, req) {
            return when.promise(function (resolve, reject) {
                // HOPE reject on a local require would be nice
                (req || require).call(undef, [moduleId], resolve, reject);
            }).timeout(1000, new Error('Timeout loading module: ' + moduleId));
        }

        /**
         * Load a Node module dynamically
         *
         * The module ID will be normalized to a local path, if an absolute
         * module ID is provided for a rest.js provided module.
         *
         * @param {string} moduleId the module to load
         * @param {function} [req] local require to use
         * @returns {Promise<?>} promise for the module content
         */
        function loadNode(moduleId, req) {
            if (!req && moduleId.indexOf(prefix) === 0) {
                moduleId = '../' + moduleId.slice(prefix.length);
            }
            return when.attempt(function () {
                return (req || require).call(undef, moduleId);
            });
        }

        return typeof define === 'function' && define.amd ? loadAMD : loadNode;

    });

}(
    typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
    // Boilerplate for AMD and Node
));
