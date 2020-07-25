// import Path from 'path'
// // import Source from 'source-map-support'

// import { Process } from '../index'

// // Source.install({ 'handleUncaughtExceptions': true })

// ;(async () => {

//   try {

//     let _onSIGINT = null
//     let path = Path.join('resource', 'Process', 'process.pid')
//     let timeout = 180000

//     Process.on('SIGINT', _onSIGINT = () => {
//       console.log('Process.on(\'SIGINT\', _onSIGINT = () => { ... })')

//       Process.off('SIGINT', _onSIGINT)
//       _onSIGINT = null

//       let count = Process.listenerCount('SIGINT')

//       if (count <= 0) {
//         console.log('Process.exit()')
//         Process.exit()
//       } else {
//         console.log(`Process.listenerCount('SIGINT') returns ${count}`)
//       }

//     })

//     Process.createPidFile(path)
    
//     console.log(`Waiting ${timeout}ms ...`)
//     Process.wait(timeout)

//   } catch (error) {
//     console.error(error)
//   }

// })()
