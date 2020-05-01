import { createRequire as _createRequire } from "module";
import FileSystem from 'fs-extra';
import Test from 'ava';
import { WorkerClient } from '@virtualpatterns/mablung-worker';
import { Process, ProcessArgumentError } from '../../index.js';

const Require = _createRequire(import.meta.url);

Test.before(async test => {
  test.context.basePath = 'process/pid/delete-pid-file';
  await FileSystem.ensureDir(test.context.basePath);
});
Test.serial('Process.deletePidFile() when called after Process.createPidFile(path)', async test => {
  let path = `${test.context.basePath}/after.pid`;
  Process.createPidFile(path);
  Process.deletePidFile();
  await test.throwsAsync(FileSystem.access.bind(FileSystem, path, FileSystem.F_OK), {
    'code': 'ENOENT'
  });
});
Test.serial('Process.deletePidFile() when called before another createPidFile', async test => {
  let path = `${test.context.basePath}/before.pid`;
  Process.createPidFile(path);
  Process.deletePidFile();
  Process.createPidFile(path);

  try {
    await test.notThrowsAsync(FileSystem.access.bind(FileSystem, path, FileSystem.F_OK));
  } finally {
    Process.deletePidFile();
  }
});
Test.serial('Process.deletePidFile() when called twice', test => {
  let path = `${test.context.basePath}/twice.pid`;
  Process.createPidFile(path);
  Process.deletePidFile();
  test.throws(Process.deletePidFile.bind(Process), {
    'instanceOf': ProcessArgumentError
  });
});
Test.serial('Process.deletePidFile() when using a worker', async test => {
  let path = `${test.context.basePath}/worker.pid`;
  let worker = new WorkerClient();

  try {
    await worker.import(Require.resolve('./worker.js'));
    await worker.createPidFile(path);
    await worker.deletePidFile();
    await test.throwsAsync(FileSystem.access.bind(FileSystem, path, FileSystem.F_OK), {
      'code': 'ENOENT'
    });
  } finally {
    await worker.end();
  }
});
//# sourceMappingURL=process.delete-pid-file.test.js.map