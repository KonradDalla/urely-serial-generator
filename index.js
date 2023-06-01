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

async function generate (serial, serialLength, batchLength, batchName) {
  const batches = []
  let tags = []
  // Generate serial and add to tags array
  for (let i = 0; i < serial; i++) {
    const tag = {
      uid: nanoid(serialLength),
      tagTypeId: process.env.URELY_TAGTYPEID,
      brandId: process.env.URELY_BRANDID,
      batchName
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
  for (let i = 0; i <= batches.length; i++) {
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
      progressBar.update(i)
    } catch (error) {
      console.error(error)
      progressBar.stop()
    }
  }
  progressBar.stop()
}
async function generateAndLoad ({
  serial = process.env.SERIAL,
  serialLength = process.env.SERIAL_LENGTH,
  batchLength = process.env.BATCH_LENGTH,
  batchName = process.env.BATCH_NAME
} = {}) {
  const batches = await generate(serial, serialLength, batchLength, batchName)
  console.log(`Generated ${batches.length}  ${batchName} batches.`)
  console.log(
    `Total serial generated: ${serial}  with ${serialLength} length.`
  )
  const { accessToken } = await login()
  console.log('Login OK!')
  // Start the progress bar
  progressBar.start(batches.length, 0)
  await loadTags(batches, accessToken)
  console.log('Done!')
}
await generateAndLoad({})
