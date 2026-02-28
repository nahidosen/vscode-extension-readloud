import { strict as assert } from 'assert';
import { estimateSentenceDurationMs, estimateWordDurations } from '../../timing';

suite('Timing estimator', () => {
  test('computes deterministic sentence duration', () => {
    const text = 'one two three four';
    const duration = estimateSentenceDurationMs(text, 120);
    assert.equal(duration, 2000);
  });

  test('word durations sum to sentence duration', () => {
    const words = [
      { text: 'one', range: {} as never },
      { text: 'two', range: {} as never },
      { text: 'three', range: {} as never }
    ];

    const durations = estimateWordDurations(words, 1200);
    const total = durations.reduce((acc, value) => acc + value, 0);

    assert.equal(total, 1200);
    assert.equal(durations.length, words.length);
    assert.ok(durations.every((value) => value >= 60));
  });
});
