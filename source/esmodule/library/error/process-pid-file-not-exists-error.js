import { Path } from '@virtualpatterns/mablung-path'

import { ProcessError } from './process-error.js'

class ProcessPidFileNotExistsError extends ProcessError {

  constructor(path) {
    super(`The pid file '${Path.trim(path)}' does not exist.`)
  }

}

export { ProcessPidFileNotExistsError }
