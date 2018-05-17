const { Layer, Network } = require('synaptic')
const { iife, pathExists, readJSON, writeJSON } = require('../utils.js')

function createXORNetwork () {
  const inputLayer = new Layer(2)
  const hiddenLayer = new Layer(3)
  const outputLayer = new Layer(1)

  inputLayer.project(hiddenLayer)
  hiddenLayer.project(outputLayer)

  return new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
  })
}

iife(async () => {
  let XORNetwork

  if (await pathExists('model.json')) {
    const model = await readJSON('model.json')

    console.log('loaded existing model')
    XORNetwork = Network.fromJSON(model)
  } else {
    console.log('creating new model')
    XORNetwork = createXORNetwork()
  }

  // train the network - learn XOR
  const learningRate = .3
  for (let i = 0; i < 30000; i++) {
    // 0,0 => 0
    XORNetwork.activate([0, 0])
    XORNetwork.propagate(learningRate, [0])

    // 0,1 => 1
    XORNetwork.activate([0, 1])
    XORNetwork.propagate(learningRate, [1])

    // 1,0 => 1
    XORNetwork.activate([1, 0])
    XORNetwork.propagate(learningRate, [1])

    // 1,1 => 0
    XORNetwork.activate([1, 1])
    XORNetwork.propagate(learningRate, [0])
  }

  await writeJSON('model.json', XORNetwork.toJSON())
  console.log('finished training; results:\n')

  // test the network
  ;[
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1]
  ].forEach(input => {
    console.log('input:', input, 'output:', XORNetwork.activate(input))
  })
})
