import '@virtualpatterns/mablung-source-map-support/install'

import { Process } from '@virtualpatterns/mablung-process'
import { WorkerServer } from '@virtualpatterns/mablung-worker'
import Sinon from 'sinon'

class Worker extends Process {

  static createPidFileThrowsError(...argument) {

    let attachStub = Sinon
      .stub(this, 'attach')
      .throws(new Error('createPidFileThrowsError'))

    try {
      return super.createPidFile(...argument)
    } finally {
      attachStub.restore()
    }

  }

  static onExitThrowsError() {

    return new Promise((resolve, reject) => {

      let onExitStub = Sinon
        .stub(this, 'onExit')
        .throws(new Error('onExitThrowsError'))

      try {

        let errorStub = Sinon
          .stub(console, 'error')
          .callsFake(function (...argument) {
            reject(...argument)
          })

        try {
          this.onExitHandler(0)
        } finally {
          errorStub.restore()
        }

      } finally {
        onExitStub.restore()
      }

    })

  }

}

WorkerServer.start(Worker)
