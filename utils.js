const fs = require('pfs')

// shorthand for async iife
exports.iife = callback => {
  callback().catch(e => console.error(e))
}

exports.pathExists = filepath => {
  return fs.access(filepath)
    .then(() => true)
    .catch(() => false)
}

exports.readJSON = async (filepath) => {
  const content = await fs.readFile(filepath, 'utf-8')
  return JSON.parse(content)
}

exports.writeJSON = (filepath, content, pretty = false) => {
  const json = pretty ? JSON.stringify(content, null, 2) : JSON.stringify(content)
  return fs.writeFile(filepath, json, 'utf-8')
}
