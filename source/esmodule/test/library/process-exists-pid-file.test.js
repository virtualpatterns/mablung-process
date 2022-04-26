import { CreateRandomId, LoggedWorkerClient } from '@virtualpatterns/mablung-worker/test'
import { Path } from '@virtualpatterns/mablung-path'
import FileSystem from 'fs-extra'
import Test from 'ava'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

const DataPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js/, '')
const WorkerPath = Path.resolve(FolderPath, './worker/process.js')

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

Test('existsPidFile(\'...\') when \'...\' does not exist', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {
    test.false(await client.worker.existsPidFile(test.context.pidPath))
  } finally {
    await client.exit()
  }

})

Test('existsPidFile(\'...\') when \'...\' exists and is valid', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {

    await FileSystem.writeFile(test.context.pidPath, client.pid.toString(), { 'encoding': 'utf-8' })

    try {
      test.true(await client.worker.existsPidFile(test.context.pidPath))
    } finally {
      await FileSystem.remove(test.context.pidPath)
    }

  } finally {
    await client.exit()
  }

})

Test('existsPidFile(\'...\') when \'...\' exists and is invalid', async (test) => {

  let client = new LoggedWorkerClient(test.context.logPath, WorkerPath)

  await client.whenReady()

  try {

    await FileSystem.writeFile(test.context.pidPath, '100000', { 'encoding': 'utf-8' })

    test.false(await client.worker.existsPidFile(test.context.pidPath))
    test.false(await FileSystem.pathExists(test.context.pidPath))

  } finally {
    await client.exit()
  }

})
