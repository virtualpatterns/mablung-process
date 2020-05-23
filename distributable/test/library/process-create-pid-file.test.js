import { createRequire as _createRequire } from "module";
import FileSystem from 'fs-extra'; // import { LoggedClient } from '@virtualpatterns/mablung-worker/distributable/library/worker-client/logged-client.js'

import Test from 'ava';
import { WorkerClient } from '@virtualpatterns/mablung-worker';
import { Process, ProcessArgumentError } from '../../index.js';

const Require = _createRequire(import.meta.url);

Test.before(async test => {
  test.context.basePath = 'process/pid/create-pid-file';
  await FileSystem.ensureDir(test.context.basePath);
});
Test.serial('Process.createPidFile(path) when path exists and is valid', async test => {
  let path = `${test.context.basePath}/exists-valid.pid`;
  await FileSystem.writeFile(path, process.pid.toString(), {
    'encoding': 'utf-8'
  });

  try {
    test.throws(Process.createPidFile.bind(Process, path), {
      'instanceOf': ProcessArgumentError
    });
  } finally {
    await FileSystem.unlink(path);
  }
});
Test.serial('Process.createPidFile(path) when path does not exist', async test => {
  let path = `${test.context.basePath}/not-exists.pid`;
  Process.createPidFile(path);

  try {
    await test.notThrowsAsync(FileSystem.access.bind(FileSystem, path, FileSystem.F_OK));
    test.is(parseInt(await FileSystem.readFile(path, {
      'encoding': 'utf-8'
    })), process.pid);
  } finally {
    Process.deletePidFile();
  }
});
Test.serial('Process.createPidFile(path) when path exists and is invalid', async test => {
  let path = `${test.context.basePath}/exists-invalid.pid`;
  await FileSystem.writeFile(path, '100000', {
    'encoding': 'utf-8'
  });
  Process.createPidFile(path);

  try {
    await test.notThrowsAsync(FileSystem.access.bind(FileSystem, path, FileSystem.F_OK));
    test.is(parseInt(await FileSystem.readFile(path, {
      'encoding': 'utf-8'
    })), process.pid);
  } finally {
    Process.deletePidFile();
  }
});
Test.serial('Process.createPidFile(path) when called twice', test => {
  let path = `${test.context.basePath}/twice.pid`;
  Process.createPidFile(path);

  try {
    test.throws(Process.createPidFile.bind(Process, path), {
      'instanceOf': ProcessArgumentError
    });
  } finally {
    Process.deletePidFile();
  }
});
Test.serial('Process.createPidFile(path) when using a worker', async test => {
  let path = `${test.context.basePath}/worker.pid`;
  let worker = new WorkerClient(Require.resolve('./worker.js'));

  try {
    await worker.module.createPidFile(path);

    try {
      await test.notThrowsAsync(FileSystem.access.bind(FileSystem, path, FileSystem.F_OK));
      test.is(parseInt(await FileSystem.readFile(path, {
        'encoding': 'utf-8'
      })), worker.pid);
    } finally {
      await worker.module.deletePidFile();
    }
  } finally {
    await worker.exit();
  }
});
Test.serial('Process.createPidFile(path) on exit', async test => {
  let path = `${test.context.basePath}/on-exit.pid`;
  let worker = new WorkerClient(Require.resolve('./worker.js'));

  try {
    await worker.module.createPidFile(path);
  } finally {
    await worker.exit();
  }

  await test.throwsAsync(FileSystem.access.bind(FileSystem, path, FileSystem.F_OK), {
    'code': 'ENOENT'
  });
});
Test.serial('Process.createPidFile(path) on uncaught exception', async test => {
  let path = `${test.context.basePath}/on-uncaught-exception.pid`;
  let worker = new WorkerClient(Require.resolve('./worker.js'));
  await worker.module.createPidFile(path);
  await worker.module.throwUncaughtException();
  let maximumDuration = 2000;
  let pollInterval = maximumDuration / 8;
  await test.notThrowsAsync(Process.when(maximumDuration, pollInterval, () => !Process.existsPidFile(path)));
});
//# sourceMappingURL=process-create-pid-file.test.js.map