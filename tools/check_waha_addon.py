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
    run('run', '-d', '--name', name, '-v', volume + ':/data', image)
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
    logs = run('logs', name)
    for secret in (options['api_key'], options['dashboard_password']):
        assert secret not in logs.stdout + logs.stderr
    # Recreate rather than just restart: Supervisor updates keep the same /data.
    run('rm', '-f', name)
    run('run', '-d', '--name', name, '-v', volume + ':/data', image)
    ready()
    run('exec', name, 'node', '-e',
        "if(require('fs').readFileSync('/data/sessions/persistence-check','utf8')!=='retained')process.exit(1)")
    run('rm', '-f', name)
    run('run', '--rm', '-v', volume + ':/data', '--entrypoint', 'node', image, '-e',
        "require('fs').writeFileSync('/data/options.json','{}')")
    bad = run('run', '--rm', '-v', volume + ':/data', image, check=False)
    assert bad.returncode == 1
    assert 'Set API key' in bad.stderr
    print('WAHA app: authenticated API/dashboard, unpaired health, restart/recreate persistence, missing-secret refusal: OK')
finally:
    run('rm', '-f', name, check=False)
    run('volume', 'rm', volume, check=False)
