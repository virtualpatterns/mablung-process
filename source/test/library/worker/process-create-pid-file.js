import '@virtualpatterns/mablung-source-map-support/install'
import { WorkerServer } from '@virtualpatterns/mablung-worker'

import { Process } from '../../../index.js'

class Worker extends Process {

  static throwUncaughtException() {
    setImmediate(() => { throw new Error('throwUncaughtException') })
  }

}

WorkerServer.start(Worker)
