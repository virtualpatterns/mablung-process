import '@virtualpatterns/mablung-source-map-support/install'

import { Process } from '@virtualpatterns/mablung-process'
import { WorkerServer } from '@virtualpatterns/mablung-worker'

class Worker extends Process {

  static throwUncaughtException() {
    setImmediate(() => { throw new Error('throwUncaughtException') })
  }

}

WorkerServer.start(Worker)
