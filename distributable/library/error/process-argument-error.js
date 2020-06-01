import { ProcessError } from './process-error.js';

class ProcessArgumentError extends ProcessError {
  constructor(...parameter) {
    super(...parameter);
  }

}

export { ProcessArgumentError };
//# sourceMappingURL=process-argument-error.js.map