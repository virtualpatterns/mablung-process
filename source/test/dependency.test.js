import { Check } from '@virtualpatterns/mablung-check-dependency'
import { Is } from '@virtualpatterns/mablung-is'
import Test from 'ava'

const Process = process

Test('default', async (test) => {

  let dependency = await Check()

  // test.log(dependency)
  test.deepEqual(dependency.missing, {})
  test.deepEqual(dependency.unused, [])

})
