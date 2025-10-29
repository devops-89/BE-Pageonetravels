import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
// Use require for wkhtmltopdf, not import
const wkhtmltopdf = require('wkhtmltopdf');

@Injectable()
export class PDFGenerateService {
  generateHTMLToPDF(htmlContent: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: any[] = [];
        const stream = wkhtmltopdf(htmlContent, {
          pageSize: 'A4',
          orientation: 'portrait',
          marginTop: '10mm',
          marginBottom: '10mm',
          marginLeft: '10mm',
          marginRight: '10mm',
          printMediaType: true,
        });

        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err) => {
          console.error('wkhtmltopdf error:', err);
          reject(err);
        });
      } catch (error) {
        console.error('Error while generating PDF:', error);
        reject(error);
      }
    });
  }

  async readPDFFile(orderId: string) {
    const filePath = `./Invoice/${orderId}.pdf`;
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}
