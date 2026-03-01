import { strict as assert } from 'assert';
import * as vscode from 'vscode';
import { READLOUD_COMMAND_LIST, READLOUD_COMMANDS } from '../../constants';

suite('Extension integration', () => {
  test('commands are registered', async () => {
    const commands = await vscode.commands.getCommands(true);

    const expected = READLOUD_COMMAND_LIST;

    for (const command of expected) {
      assert.ok(commands.includes(command), `Missing command: ${command}`);
    }
  });

  test('start command does not throw without active supported editor', async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await vscode.commands.executeCommand(READLOUD_COMMANDS.START);
    assert.ok(true);
  });
});
