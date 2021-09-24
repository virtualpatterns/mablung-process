import '@virtualpatterns/mablung-source-map-support/install'

import { WorkerServer } from '@virtualpatterns/mablung-worker'
import Sinon from 'sinon'

import { Process } from '../../../index.js'

class Worker extends Process {

  static createPidFileThrowsError(...argument) {

    let attachAllHandlerStub = Sinon
      .stub(this, 'attachAllHandler')
      .throws(new Error('createPidFileThrowsError'))

    try {
      return super.createPidFile(...argument)
    } finally {
      attachAllHandlerStub.restore()
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
