'use strict';

const fs = require('node:fs');
const {readOptions, environment} = require('./options.cjs');
const {ConfigurationError, report} = require('./config-error.cjs');

try {
  const options = readOptions();
  try {fs.mkdirSync('/data/sessions', {recursive: true, mode: 0o700});}
  catch {throw new ConfigurationError('session_storage_failed');}
  console.log('4VRS WAHA: starting; open the dashboard to pair the default session.');
  // Replace the launcher: upstream retains its entrypoint and receives stop signals.
  try {process.execve('/bin/sh', ['sh', '/entrypoint.sh'], environment(options, process.env));}
  catch {throw new ConfigurationError('upstream_start_failed');}
} catch (error) {
  console.error(report(error));
  process.exit(1);
}
