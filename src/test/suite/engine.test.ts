import { strict as assert } from 'assert';
import { EngineSpeakOptions } from '../../types';
import { EspeakAdapter } from '../../tts/espeakAdapter';
import { SpeechDispatcherAdapter } from '../../tts/speechDispatcherAdapter';

class TestEspeakAdapter extends EspeakAdapter {
  public args(text: string, options: EngineSpeakOptions): string[] {
    return this.buildArgs(text, options);
  }
}

class TestSpdAdapter extends SpeechDispatcherAdapter {
  public args(text: string, options: EngineSpeakOptions): string[] {
    return this.buildArgs(text, options);
  }
}

suite('Engine adapters', () => {
  test('builds espeak-ng args from normalized config', () => {
    const adapter = new TestEspeakAdapter();
    const options: EngineSpeakOptions = {
      voice: 'en-us',
      rate: 50,
      pitch: 50,
      volume: 100,
      signal: new AbortController().signal
    };

    const args = adapter.args('Hello world', options);
    assert.deepEqual(args, ['-s', '230', '-p', '50', '-a', '200', '-v', 'en-us', 'Hello world']);
  });

  test('builds speech-dispatcher args from normalized config', () => {
    const adapter = new TestSpdAdapter();
    const options: EngineSpeakOptions = {
      voice: 'en',
      rate: 75,
      pitch: 50,
      volume: 100,
      signal: new AbortController().signal
    };

    const args = adapter.args('Hello world', options);
    assert.deepEqual(args, ['-w', '-r', '50', '-p', '0', '-i', '100', '-y', 'en', 'Hello world']);
  });
});
