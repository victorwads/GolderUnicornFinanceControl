import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { toSnakeCase, convertStringToType, sortByFirstDateField, generateInterfacesFromData } from './commons';

// Função para listar arquivos CSV do diretório atual
function listCsvFiles(dirPath: string): string[] {
  return fs.readdirSync(dirPath).filter(file => file.endsWith('.csv'));
}

// Função para decodificar entidades HTML
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/"/g, '');
}

// Função para ler e converter CSV em JSON
function convertCsvToJson(csvContent: string): Record<string, any>[] {
  const lines = decodeHtmlEntities(csvContent).split('\n').filter(Boolean);

  const headers = lines[0].split(';').map(toSnakeCase);

  const data = lines.slice(1).map(line => {
    const values = line.split(';');
    const result = headers.reduce<Record<string, any>>((obj, key, index) => {
      const value = values[index]?.trim() || '';
      obj[key] = convertStringToType(value);
      return obj;
    }, {});
    return result;
  });

  sortByFirstDateField(data);
  return data;
}

// Função principal para processar arquivos CSV
export default function processCsvFiles(): void {
  const dir = __dirname;
  const listDir = path.join(dir, 'csv');
  const resultDir = path.join(dir, 'result', 'csv');
  const csvFiles = listCsvFiles(listDir);

  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
  }

  csvFiles.forEach(file => {
    const filePath = path.join(listDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const json = convertCsvToJson(content);
    const newFileName = file.replace(/\.csv$/i, '.json');
    const jsonPath = path.join(resultDir, newFileName);
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Convertido: ${chalk.red(file)} -> ${chalk.green(newFileName)}`);

    generateInterfacesFromData(json, newFileName, resultDir, 'Csv');
  });
}