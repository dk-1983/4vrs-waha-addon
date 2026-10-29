'use strict';
const {readOptions} = require('./options.cjs');
const {report} = require('./config-error.cjs');

try {
  readOptions(process.argv[2] || '/data/options.json');
  console.log('4VRS WAHA: configuration OK / Настройки проверены.');
} catch (error) {
  console.error(report(error));
  process.exitCode = 1;
}
