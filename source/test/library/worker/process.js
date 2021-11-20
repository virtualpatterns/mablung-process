import '@virtualpatterns/mablung-source-map-support/install'

import { Process } from '@virtualpatterns/mablung-process'
import { WorkerServer } from '@virtualpatterns/mablung-worker'

class Worker extends Process {}

WorkerServer.start(Worker)
