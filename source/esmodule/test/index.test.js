import Test from 'ava'

;[
  'Process',
  'ProcessDurationExceededError',
  'ProcessPidFileExistsError',
  'ProcessPidFileNotExistsError'
].forEach((name) => {

  Test(name, async (test) => {
    test.truthy(await import('@virtualpatterns/mablung-process').then((module) => module[name]))
  })
  
})
