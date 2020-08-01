import Test from 'ava';

import { Process } from '../../index.js';

Test('Process.wait(duration)', async test => {

  let duration = 1000;

  let before = new Date();
  await Process.wait(duration);
  let after = new Date();

  test.assert(after - before >= duration);

});
//# sourceMappingURL=process.test.js.map