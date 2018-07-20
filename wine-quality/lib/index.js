require('@tensorflow/tfjs-node')

const csvtojson = require('csvtojson')
const fs = require('pfs')
const tf = require('@tensorflow/tfjs')
const { iife } = require('../../utils.js')

async function getData (filepaths) {
  const csvOpts = { checkType: true, delimiter: ';' }
  const wines = await Promise.all(
    filepaths.map(filepath => csvtojson(csvOpts).fromFile(filepath))
  )
    .then(datasets => {
      // combine all arrays of data
      return datasets.reduce((result, dataset) => {
        return result.concat(dataset)
      }, [])
    })

  return {
    // removes output property and converts to array of values
    inputs: wines.map(item => {
      let result = { ...item }
      delete result.quality
      return Object.values(result)
    }),
    // converts to array of values of output property
    outputs: wines.map(item => item.quality)
  }
}

function createModel (data) {
  const model = tf.sequential()

  // hidden layer
  model.add(tf.layers.dense({
    activation: 'sigmoid',
    inputDim: Object.keys(data.inputs[0]).length,
    units: 32
  }))

  // output layer
  model.add(tf.layers.dense({
    activation: 'linear',
    units: 1
  }))

  model.compile({
    loss: 'meanSquaredError',
    optimizer: tf.train.sgd(0.2)
  })

  return model
}

iife(async () => {
  const data = await getData([
    './data/winequality-red.csv',
    './data/winequality-white.csv'
  ])
  const model = createModel(data)
  const results = await model.fit(
    tf.tensor2d(data.inputs),
    tf.tensor1d(data.outputs),
    {
      epochs: 10,
      validationSplit: 0.2
    }
  )

  console.log(results)
})
