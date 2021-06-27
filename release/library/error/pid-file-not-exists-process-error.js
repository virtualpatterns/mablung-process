import Path from 'path';

import { ProcessError } from './process-error.js';

class PidFileNotExistsProcessError extends ProcessError {

  constructor(path) {
    super(path ? `The pid file '${Path.relative('', path)}' does not exist.` : 'A pid file does not exist.');
  }}



export { PidFileNotExistsProcessError };

//# sourceMappingURL=pid-file-not-exists-process-error.js.map