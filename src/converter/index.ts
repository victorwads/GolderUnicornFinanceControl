import fs from 'fs'
import path from 'path'
import convertXlsxToJson from './convert_xlxs'
import convertCsvToJson from './convert_csv'

const dir = __dirname
const resultDir = path.join(dir, 'result')
if (fs.existsSync(resultDir)) {
  fs.rmSync(resultDir, { recursive: true, force: true })
}

convertCsvToJson()
convertXlsxToJson()