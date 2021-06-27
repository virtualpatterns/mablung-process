import { ProcessError } from './process-error.js';

class DurationExceededProcessError extends ProcessError {

  constructor(duration, maximumDuration) {
    super(`The duration ${duration}ms exceeds the maximum duration of ${maximumDuration}ms.`);
  }}



export { DurationExceededProcessError };

//# sourceMappingURL=duration-exceeded-process-error.js.map