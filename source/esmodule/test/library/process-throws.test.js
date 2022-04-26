import { CreateRandomId, LoggedWorkerClient } from '@virtualpatterns/mablung-worker/test'
import { Path } from '@virtualpatterns/mablung-path'
import FileSystem from 'fs-extra'
import Test from 'ava'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

const DataPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js/, '')
const WorkerPath = Path.resolve(FolderPath, './worker/process-throws.js')

Test.before(async () => {
  await FileSystem.remove(DataPath)
  return FileSystem.ensureDir(DataPath)
})

Test.beforeEach(async (test) => {

  let id = await CreateRandomId()
  let logPath = Path.resolve(DataPath, `${id}.log`)
  let pidPath = Path.resolve(DataPath, `${id}.pid`)

  test.context.logPath = logPath
  test.context.pidPath = pidPath

})

Test('createPidFile(\'...\') throws Error', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    await test.throwsAsync(client.worker.createPidFileThrowsError(test.context.pidPath), { 'message': 'createPidFileThrowsError' })
  } finally {
    await client.exit()
  }

})

// Test('onExit() throws Error', async (test) => {

//   let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

//   await client.whenReady()

//   try {
//     await client.worker.createPidFile(test.context.pidPath)
//     await test.throwsAsync(client.worker.onExitThrowsError(), { 'message': 'onExitThrowsError' })
//   } finally {
//     await client.exit()
//   }

// })
