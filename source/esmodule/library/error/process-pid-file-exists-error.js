import { Path } from '@virtualpatterns/mablung-path'

import { ProcessError } from './process-error.js'

class ProcessPidFileExistsError extends ProcessError {

  constructor(path) {
    super(`The pid file '${Path.trim(path)}' exists.`)
  }
  
}

export { ProcessPidFileExistsError }
