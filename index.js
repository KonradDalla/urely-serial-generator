import { generateAndLoad } from './urely-serial-generator.js'

const serial = 10
const serialLength = 16
const batchLength = 5
const batchName = 'Batch 10'

generateAndLoad({ serial, serialLength, batchLength, batchName })
