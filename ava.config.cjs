module.exports = function({ path }) {
  
  return {
    'failFast': true,
    'files': [
      'release/**/test/**/*.test.*'
    ],
    'require': [
      '@virtualpatterns/mablung-source-map-support/install'
    ],
    'verbose': true
  }

}
