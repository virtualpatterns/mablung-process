import { Process } from '@virtualpatterns/mablung-process'
import Test from 'ava'

Test('wait(...)', async (test) => {

  let begin = Process.hrtime.bigint()
  await Process.wait(500)
  let end = Process.hrtime.bigint()
  let duration = parseInt((end - begin) / BigInt(1e6))

  test.log(`${duration}ms`)
  test.assert(duration >= 500)

})
