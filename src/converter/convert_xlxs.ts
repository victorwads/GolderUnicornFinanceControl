import fs from 'fs';
import path from 'path';
import chalk from 'chalk'
import xlsx, { WorkSheet } from 'xlsx';
import { toSnakeCase, convertStringToType, sortByFirstDateField, generateInterfacesFromData } from './commons';

// Função para converter dados de uma planilha em JSON
function convertSheetToJson(sheet: WorkSheet): Record<string, any>[] {
  const rows: (string | undefined)[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  if (rows.length === 0) return [];

  const headers = rows[0].map(header => toSnakeCase(header as string));
  const data = rows.slice(1).map(row => {
    const result = headers.reduce<Record<string, any>>((obj, key, index) => {
      const value = row[index] || '';
      obj[key] = convertStringToType(value.toString());
      return obj;
    }, {});
    return result;
  });

  sortByFirstDateField(data);
  return data;
}

// Função principal para processar apenas o arquivo data.xlsx
export default function processDataXlsx(): void {
  const dir = __dirname;
  const fileName = 'data.xlsx';
  const filePath = path.join(dir, 'xlsx', fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo ${fileName} não encontrado no diretório ${dir}`);
    return;
  }

  const resultDir = path.join(dir, 'result', 'xlsx');
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
  }

  const workbook = xlsx.readFile(filePath);

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    const json = convertSheetToJson(sheet);
    const newFileName = toSnakeCase(sheetName) + '.json';
    const jsonPath = path.join(resultDir, newFileName);
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(
      `Convertido: ${chalk.red(fileName)} ` +
      `[${chalk.yellow(sheetName)}] -> ${chalk.green(newFileName)}`
    );

    generateInterfacesFromData(json, newFileName, resultDir, 'Csv');
  });
}
