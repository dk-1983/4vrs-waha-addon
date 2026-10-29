"""Smoke-test a built app with disposable Docker data and fake credentials only.

Run on a Docker host: python tools/check_waha_addon.py [docker-executable]
Never pairs a phone, creates a WhatsApp session or sends a message.
"""
import json
import subprocess
import sys
import time
import uuid

docker = sys.argv[1] if len(sys.argv) > 1 else 'docker'
image = 'fourvrs-waha:check'
name = 'fourvrs-waha-check-' + uuid.uuid4().hex[:10]
volume = name + '-data'
options = {
    'api_key': 'fake-api-key-' + uuid.uuid4().hex,
    'dashboard_username': 'test-admin',
    'dashboard_password': 'fake-dashboard-' + uuid.uuid4().hex,
    'log_level': 'warn',
}


def run(*args, check=True):
    result = subprocess.run([docker, *args], capture_output=True, text=True, encoding='utf-8')
    if check and result.returncode:
        raise RuntimeError('Docker check failed: ' + args[0])
    return result


def ready():
    for _ in range(60):
        if run('exec', name, 'node', '/opt/fourvrs/healthcheck.cjs', check=False).returncode == 0:
            return
        time.sleep(1)
    raise RuntimeError('WAHA API startup timed out')


try:
    run('volume', 'create', volume)
    run('run', '--rm', '-v', volume + ':/data', '--entrypoint', 'node', image, '-e',
        "require('fs').writeFileSync('/data/options.json',process.argv[1])", json.dumps(options))
    run('run', '-d', '--init', '--name', name, '-v', volume + ':/data', image)
    ready()
    script = r"""
    const assert=require('node:assert/strict');
    const fs=require('node:fs');
    const {api_key}=JSON.parse(fs.readFileSync('/data/options.json'));
    (async()=>{
      const root='http://127.0.0.1:3000';
      assert.equal((await fetch(root+'/api/sessions')).status,401);
      assert.equal((await fetch(root+'/dashboard/')).status,401);
      const result=await fetch(root+'/api/sessions',{headers:{'X-Api-Key':api_key}});
      assert.equal(result.status,200);
      assert.deepEqual(await result.json(),[]);
      fs.writeFileSync('/data/sessions/persistence-check','retained');
    })().catch(()=>process.exit(1));
    """
    run('exec', name, 'node', '-e', script)
    run('restart', name)
    ready()
    run('exec', name, 'node', '-e',
        "if(require('fs').readFileSync('/data/sessions/persistence-check','utf8')!=='retained')process.exit(1)")
    # The dashboard can be anonymous without weakening API-key protection.
    run('exec', name, 'node', '-e',
        "const fs=require('fs');const p='/data/options.json';const o=JSON.parse(fs.readFileSync(p));"
        "Object.assign(o,{dashboard_auth_enabled:false,dashboard_username:'',dashboard_password:''});"
        "fs.writeFileSync(p,JSON.stringify(o));")
    run('restart', name)
    ready()
    run('exec', name, 'node', '-e', r"""
      const assert=require('node:assert/strict');
      (async()=>{
        const root='http://127.0.0.1:3000';
        assert.equal((await fetch(root+'/dashboard/')).status,200);
        assert.equal((await fetch(root+'/api/sessions')).status,401);
      })().catch(()=>process.exit(1));
    """)
    logs = run('logs', name)
    assert 'Generated credentials' not in logs.stdout + logs.stderr
    assert 'Tini is not running as PID 1' not in logs.stderr
    logs = run('logs', name)
    for secret in (options['api_key'], options['dashboard_password']):
        assert secret not in logs.stdout + logs.stderr
    assert "Tini is not running as PID 1" not in logs.stderr
    # Recreate rather than just restart: Supervisor updates keep the same /data.
    run('rm', '-f', name)
    run('run', '-d', '--init', '--name', name, '-v', volume + ':/data', image)
    ready()
    run('exec', name, 'node', '-e',
        "if(require('fs').readFileSync('/data/sessions/persistence-check','utf8')!=='retained')process.exit(1)")
    run('rm', '-f', name)
    run('run', '--rm', '-v', volume + ':/data', '--entrypoint', 'node', image, '-e',
        "require('fs').writeFileSync('/data/options.json','{}')")
    bad = run('run', '--rm', '--init', '-v', volume + ':/data', image, check=False)
    assert bad.returncode == 1
    assert '[api_key_invalid]' in bad.stderr
    assert "Tini is not running as PID 1" not in bad.stderr
    print('WAHA app: API key protected with and without dashboard authentication, nested init, persistence and safe diagnostics: OK')
finally:
    run('rm', '-f', name, check=False)
    run('volume', 'rm', volume, check=False)
