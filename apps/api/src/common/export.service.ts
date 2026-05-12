import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ExportService {
  async exportToExcel(res: Response, data: any[], columns: any[], filename: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    worksheet.columns = columns;
    worksheet.addRows(data);

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async exportToPdf(res: Response, title: string, data: any[], columns: string[], filename: string) {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}.pdf`,
    );

    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 150;
    const itemHeight = 25;
    
    doc.fontSize(12).font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(col, 50 + i * 100, tableTop);
    });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Rows
    doc.font('Helvetica');
    data.forEach((row, i) => {
      const y = tableTop + 25 + i * itemHeight;
      Object.values(row).forEach((val: any, j) => {
        doc.text(val?.toString() || '', 50 + j * 100, y);
      });
    });

    doc.end();
  }
}
