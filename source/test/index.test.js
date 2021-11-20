import Test from 'ava'

Test.before(async (test) => {
  test.context.index = await import('@virtualpatterns/mablung-process')
})

;[
  'Process',
  'ProcessDurationExceededError',
  'ProcessPidFileExistsError',
  'ProcessPidFileNotExistsError'
].forEach((name) => {

  Test(name, async (test) => {
    test.truthy(test.context.index[name])
  })
  
})
