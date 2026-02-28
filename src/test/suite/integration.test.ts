import { strict as assert } from 'assert';
import * as vscode from 'vscode';

suite('Extension integration', () => {
  test('commands are registered', async () => {
    const commands = await vscode.commands.getCommands(true);

    const expected = [
      'readLoud.start',
      'readLoud.startFromCursor',
      'readLoud.startSelection',
      'readLoud.startSelectionToEnd',
      'readLoud.pause',
      'readLoud.resume',
      'readLoud.stop',
      'readLoud.nextSentence',
      'readLoud.previousSentence'
    ];

    for (const command of expected) {
      assert.ok(commands.includes(command), `Missing command: ${command}`);
    }
  });

  test('start command does not throw without active supported editor', async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await vscode.commands.executeCommand('readLoud.start');
    assert.ok(true);
  });
});
