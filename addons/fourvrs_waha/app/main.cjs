'use strict';

const fs = require('node:fs');
const {readOptions, environment} = require('./options.cjs');

try {
  const options = readOptions();
  fs.mkdirSync('/data/sessions', {recursive: true, mode: 0o700});
  console.log('4VRS WAHA: starting; open the dashboard to pair the default session.');
  // Replace the launcher: upstream retains its entrypoint and receives stop signals.
  process.execve('/bin/sh', ['sh', '/entrypoint.sh'], environment(options, process.env));
} catch {
  // No option values, tokens, messages or upstream exception text in this log.
  console.error('4VRS WAHA: cannot start. Set API key and dashboard password (16+ characters), username and log level in Configuration.');
  process.exit(1);
}
