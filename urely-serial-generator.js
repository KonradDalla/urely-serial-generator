/**
 * URelY Serial Number Generator and Loader
 *
 * This Node.js application generates unique serial numbers using the nanoid package and uploads them to the URelY platform.
 * The app uses dotenv for environment configuration, nanoid for serial generation, and axios for making HTTP requests.
 * It also implements rate limiting to prevent errors when dealing with large files.
 *
 * Author: [Konrad Dalla]
 * Date: [2023]
 */

import { nanoid } from 'nanoid'
import * as dotenv from 'dotenv'
import axios from 'axios'
import { SingleBar, Presets } from 'cli-progress'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import ObjectsToCsv from 'objects-to-csv'

const argv = yargs(hideBin(process.argv))
  .option('serial', {
    alias: 's',
    type: 'number',
    description: 'Set the serial number',
    default: process.env.SERIAL
  })
  .option('serialLength', {
    alias: 'l',
    type: 'number',
    description: 'Set the serial length',
    default: process.env.SERIAL_LENGTH
  })
  .option('batchLength', {
    alias: 'b',
    type: 'number',
    description: 'Set the batch length',
    default: process.env.BATCH_LENGTH
  })
  .option('batchName', {
    alias: 'n',
    type: 'string',
    description: 'Set the batch name',
    default: process.env.BATCH_NAME
  })
  .option('prefix', {
    alias: 'p',
    type: 'string',
    description: 'Set the prefix',
    default: process.env.PREFIX || ''
  })
  .option('suffix', {
    alias: 'x',
    type: 'string',
    description: 'Set the suffix',
    default: process.env.SUFFIX || ''
  })
  .option('additionalParameters', {
    alias: 'a',
    type: 'string',
    description: 'Set additional parameters as a JSON string',
    default: process.env.ADDITIONAL_PARAMETERS || undefined
  })
  .option('exportBatch', {
    alias: 'e',
    type: 'string',
    description: 'Set csv export',
    default: process.env.EXPORT_BATCH || true
  }).argv

// Create a new progress bar instance
const progressBar = new SingleBar(
  {
    format:
      '{bar} {percentage}% | ETA: {eta_formatted} | {value}/{total} Files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    clearOnComplete: true,
    hideCursor: true
  },
  Presets.rect
)
dotenv.config()

async function generate (
  serial,
  serialLength,
  batchLength,
  batchName,
  prefix,
  suffix,
  exportBatch,
  additionalParameters
) {
  const batches = []
  let tags = []
  // Generate serial and add to tags array
  for (let i = 0; i < serial; i++) {
    const tag = {
      uid: `${prefix}${nanoid(serialLength)}${suffix}`,
      tagTypeId: process.env.URELY_TAGTYPEID,
      brandId: process.env.URELY_BRANDID,
      batchName,
      additionalParameters
    }
    tags.push(tag)
    // if > then BATCH_LENGTH add to batches array and reset the tags array
    if (tags.length >= batchLength) {
      batches.push(tags)
      tags = []
    }
  }
  // load the last batch if less than BATCH_LENGTH in previous step
  if (tags.length > 0) {
    batches.push(tags)
  }
  return batches
}
async function login () {
  try {
    const params = new URLSearchParams({ foo: 'bar' })
    params.append('grant_type', 'password')
    params.append('username', process.env.URELY_USERNAME)
    params.append('password', process.env.URELY_PASSWORD)
    const response = await axios.post(
      `${process.env.URELY_URL}/oauth/token`,
      params,
      { headers: { secret: process.env.URELY_APIKEY } }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

async function loadTags (batches, accessToken) {
  for (let i = 0; i < batches.length; i++) {
    try {
      const tags = batches[i]
      await axios.post(
        `${process.env.URELY_URL}/v2/tags/bulk`,
        tags,
        {
          headers: {
            secret: process.env.URELY_APIKEY,
            Authorization: `Bearer ${accessToken}`
          }
        },
        {
          onUploadProgress: ({ progress, rate }) => {
            console.log(
              `Upload batch ${i + 1}/${batches.length} [${(
                progress * 100
              ).toFixed(2)}%]: ${(rate || !rate / 1024).toFixed(2)}KB/s`
            )
          },

          maxRate: [100 * 1024] // 100KB/s limit
        }
      )
      progressBar.increment()
      progressBar.update(i + 1)
    } catch (error) {
      console.error(error)
      progressBar.stop()
    }
  }
  progressBar.stop()
}

export async function generateAndLoad ({
  serial,
  serialLength,
  batchLength,
  batchName,
  prefix,
  suffix,
  exportBatch,
  additionalParameters
} = {}) {
  serial = argv.serial || serial || process.env.SERIAL
  serialLength = argv.serialLength || serialLength || process.env.SERIAL_LENGTH
  batchLength = argv.batchLength || batchLength || process.env.BATCH_LENGTH
  batchName = argv.batchName || batchName || process.env.BATCH_NAME
  prefix = argv.prefix || prefix || process.env.PREFIX || ''
  suffix = argv.suffix || suffix || process.env.SUFFIX || ''
  exportBatch = argv.exportBatch || exportBatch || process.env.EXPORT_BATCH || false
  additionalParameters = JSON.parse(argv.additionalParameters || additionalParameters || process.env.ADDITIONAL_PARAMETERS || '{}')
  const batches = await generate(serial, serialLength, batchLength, batchName, prefix,
    suffix, exportBatch, additionalParameters)
  console.log(`Generated ${batches.length}  ${batchName} batches.`)
  console.log(
    `Total serial generated: ${serial}  with ${serialLength} length.`
  )
  const { accessToken } = await login()
  console.log('Login OK!')
  // Start the progress bar
  progressBar.start(batches.length, 0)
  await loadTags(batches, accessToken)
  if (exportBatch || exportBatch === 'true') {
    await exportBatches(batches, batchName)
  }
  console.log('Done!')
}

async function exportBatches (batches, batchName) {
  const csvFilePath = `${batchName}.csv`
  await saveCSV(csvFilePath, batches)
}

async function saveCSV (filePath, data) {
  try {
    for (let i = 0; i < data.length; i++) {
      const csv = new ObjectsToCsv(data[i])
      await csv.toDisk(filePath, { append: true })
    }
    console.log(`Batch exported to: ${filePath}`)
  } catch (error) {
    console.error(`Error saving CSV file: ${error}`)
  }
}
