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
PREFIX="Your prefix here"
SUFFIX="Your suffix here"
EXPORT_BATCH=true
URELY_USERNAME="Your username here"
URELY_PASSWORD="Your password here"
URELY_APIKEY="Your API key here"
URELY_BRANDID="Your brand ID here"
URELY_TAGTYPEID="Your tag type ID here"
URELY_URL="https://labid.test.mia-platform.eu"
```

## Usage

To use the module, follow the steps below:

1. Install the dependencies by running the following command:

   ```shell
   npm install
   ```

2. Set up the environment variables. Create a `.env` file in the root directory of your project and provide the necessary values. Here's an example `.env` file:

   ```dotenv
   SERIAL=ABC123
   SERIAL_LENGTH=8
   BATCH_LENGTH=50
   BATCH_NAME=My Batch
   ```

   Make sure to replace the values with your desired configuration.

3. Import the `generateAndLoad` function from the module in your index file:

   ```javascript
   import { generateAndLoad } from "./urely-serial-generator.js";
   ```

4. Call the `generateAndLoad` function, passing the desired arguments. The function will prioritize the provided arguments, fallback to environment variables if available, and finally use default values:

   ```javascript
   // Example 1: Providing all arguments from the index file
   generateAndLoad({
     serial: "ABC123",
     serialLength: 8,
     batchLength: 50,
     batchName: "My Batch",
   });

   // Example 2: Using environment variables
   generateAndLoad();

   // Example 3: Using a mix of arguments and environment variables
   generateAndLoad({
     serial: "XYZ789",
     serialLength: process.env.SERIAL_LENGTH,
     batchLength: 100,
   });
   ```

   In Example 1, all arguments are provided directly from the index file. In Example 2, no arguments are passed, so the function falls back to using the environment variables. In Example 3, some arguments are provided, while others are left undefined, so the function uses the provided values where available and falls back to environment variables or defaults for the missing ones.

5. Run your application by executing the index file using Node.js:

   ```shell
   node index.js
   ```

   The `generateAndLoad` function will execute with the specified configuration.

6. You can also pass command-line arguments to override the default values from the environment variables:

```shell
   node index.js --serial=100 --batchName=test3
```

Or using short names:

```shell
   node index.js -s 100 -n test3
```

The available options are:

- serial or -s: Set how many serial numbers will be generated (default: SERIAL from .env).
- serialLength or -l: Set the serial number length (default: SERIAL_LENGTH from .env).
- batchLength or -b: Set the batch length to laod (default: BATCH_LENGTH from .env).
- batchName or -n: Set the batch name (default: BATCH_NAME from .env).
- prefix or -p: set prefix.
- suffix or -x: Set the suffix.
- suffix or -x: Set the suffix.
- exportBatch or -e: export data in csv format (tha name of the file will be the batch_name).

## Optional Prefix and Suffix

You can optionally include a prefix and suffix for the generated serial numbers.

To set the prefix and suffix using command-line arguments:

```shell
node index.js --prefix="Your prefix here" --suffix="Your suffix here"
```

Or using short names:

```shell
node index.js -p "Your prefix here" -x "Your suffix here"
```

## Batch Export

You can enable the automatic export of each batch as a CSV file named after the batch name.
To enable batch export, set the `EXPORT_BATCH` variable in the `.env` file to `true`:

## Additional Parameters

You can insert a fixed JSON string as additional parameters during the loading process. The JSON string will be used as `additionalParameters` for all the generated serial numbers.

To set the additional parameters using command-line arguments, pass the JSON string as a single-quoted argument:

```shell
node index.js --additionalParameters='{"productCategory":"eyewear","anotherParameter":5}'
```

Or using short names:

```shell
node index.js -a '{"productCategory":"eyewear","anotherParameter":5}'
```

The additional parameters can also be set in the .env file by adding the following line:

```dotenv
ADDITIONAL_PARAMETERS={"productCategory":"eyewear","anotherParameter":5}
```

If no additional parameters are provided, an empty object will be used as the default.
The JSON string should be in a valid JSON format.

That's it! You can now use the module with the desired arguments, environment variables, or defaults. Feel free to customize the arguments and environment variables according to your needs.
