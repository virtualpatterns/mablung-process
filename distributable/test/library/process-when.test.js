import Test from 'ava';
import { Process, ProcessDurationExceededError } from '../../index.js';
Test.before(test => {
  test.context.maximumDuration = 1000;
  test.context.pollInterval = test.context.maximumDuration / 4;
});
Test('Process.when(maximumDuration, pollInterval, pollFn) when a synchronous pollFn returns true', async test => {
  test.truthy(await Process.when(test.context.maximumDuration, test.context.pollInterval, () => true));
});
Test('Process.when(maximumDuration, pollInterval, pollFn) when an asynchronous pollFn returns true', async test => {
  test.truthy(await Process.when(test.context.maximumDuration, test.context.pollInterval, () => {
    return Promise.resolve(true);
  }));
});
Test('Process.when(maximumDuration, pollInterval, pollFn) when a synchronous pollFn returns false', async test => {
  await test.throwsAsync(Process.when(test.context.maximumDuration, test.context.pollInterval, () => false), {
    'instanceOf': ProcessDurationExceededError
  });
});
Test('Process.when(maximumDuration, pollInterval, pollFn) when a synchronous pollFn fails', async test => {
  await test.throwsAsync(Process.when(test.context.maximumDuration, test.context.pollInterval, () => {
    throw Error();
  }), {
    'instanceOf': Error
  });
});
Test('Process.when(maximumDuration, pollInterval, pollFn) when an asynchronous pollFn returns false', async test => {
  await test.throwsAsync(Process.when(test.context.maximumDuration, test.context.pollInterval, () => {
    return Promise.resolve(false);
  }), {
    'instanceOf': ProcessDurationExceededError
  });
});
Test('Process.when(maximumDuration, pollInterval, pollFn) when an asynchronous pollFn fails', async test => {
  await test.throwsAsync(Process.when(test.context.maximumDuration, test.context.pollInterval, () => {
    return new Promise(() => {
      throw Error();
    });
  }), {
    'instanceOf': Error
  });
});
//# sourceMappingURL=process-when.test.js.map