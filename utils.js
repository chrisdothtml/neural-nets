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

exports.writeJSON = (filepath, content) => {
  return fs.writeFile(filepath, JSON.stringify(content), 'utf-8')
}
