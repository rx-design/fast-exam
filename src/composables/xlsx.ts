import XLSX from 'xlsx/dist/xlsx.mini.min';
import { SheetQuestion, SheetQuiz } from '@/types';
import { Question } from '~/types';

/**
 * Converts spreadsheet rows to `Question` objects
 * @param {SheetQuestion[]} rows
 * @return {Question[]}
 */
function getQuestions(rows: SheetQuestion[]): Question[] {
  return rows.map(row => ({
    text: row.question,
    imageUrl: row.imageUrl,
    options: row.options.split(/\r?\n/),
    correctOption: 'ABCDE'.indexOf(row.answer),
  }));
}

/**
 * Converts spreadsheets to `Quiz` objects
 * @param {string} binary
 * @return {SheetQuiz[]}
 */
function getQuizzes(binary: string): SheetQuiz[] {
  const wb = XLSX.read(binary, { type: 'binary' });

  const quizzes: SheetQuiz[] = [];

  for (let i = 0; i < wb.SheetNames.length; i++) {
    const ws = wb.Sheets[wb.SheetNames[i]];

    const rows = XLSX.utils.sheet_to_json(ws) as SheetQuestion[];
    const questions = getQuestions(rows);

    quizzes.push({
      name: wb.SheetNames[i],
      questions,
    });
  }

  return quizzes;
}

/**
 * Reads spreadsheet file
 * @param {File} file
 */
function read(file: File): Promise<SheetQuiz[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const target = e.target as FileReader;
      const result = target.result as ArrayBuffer;

      const bytes = new Uint8Array(result);
      const length = bytes.byteLength;

      let binary = '';

      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      const data = getQuizzes(binary);

      resolve(data);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Writes spreadsheet file
 * @param {HTMLTableElement} table
 */
function write(table: HTMLTableElement): void {
  const wb = XLSX.utils.table_to_book(table);
  XLSX.writeFile(wb, 'quiz-results.xlsx');
}

export {
  read,
  write,
};
