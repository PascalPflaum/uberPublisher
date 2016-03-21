require('uber.objects')(Object);
path = require('path');

//loading test modules
chai = require('chai');
sinon = require('sinon');

//configure chai
chai.use(require('sinon-chai'));
chai.config.includeStack = true;
assert = Object.merge(chai.assert, sinon.assert);

PATH_TO_ROOT = path.resolve('src/');