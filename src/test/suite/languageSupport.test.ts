import { strict as assert } from 'assert';
import { isSupportedLanguageId, SUPPORTED_LANGUAGE_IDS } from '../../languageSupport';

suite('Language support', () => {
  test('contains expected language ids', () => {
    const expected = ['markdown', 'plaintext', 'restructuredtext', 'asciidoc', 'latex', 'org'];
    assert.deepEqual([...SUPPORTED_LANGUAGE_IDS], expected);
  });

  test('detects support correctly', () => {
    assert.equal(isSupportedLanguageId('markdown'), true);
    assert.equal(isSupportedLanguageId('plaintext'), true);
    assert.equal(isSupportedLanguageId('python'), false);
  });
});
