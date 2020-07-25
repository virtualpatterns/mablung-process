import { createRequire as _createRequire } from "module";
import FileSystem from 'fs-extra';
import Test from 'ava';
import { WorkerClient } from '@virtualpatterns/mablung-worker'; // import { LoggedClient } from '@virtualpatterns/mablung-worker/logged-client.js'

import { Process, PidFileNotExistsProcessError } from '../../index.js';

const Require = _createRequire(import.meta.url);

Test.before(test => {
  test.context.basePath = 'process/pid/kill-pid-file';
});
Test('Process.killPidFile(path) when path exists and is valid', async test => {
  let worker = new WorkerClient(Require.resolve('./worker.js'));
  let path = `${test.context.basePath}/exists-valid.pid`;
  await worker.module.createPidFile(path);
  Process.killPidFile(path);
  let maximumDuration = 2000;
  let pollInterval = maximumDuration / 8;
  await test.notThrowsAsync(Process.when(maximumDuration, pollInterval, () => !Process.existsPidFile(path)));
});
Test('Process.killPidFile(path) when path does not exist', test => {
  let path = `${test.context.basePath}/not-exists.pid`;
  return test.throws(Process.killPidFile.bind(Process, path), {
    'instanceOf': PidFileNotExistsProcessError
  });
});
Test('Process.killPidFile(path) when path exists and is invalid', async test => {
  let path = `${test.context.basePath}/exists-invalid.pid`;
  await FileSystem.ensureDir(test.context.basePath);
  await FileSystem.writeFile(path, '100000', {
    'encoding': 'utf-8'
  });
  await test.throws(Process.killPidFile.bind(Process, path), {
    'instanceOf': PidFileNotExistsProcessError
  });
  test.false(Process.existsPidFile(path));
});
//# sourceMappingURL=process-kill-pid-file.test.js.map