import { Path } from '@virtualpatterns/mablung-path'
import FileSystem from 'fs-extra'

import { ProcessDurationExceededError } from './error/process-duration-exceeded-error.js'
import { ProcessPidFileExistsError } from './error/process-pid-file-exists-error.js'
import { ProcessPidFileNotExistsError } from './error/process-pid-file-not-exists-error.js'

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
                  reject(new ProcessDurationExceededError(duration, maximumDuration))
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
              reject(new ProcessDurationExceededError(duration, maximumDuration))
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
  
  static createPidFile(path, handleExit = true) {

    if (this.existsPidFile(path)) {
      throw new ProcessPidFileExistsError(path)
    } else {
  
      FileSystem.ensureDirSync(Path.dirname(path))
      FileSystem.writeFileSync(path, this.pid.toString(), { 'encoding': 'utf-8' })

      try {

        if (handleExit) {

          this.once('exit', () => {
            
            try {
              this.deletePidFile(path)
            } catch (error) {
              console.error(error)
            }
      
          })
      
        }
    
      } catch (error) {
        FileSystem.removeSync(path)
        throw error
      }

    }
  
  }

  static deletePidFile(path) {
  
    if (this.existsPidFile(path)) {
      FileSystem.removeSync(path)
    }
    else {
      throw new ProcessPidFileNotExistsError(path)
    }
  
  }

  static signalPidFile(path, signal) {

    if (this.existsPidFile(path)) {
      this.kill(FileSystem.readFileSync(path, { 'encoding': 'utf-8' }), signal)
    } else {
      throw new ProcessPidFileNotExistsError(path)
    }
  
  }
  
  static killPidFile(path, killSignal = 'SIGINT') {
    return this.signalPidFile(path, killSignal)
  }

}

Object.setPrototypeOf(Process, process)

export { Process }
