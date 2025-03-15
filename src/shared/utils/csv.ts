import fs from 'fs';
import * as fastCSV from 'fast-csv';

/**
 * @class CsvConverter
 * @classdesc A utility class for converting CSV files to arrays of data.
 */
class CsvConverter {
    /**
     * @static
     * @async
     * @method convertToArray
     * @description Converts a CSV file to an array of objects with the specified data structure.
     * @param {string} filePath - The path to the CSV file.
     * @returns {Promise<DataLabel[]>} An array of objects representing the CSV data.
     * @template DataLabel - The type of data structure for each row.
     */
    public static async convertToArray<DataLabel extends Record<string, any>>(
        filePath: string
    ): Promise<DataLabel[]> {
        try {
            const stream = fs.createReadStream(filePath);
            return await new Promise<DataLabel[]>((resolve, reject) => {
                const data: DataLabel[] = [];
                fastCSV.parseStream(stream, { headers: true })
                    .on('data', async (row) => {
                        data.push(row);
                    })
                    .on('end', () => resolve(data))
                    .on('error', reject);
            });
        } catch (error) {
            console.error('Error reading CSV file:', error);
            return [];
        }
    }
}

export default CsvConverter;