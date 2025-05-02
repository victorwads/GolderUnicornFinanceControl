import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function toSnakeCase(str: string): string {
  return str
    .trim()
    .normalize('NFD')                     // Normaliza para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')      // Remove marcas de acentuação
    .replace(/([a-z])([A-Z])/g, '$1_$2')  // camelCase -> camel_Case
    .replace(/\s+/g, '_')                 // espaços -> _
    .replace(/[^a-zA-Z0-9_]/g, '')        // remove caracteres especiais
    .toLowerCase();
}

function isValidDateFormat(value: string): boolean {
  const dateRegex = /^(?:\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}:\d{2}(?:\.\d{3})?)?)$/;
  return dateRegex.test(value);
}

export function convertStringToType(value: string): any {
  const trimmedValue = value.trim();
  if (trimmedValue === '' || trimmedValue === 'null') {
    return null;
  } else if (!isNaN(Number(trimmedValue))) {
    return parseFloat(trimmedValue);
  } else if (trimmedValue.toLowerCase() === 'true') {
    return true;
  } else if (trimmedValue.toLowerCase() === 'false') {
    return false;
  } else if (isValidDateFormat(trimmedValue)) {
    return new Date(trimmedValue);
  } else {
    return trimmedValue;
  }
}

export function sortByFirstDateField(data: Record<string, any>[]): void {
  if (data.length === 0) return;

  const firstRow = data[0];
  const dateKey = Object.keys(firstRow).find(key => firstRow[key] instanceof Date);

  if (dateKey) {
    data.sort((a, b) => {
      const aDate = a[dateKey] instanceof Date ? a[dateKey].getTime() : 0;
      const bDate = b[dateKey] instanceof Date ? b[dateKey].getTime() : 0;
      return aDate - bDate;
    });
  }
}

function determineType(value: any): string {
  if (value === null || value === undefined || value === 'null') {
    return 'null';
  } else if (typeof value === 'number') {
    return Number.isInteger(value) ? 'number' : 'number';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else if (value instanceof Date) {
    return 'Date';
  } else {
    return 'string';
  }
}

function generateInterfaceName(fileName: string): string {
  const baseName = fileName.replace(/\.json$/i, '');
  return baseName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function generateInterfacesFromData(
  data: Record<string, any>[],
  fileName: string,
  resultDir: string,
  prefix: string
): void {
  if (data.length === 0) return;

  const interfaceName = generateInterfaceName(fileName);
  const fields: Record<string, Set<string>> = {};
  const values: Record<string, string[]> = {};

  data.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      const type = determineType(value);
      if (!fields[key]) {
        fields[key] = new Set([type]);
      } else if (!fields[key].has(type)) {
        fields[key].add(type);
      }
      if(typeof value === 'string' && value.trim() !== '') {
        if (!values[key]) {
          values[key] = [];
        }
        if (!values[key].includes(value)) {
          values[key].push(value);
        }
      }
    });
  });

  const interfaceContent = 
  `export const ${interfaceName}File = {type: "${prefix.toLowerCase()}", name: "${fileName}"};\n\n` +
  `export interface ${interfaceName} {\n` +
    Object.entries(fields)
      .map(([key, types]) => {
        const typeArray = Array.from(types);
        const isNullable = typeArray.includes('null');
        const filteredTypes = typeArray.filter(t => t !== 'null');
        let typeString = filteredTypes.join(' | ');
        if (typeString === 'string' && values[key]?.length <= 5 && values[key]?.length > 1)
          typeString = `(${values[key].map(v => JSON.stringify(v)).join(' | ')})`;
        if(typeString === '')
          typeString = 'any';

        return `  ${key}${isNullable ? '?' : ''}: ${typeString};`;
      })
      .join('\n') +
    '\n}\n';

  const tsFileName = fileName.replace(/\.json$/i, '.ts');
  const tsFilePath = path.join(resultDir, tsFileName);
  fs.writeFileSync(tsFilePath, interfaceContent, 'utf8');
  console.log(chalk.blue('Interface gerada: ') + chalk.white(tsFileName));
}