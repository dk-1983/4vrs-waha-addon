'use strict';

const {readOptions} = require('./options.cjs');

(async () => {
  try {
    const {apiKey} = readOptions();
    const response = await fetch('http://127.0.0.1:3000/api/sessions', {
      headers: {'X-Api-Key': apiKey}, redirect: 'error', signal: AbortSignal.timeout(5000),
    });
    // Unpaired/offline WhatsApp is not a crashed API. Do not restart for QR pairing.
    if (response.status !== 200) throw new Error();
    await response.body?.cancel();
  } catch {
    process.exitCode = 1;
  }
})();
