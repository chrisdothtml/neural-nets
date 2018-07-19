const csvtojson = require('csvtojson')
const { iife } = require('../../utils.js')

function getData (filepaths) {
  return Promise.all(
    filepaths.map(filepath => csvtojson().fromFile(filepath))
  )
    .then(datasets => {
      return datasets.reduce((result, dataset) => {
        return result.concat(dataset)
      }, [])
    })
}

iife(async () => {
  const wines = await getData([
    './data/winequality-red.csv',
    './data/winequality-white.csv'
  ])

  console.log(wines.length)
})
