import { ProcessError } from './process-error.js'

class ProcessOptionNotSupportedError extends ProcessError {

  constructor(name) {
    super(`The option '${name}' is not supported on this platform.`)
  }

}

export { ProcessOptionNotSupportedError }
