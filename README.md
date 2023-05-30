# URelY Serial Number Generator and Loader

This is a Node.js application that generates unique serial numbers and uploads them to the URelY platform. The app uses dotenv for environment configuration, nanoid for serial generation, and axios for making HTTP requests. It also implements rate limiting to prevent errors when dealing with large files.

## Prerequisites

- Node.js (v14 or later recommended)
- npm (v6 or later recommended)

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project root in your terminal.
3. Run `npm install` to install the necessary dependencies.

## Configuration

You will need to provide your environment variables. Copy the `.env.example` file and rename the copy to `.env`. Then, fill in your details:

Here is an example of a `.env.example` file:

```dotenv
SERIAL=50000
SERIAL_LENGTH=12
BATCH_LENGTH=10000
BATCH_NAME="Your batch name here"
URELY_USERNAME="Your username here"
URELY_PASSWORD="Your password here"
URELY_APIKEY="Your API key here"
URELY_BRANDID="Your brand ID here"
URELY_TAGTYPEID="Your tag type ID here"
URELY_URL="https://labid.test.mia-platform.eu"
