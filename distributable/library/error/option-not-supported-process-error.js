import { ProcessError } from './process-error.js';

class OptionNotSupportedProcessError extends ProcessError {
  constructor(name) {
    super(`The option '${name}' is not supported on this platform.`);
  }

}

export { OptionNotSupportedProcessError };
//# sourceMappingURL=option-not-supported-process-error.js.map