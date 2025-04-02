import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
// import * as html_to_pdf from 'html-pdf-node';
import * as html_pdf from 'html-pdf';

@Injectable()
export class PDFGenerateService 
{
 
    generateHTMLToPDF(htmlContent: string):Promise<Buffer> {
        return new Promise(async(resolve, reject)=>{
            try {
                
                const options = {
                    format: 'A4',
                    orientation: 'portrait',
                    // border: {
                    //     top: '1cm',
                    //     right: '2cm',
                    //     bottom: '1cm',
                    //     left: '2cm',
                    // },
                    type: 'pdf',
                    childProcessOptions: {
                        detached: true,
                    },
                };
                html_pdf.create(htmlContent, options).toBuffer((err: Error, buffer: Buffer) => {
                    if (err) {
                        console.log('Error html to pdf', err);
                        reject(err);
                    }
                    resolve(buffer);
                    return;
                });
                
                // html_to_pdf.generatePdf({ content: htmlContent }, { format: 'A4' }, (err: Error, buffer: Buffer) => 
                // {
                //     if (err) {
                //         console.log("Error html to pdf", err)
                //         reject(err)};

                //     console.log('PDF generated successfully', buffer);

                //     resolve(buffer);
                //     return;
                // }); 
             }
             catch (error) {
                 console.log("Error while generating html to pdf", error)
                 resolve(null);
             }
        })
     
    }

    async readPDFFile(orderId: any) {
        const filePath = `./Invoice/${orderId}.pdf`;
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };
}
