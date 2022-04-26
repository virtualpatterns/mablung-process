import { Process } from '@virtualpatterns/mablung-process'
import { WorkerServer } from '@virtualpatterns/mablung-worker'
import Sinon from 'sinon'
import SourceMapSupport from 'source-map-support'

SourceMapSupport.install({ 'handleUncaughtExceptions': false })

class Worker extends Process {

  static createPidFileThrowsError(...argument) {

    let onceStub = Sinon
      .stub(this, 'once')
      .throws(new Error('createPidFileThrowsError'))

    try {
      return super.createPidFile(...argument)
    } finally {
      onceStub.restore()
    }

  }

  // static createPidFileThrowsErrorOnExit(...argument) {

  //   let deletePidFileStub = Sinon
  //     .stub(this, 'deletePidFile')
  //     .throws(new Error('deletePidFileThrowsError'))

  //   try {
  //     return super.createPidFile(...argument)
  //   } finally {
  //     deletePidFileStub.restore()
  //   }

  // //   // return new Promise((resolve, reject) => {

  // //   //   let onExitStub = Sinon
  // //   //     .stub(this, 'onExit')
  // //   //     .throws(new Error('onExitThrowsError'))

  // //   //   try {

  // //   //     let errorStub = Sinon
  // //   //       .stub(console, 'error')
  // //   //       .callsFake(function (...argument) {
  // //   //         reject(...argument)
  // //   //       })

  // //   //     try {
  // //   //       this.onExitHandler(0)
  // //   //     } finally {
  // //   //       errorStub.restore()
  // //   //     }

  // //   //   } finally {
  // //   //     onExitStub.restore()
  // //   //   }

  // //   // })

  // //   let deletePidFileStub = Sinon
  // //     .stub(this, 'deletePidFile')
  // //     .throws(new Error('deletePidFileThrowsError'))

  // //   try {
  // //     return super.createPidFile(...argument)
  // //   } finally {
  // //     deletePidFileStub.restore()
  // //   }


  // }

}

WorkerServer.start(Worker)
