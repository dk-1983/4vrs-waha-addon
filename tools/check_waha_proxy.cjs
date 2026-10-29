/* Isolated Chromium proxy test. Only local fixtures; never visits WhatsApp. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const tls = require('node:tls');
const https = require('node:https');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const puppeteer = require('/app/node_modules/puppeteer');
const {proxyOptions} = require('/project/addons/fourvrs_waha/app/options.cjs');

const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

async function main() {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), '4vrs-proxy-'));
  const keyfile = path.join(folder, 'key.pem');
  const certfile = path.join(folder, 'cert.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
    '-subj', '/CN=fixture.invalid', '-addext', 'subjectAltName=DNS:fixture.invalid,IP:127.0.0.1',
    '-keyout', keyfile, '-out', certfile], {stdio:'ignore'});
  const context = {key: fs.readFileSync(keyfile), cert: fs.readFileSync(certfile)};
  const spki = crypto.createHash('sha256').update(new crypto.X509Certificate(context.cert)
    .publicKey.export({type:'spki',format:'der'})).digest('base64');
  const target = https.createServer(context, (req, res) => res.end('local-proxy-fixture'));
  await listen(target);
  try {
    for (const mode of ['http', 'https', 'socks5', 'http-auth', 'https-auth']) {
      const scheme = mode.split('-')[0];
      const authenticated = mode.endsWith('-auth');
      const sockets = new Set();
      let tunneled = 0;
      function track(socket) {sockets.add(socket); socket.on('close',()=>sockets.delete(socket)); socket.on('error',()=>{});}
      function connect(socket, reply) {
        const upstream = net.connect(target.address().port, '127.0.0.1', () => {
          tunneled++;
          socket.write(reply);
          socket.pipe(upstream).pipe(socket);
        });
        track(upstream);
        upstream.on('close',()=>socket.destroy());
        socket.on('close',()=>upstream.destroy());
      }
      function handle(socket) {
        track(socket);
        if (scheme === 'socks5') {
          socket.once('data', hello => {
            assert.equal(hello[0], 5);
            socket.write(Buffer.from([5, 0]));
            socket.once('data', request => {
              // SOCKS5 domain-name request: the target is not resolved locally.
              assert.equal(request[0], 5);
              assert.equal(request[1], 1);
              assert.equal(request[3], 3);
              const name = request.subarray(5, 5 + request[4]).toString();
              if (name !== 'fixture.invalid') {socket.destroy(); return;}
              connect(socket, Buffer.from([5,0,0,1,127,0,0,1,0,0]));
            });
          });
        } else {
          let pending = '';
          function header(chunk) {
            pending += chunk.toString();
            if (!pending.includes('\r\n\r\n')) return;
            socket.removeListener('data', header);
            if (!pending.startsWith('CONNECT fixture.invalid:443 ')) {socket.destroy(); return;}
            if (authenticated && !pending.includes('Proxy-Authorization: Basic '+
              Buffer.from('proxy-user:proxy-secret').toString('base64'))) {
              socket.end('HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="fixture"\r\nContent-Length: 0\r\nConnection: close\r\n\r\n');
              return;
            }
            connect(socket, 'HTTP/1.1 200 Connection established\r\n\r\n');
          }
          socket.on('data', header);
        }
      }
      const server = scheme === 'https' ? tls.createServer(context, handle) : net.createServer(handle);
      await listen(server);
      const proxy = proxyOptions({proxy_enabled:true,proxy_url:scheme+'://127.0.0.1:'+server.address().port,
        proxy_username:authenticated?'proxy-user':'', proxy_password:authenticated?'proxy-secret':''});
      let browser;
      try {
        browser = await puppeteer.launch({headless:true, executablePath:'/usr/bin/chromium', args:[
          '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking',
          '--proxy-server='+proxy.server, '--proxy-bypass-list=<-loopback>',
          // Trust only this disposable fixture's public key, not arbitrary certificates.
          '--ignore-certificate-errors-spki-list='+spki,
        ]});
        const page = await browser.newPage();
        if (authenticated) await page.authenticate({username:proxy.username,password:proxy.password});
        await page.goto('https://fixture.invalid/', {waitUntil:'domcontentloaded',timeout:15000});
        assert.match(await page.content(), /local-proxy-fixture/);
        assert.ok(tunneled > 0);
        console.log('Chromium '+mode+' proxy to local TLS fixture: OK');
      } finally {
        if (browser) await browser.close();
        for (const socket of sockets) socket.destroy();
        await new Promise(resolve=>server.close(resolve));
      }
    }
  } finally {
    target.closeAllConnections();
    await new Promise(resolve=>target.close(resolve));
    fs.rmSync(folder, {recursive:true});
  }
}

main().catch(()=>{console.error('Chromium proxy fixture failed'); process.exitCode=1;});
