import { generateAndLoad } from './urely-serial-generator.js'

generateAndLoad({ serial: 10, serialLength: 12, batchLength: 5, batchName: 'test_10', prefix: '', suffix: '', exportBatch: true })
