require('@tensorflow/tfjs-node')

const csvtojson = require('csvtojson')
const fs = require('pfs')
const path = require('path')
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
  const modelPath = 'file://lib/model'
  let model

  try {
    model = await tf.loadModel(modelPath)
  } catch (e) {
    const data = await getData([
      './data/winequality-red.csv',
      './data/winequality-white.csv'
    ])

    model = createModel(data)

    await model.fit(
      tf.tensor2d(data.inputs),
      tf.tensor1d(data.outputs),
      {
        epochs: 10,
        validationSplit: 0.2
      }
    )

    await model.save(modelPath)
  }

  tf.tidy(() => {
    // from test data; has a quality of 5
    // const testInput = tf.tensor2d([[5.6, 0.615, 0, 1.6, 0.089, 16, 59, 0.9943, 3.58, 0.52, 9.9]])
    // from test data; has a quality of 8
    const testInput = tf.tensor2d([[10.3, 0.32, 0.45, 6.4, 0.073, 5, 13, 0.9976, 3.23, 0.82, 12.6]])

    model.predict(testInput).print()
  })
})
