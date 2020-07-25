import FileSystem from 'fs-extra'
import { Is } from '@virtualpatterns/mablung-is'
import Path from 'path'

import { DurationExceededProcessError } from './error/duration-exceeded-process-error.js'
import { OptionNotSupportedProcessError } from './error/option-not-supported-process-error.js'
import { PidFileExistsProcessError } from './error/pid-file-exists-process-error.js'
import { PidFileNotExistsProcessError } from './error/pid-file-not-exists-process-error.js'

// * ensureDir on create, remove from TextDecoderStream

const BaseProcess = process

class Process {

  static wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration)
    })
  }

  static when(maximumDuration, pollInterval, pollFn) {

    return new Promise((resolve, reject) => {
  
      let waitLoop = function (start) {
  
        let duration = new Date() - start
        let value = null
        
        try {
  
          value = pollFn()
  
          if (value instanceof Promise) {
  
            value
              .then((value) => {
    
                if (!value && duration < maximumDuration) {
                  setTimeout(() => waitLoop(start), pollInterval)
                } else if (!value && duration >= maximumDuration) {
                  reject(new DurationExceededProcessError(duration, maximumDuration))
                } else {
                  resolve(value)
                }
    
              })
              .catch((error) => {
    
                if (duration < maximumDuration) {
                  setTimeout(() => waitLoop(start), pollInterval)
                } else if (duration >= maximumDuration) {
                  reject(error)
                }
    
              })
    
          } else {
    
            if (!value && duration < maximumDuration) {
              setTimeout(() => waitLoop(start), pollInterval)
            } else if (!value && duration >= maximumDuration) {
              reject(new DurationExceededProcessError(duration, maximumDuration))
            } else {
              resolve(value)
            }
    
          }
    
        } catch (error) {
  
          if (duration < maximumDuration) {
            setTimeout(() => waitLoop(start), pollInterval)
          } else if (duration >= maximumDuration) {
            reject(error)
          }
  
        }
  
      }
  
      waitLoop(new Date())
  
    })
  
  }
    
  static existsPidFile(path) {

    if (FileSystem.pathExistsSync(path)) {

      try {
        this.kill(FileSystem.readFileSync(path, { 'encoding': 'utf-8' }), 0)
        return true
      } catch (error) {
        FileSystem.removeSync(path)
        return false
      }

    } else {
      return false
    }
  
  }
  
  static createPidFile(path, { handleExit = true, handleKillSignal = Is.windows() ? false : [ 'SIGINT', 'SIGTERM' ] } = {}) {

    if (this._pidPath) {
      throw new PidFileExistsProcessError(this._pidPath)
    } else if (this.existsPidFile(path)) {
      throw new PidFileExistsProcessError(path)
    } else {
  
      FileSystem.ensureDirSync(Path.dirname(path))
      FileSystem.writeFileSync(path, this.pid.toString(), { 'encoding': 'utf-8' })

      try {

        this._attach({ handleExit, handleKillSignal })
    
        this._pidPath = path
        this._pidOption = { handleExit, handleKillSignal }
  
      } catch (error) {
        FileSystem.removeSync(path)
        throw error
      }

    }
  
  }

  static _attach({ handleExit, handleKillSignal }) {

    try {

      if (handleExit) {

        this.on('exit', this.__onExit = (code) => {
          // console.log(`Process.on('exit', Process.__onExit = (${code}) => { ... })`)
          
          try {
            this._onExit(code)
          /* c8 ignore next 3 */
          } catch (error) {
            console.error(error)
          }
    
        })
    
      }
  
      if (handleKillSignal) {
  
        if (Is.windows()) {
          throw new OptionNotSupportedProcessError('handleKillSignal')
        } else {
        
          handleKillSignal.forEach((signal) => {
            this.on(signal, this[`__on${signal}`] = () => {
              // console.log(`Process.on('${signal}', Process.__on${signal} = () => { ... })`)
            
              try {
                this._onSignal(signal)
              /* c8 ignore next 3 */
              } catch (error) {
                console.error(error)
              }
      
            })
          })
    
        }
    
      }

    } catch (error) {
      this._detach({ handleExit, handleKillSignal })
      throw error
    }

  }

  static _onExit(code) {
    this.deletePidFile()
  }

  static _onSignal(signal) {

    this.deletePidFile()

    let count = this.listenerCount(signal)

    /* c8 ignore next 5 */
    if (count <= 0) {
      this.exit()
    } else {
      console.log(`Process.listenerCount('${signal}') returned ${count}`)
    }

  }

  static _detach({ handleExit, handleKillSignal }) {

    if (handleKillSignal) {

      handleKillSignal.forEach((signal) => {
        if (this[`__on${signal}`]) {
          this.off(signal, this[`__on${signal}`])
          delete this[`__on${signal}`]
        }
      })
  
    }

    if (handleExit) {

      if (this.__onExit) {
        this.off('exit', this.__onExit)
        delete this.__onExit
      }
  
    }

  }

  static deletePidFile() {

    let path = this._pidPath
    let option = this._pidOption
  
    if (this.existsPidFile(path)) {
  
      FileSystem.removeSync(path)
  
      this._detach(option)

      delete Process._pidPath
      delete Process._pidOption
  
    }
    else {
      throw new PidFileNotExistsProcessError(path)
    }
  
  }

  static signalPidFile(path, signal) {

    if (this.existsPidFile(path)) {
      this.kill(FileSystem.readFileSync(path, { 'encoding': 'utf-8' }), signal)
    } else {
      throw new PidFileNotExistsProcessError(path)
    }
  
  }
  
  static killPidFile(path, killSignal = 'SIGINT') {
    return this.signalPidFile(path, killSignal)
  }
  
}

Object.setPrototypeOf(Process, BaseProcess)

export { Process }
