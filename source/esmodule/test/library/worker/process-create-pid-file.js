import { Process } from '@virtualpatterns/mablung-process'
import { WorkerServer } from '@virtualpatterns/mablung-worker'
import SourceMapSupport from 'source-map-support'

SourceMapSupport.install({ 'handleUncaughtExceptions': false })

class Worker extends Process {

  static throwUncaughtException() {
    setImmediate(() => { throw new Error('throwUncaughtException') })
  }

}

WorkerServer.start(Worker)
