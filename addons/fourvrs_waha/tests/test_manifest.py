from pathlib import Path
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]


class ManifestTests(unittest.TestCase):
    def test_bilingual_options_network_and_independent_version(self):
        config = yaml.safe_load((ROOT / 'config.yaml').read_text())
        self.assertEqual(config['version'], '0.2.1')
        self.assertEqual(config['arch'], ['amd64'])
        self.assertEqual(set(config['options']), set(config['schema']))
        for lang in ('en', 'ru'):
            translation = yaml.safe_load((ROOT / 'translations' / f'{lang}.yaml').read_text())
            self.assertEqual(set(translation['configuration']), set(config['options']))
            self.assertEqual(set(translation['network']), set(config['ports']))
            for field in translation['configuration'].values():
                self.assertTrue(field['name'])
                self.assertTrue(field['description'])
        self.assertNotIn('host_network', config)
        self.assertNotIn('docker_api', config)
        self.assertNotIn('privileged', config)
        self.assertNotIn('hassio_api', config)

    def test_license_attribution_and_pinned_image(self):
        license_text = (ROOT / 'licenses/WAHA-APACHE-2.0.txt').read_text()
        self.assertIn('Apache License', license_text)
        self.assertIn('Version 2.0', license_text)
        self.assertIn('devlikeapro', (ROOT / 'licenses/NOTICE.md').read_text())
        self.assertIn('@sha256:', (ROOT / 'Dockerfile').read_text())


if __name__ == '__main__':
    unittest.main()
