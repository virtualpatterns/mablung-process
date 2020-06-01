import { ProcessError } from './process-error.js'

class ProcessArgumentError extends ProcessError {

  constructor(...parameter) {
    super(...parameter)
  }

}

export { ProcessArgumentError }
