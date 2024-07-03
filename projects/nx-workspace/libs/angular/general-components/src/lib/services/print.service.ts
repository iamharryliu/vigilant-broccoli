import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  print(printContent: string) {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <link rel="stylesheet" type="text/css" href="print.css">
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  }
}
