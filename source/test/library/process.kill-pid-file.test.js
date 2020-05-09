import FileSystem from 'fs-extra'
import Test from 'ava'
import { WorkerClient } from '@virtualpatterns/mablung-worker'

import { Process, ProcessArgumentError } from '../../index.js'

const Require = __require

Test.before(async (test) => {
  test.context.basePath = 'process/pid/kill-pid-file'
  await FileSystem.ensureDir(test.context.basePath)
})

Test('Process.killPidFile(path) when path exists and is valid', async (test) => {

  let worker = new WorkerClient
  let path = `${test.context.basePath}/exists-valid.pid`

  await worker.import(Require.resolve('./worker.js'))
  await worker.module.createPidFile(path)

  Process.killPidFile(path)

  let maximumDuration = 2000
  let pollInterval = maximumDuration / 8

  await test.notThrowsAsync(Process.when(maximumDuration, pollInterval, () => !Process.existsPidFile(path)))

})

Test('Process.killPidFile(path) when path does not exist', (test) => {
  let path = `${test.context.basePath}/not-exists.pid`
  return test.throws(Process.killPidFile.bind(Process, path), { 'instanceOf': ProcessArgumentError })
})

Test('Process.killPidFile(path) when path exists and is invalid', async (test) => {

  let path = `${test.context.basePath}/exists-invalid.pid`
  await FileSystem.writeFile(path, '100000', { 'encoding': 'utf-8' })

  await test.throws(Process.killPidFile.bind(Process, path), { 'instanceOf': ProcessArgumentError })
  test.false(Process.existsPidFile(path))

})
