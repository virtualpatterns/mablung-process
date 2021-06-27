import { createRequire as _createRequire } from "module";import FileSystem from 'fs-extra';
import Test from 'ava';
import { WorkerClient } from '@virtualpatterns/mablung-worker';

import { Process, PidFileNotExistsProcessError } from '../../index.js';

const Require = _createRequire(import.meta.url);

Test.before((test) => {
  test.context.basePath = 'process/pid/delete-pid-file';
});

Test.serial('Process.deletePidFile() when called after Process.createPidFile(path)', async (test) => {

  let path = `${test.context.basePath}/after.pid`;

  Process.createPidFile(path);
  Process.deletePidFile();

  test.false(await FileSystem.pathExists(path));

});

Test.serial('Process.deletePidFile() when called before another createPidFile', async (test) => {

  let path = `${test.context.basePath}/before.pid`;

  Process.createPidFile(path);
  Process.deletePidFile();
  Process.createPidFile(path);

  try {
    test.true(await FileSystem.pathExists(path));
  } finally {
    Process.deletePidFile();
  }

});

Test.serial('Process.deletePidFile() when called twice', (test) => {

  let path = `${test.context.basePath}/twice.pid`;

  Process.createPidFile(path);
  Process.deletePidFile();

  test.throws(() => Process.deletePidFile(), { 'instanceOf': PidFileNotExistsProcessError });

});

Test.serial('Process.deletePidFile() when using a worker', async (test) => {

  let path = `${test.context.basePath}/worker.pid`;
  let worker = new WorkerClient(Require.resolve('./worker.js'));

  try {

    await worker.module.createPidFile(path);
    await worker.module.deletePidFile();

    test.false(await FileSystem.pathExists(path));

  } finally {
    await worker.exit();
  }

});

//# sourceMappingURL=process-delete-pid-file.test.js.map