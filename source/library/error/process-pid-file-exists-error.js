import Path from 'path'

import { ProcessError } from './process-error.js'

class ProcessPidFileExistsError extends ProcessError {

  constructor(path) {
    super(ProcessPidFileExistsError.message(path))
  }

  static message(path) {
    return `The pid file '${Path.relative('', path)}' exists.`
  }
  
}

export { ProcessPidFileExistsError }
