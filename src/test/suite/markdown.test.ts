import { strict as assert } from 'assert';
import { extractVisibleProseLines, extractWordSpans, sentenceSpans } from '../../markdownCore';

suite('Markdown extraction', () => {
  test('skips frontmatter, code fences, and tables', () => {
    const source = [
      '---',
      'title: Demo',
      '---',
      '',
      '# Heading',
      '',
      '```ts',
      'const x = 1;',
      '```',
      '',
      '| h1 | h2 |',
      '|---|---|',
      '| a | b |',
      '',
      '- list item one.',
      'Normal prose line.'
    ].join('\n');

    const lines = extractVisibleProseLines(source);
    assert.equal(lines.length, 3);
    assert.equal(lines[0].text, 'Heading');
    assert.equal(lines[1].text, 'list item one.');
    assert.equal(lines[2].text, 'Normal prose line.');
  });

  test('segments sentences and words', () => {
    const text = 'Hello world. This is a test!';
    const spans = sentenceSpans(text);
    assert.equal(spans.length, 2);

    const firstSentence = text.slice(spans[0].start, spans[0].end);
    const words = extractWordSpans(firstSentence);
    assert.deepEqual(words.map((w) => w.text), ['Hello', 'world']);
  });
});
