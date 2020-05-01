import { ProcessError } from './process-error.js'

class ProcessDurationExceededError extends ProcessError {

  constructor(duration, maximumDuration) {
    super(`The duration ${duration}ms exceeds the maximum duration of ${maximumDuration}ms.`)
  }

}

export { ProcessDurationExceededError }
