import ExcelJS from 'exceljs';
import { Response } from 'express';
import * as fs from 'fs';

const excelFileDownload = async (
  addWorksheet: string,
  array: any,
  response: Response
): Promise<string> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(addWorksheet);
  const result = Object.keys(Object.assign({}, ...array));

  const columns: Partial<ExcelJS.Column>[] | { header: string; key: string }[] =
    [];
  result.forEach((column) =>
    columns.push({
      header: column,
      key: column,
      width: 15
    })
  );
  worksheet.columns = columns;

  // Add Array Rows
  worksheet.addRows(array);
  // response.setHeader(
  //   'Content-Type',
  //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  // );
  // response.setHeader(
  //   'Content-Disposition',
  //   `attachment; filename=${addWorksheet}.xlsx`
  // );
  
  // await workbook.xlsx.write(response);

  fs.mkdirSync('./src/download/excel/', { recursive: true });

  const time = new Date().getTime();
  const fileName = `./src/download/excel/${addWorksheet}-${time}.xlsx`;

  const data = await workbook.xlsx.writeFile(fileName);

  // response.status(200).end();
  return fileName;
};

export default excelFileDownload;
