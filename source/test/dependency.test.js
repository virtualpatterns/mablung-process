import { Check } from '@virtualpatterns/mablung-check-dependency'
import { Is } from '@virtualpatterns/mablung-is'
import Test from 'ava'

const Process = process

Test('dependency', async (test) => {

  let dependency = await Check(Process.cwd())

  // test.log(dependency)
  test.true(Is.emptyObject(dependency.missing))
  test.deepEqual(dependency.unused, [])

})
