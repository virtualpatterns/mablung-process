import { CreateRandomId, LoggedWorkerClient } from '@virtualpatterns/mablung-worker/test'
import { Path } from '@virtualpatterns/mablung-path'
import FileSystem from 'fs-extra'
import Test from 'ava'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

const DataPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js/, '')
const WorkerPath = Path.resolve(FolderPath, './worker/process.js')

Test.before(() => {
  return FileSystem.emptyDir(DataPath)
})

Test.beforeEach(async (test) => {

  let id = await CreateRandomId()
  let logPath = Path.resolve(DataPath, `${id}.log`)
  let pidPath = Path.resolve(DataPath, `${id}.pid`)

  test.context.logPath = logPath
  test.context.pidPath = pidPath

})

Test('deletePidFile(\'...\') when \'...\' exists', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {

    await client.worker.createPidFile(test.context.pidPath)
    await client.worker.deletePidFile(test.context.pidPath)

    test.false(await FileSystem.pathExists(test.context.pidPath))

  } finally {
    await client.exit()
  }

})

Test('deletePidFile(\'...\') when \'...\' not exists', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await test.throwsAsync(client.worker.deletePidFile(test.context.pidPath), { 'message': `The pid file '${Path.trim(test.context.pidPath)}' does not exist.` })
  } finally {
    await client.exit()
  }

})
