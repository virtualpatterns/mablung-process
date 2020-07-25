import FileSystem from 'fs-extra'
import Test from 'ava'
import { WorkerClient } from '@virtualpatterns/mablung-worker'

import { Process } from '../../index.js'

const Require = __require

Test.before(async (test) => {
  test.context.basePath = 'process/pid/exists-pid-file'
  await FileSystem.ensureDir(test.context.basePath)
})

Test('Process.existsPidFile(path) when path exists and is valid', async (test) => {

  let path = `${test.context.basePath}/exists-valid.pid`

  await FileSystem.writeFile(path, process.pid.toString(), { 'encoding': 'utf-8' })

  try {
    test.true(Process.existsPidFile(path))
  } finally {
    await FileSystem.unlink(path)
  }

})

Test('Process.existsPidFile(path) when path does not exist', (test) => {
  let path = `${test.context.basePath}/not-exists.pid`
  test.false(Process.existsPidFile(path))
})

Test('Process.existsPidFile(path) when path exists and is invalid', async (test) => {

  let path = `${test.context.basePath}/exists-invalid.pid`

  await FileSystem.writeFile(path, '100000', { 'encoding': 'utf-8' })

  test.false(Process.existsPidFile(path))
  test.false(await FileSystem.pathExists(path))

})

Test('Process.existsPidFile(path) when using a worker', async (test) => {

  let path = `${test.context.basePath}/worker.pid`
  let worker = new WorkerClient(Require.resolve('./worker.js'))

  try {

    await FileSystem.writeFile(path, worker.pid.toString(), { 'encoding': 'utf-8' })

    try {
      test.true(await worker.module.existsPidFile(path))
    } finally {
      await FileSystem.unlink(path)
    }
  
  } finally {
    await worker.exit()
  }

})
