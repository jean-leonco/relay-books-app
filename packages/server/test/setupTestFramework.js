// this file is ran right after the test framework is setup for some test file.

require('core-js/stable');

global.fetch = require('jest-fetch-mock');
