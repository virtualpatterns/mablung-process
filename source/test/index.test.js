import Test from 'ava'

Test('index.js', async (test) => {
  test.true(await import('../index.js').then((module) => module.OK))
})
