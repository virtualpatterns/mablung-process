import Path from 'path';
import { ProcessError } from './process-error.js';

class PidFileExistsProcessError extends ProcessError {
  constructor(path) {
    super(`The pid file '${Path.relative('', path)}' exists.`);
  }

}

export { PidFileExistsProcessError };
//# sourceMappingURL=pid-file-exists-process-error.js.map