class ProcessArgumentError extends Error {

  constructor(...parameter) {
    super(...parameter)
  }

}

export { ProcessArgumentError }
