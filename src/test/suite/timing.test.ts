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

  test('enforces per-word minimum duration when target sentence duration is too low', () => {
    const words = [
      { text: 'a', range: {} as never },
      { text: 'b', range: {} as never },
      { text: 'c', range: {} as never },
      { text: 'd', range: {} as never },
      { text: 'e', range: {} as never },
      { text: 'f', range: {} as never }
    ];

    const durations = estimateWordDurations(words, 100);
    const total = durations.reduce((acc, value) => acc + value, 0);

    assert.equal(total, 360);
    assert.ok(durations.every((value) => value >= 60));
  });
});
