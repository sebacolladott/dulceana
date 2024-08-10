import bwipjs from 'bwip-js';
import { BrowserWindow, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import qrcode from 'qrcode';

let window = null;

app.whenReady().then(() => {
  window = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
});

export const print = async (data, options) => {
  if (!window) {
    return Promise.reject(new Error('Printer window not ready'));
  }

  return generateHtml(data, options.pageSize).then(html => {
    const tempPath = path.join(app.getPath('temp'), 'pos_print.html');

    return new Promise((resolve, reject) => {
      fs.writeFile(tempPath, html, err => {
        if (err) return reject(err);
        loadAndPrint(tempPath, options)
          .then(() => {
            fs.unlink(tempPath, unlinkErr => {
              if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
              resolve();
            });
          })
          .catch(printErr => {
            fs.unlink(tempPath, unlinkErr => {
              if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
              reject(printErr);
            });
          });
      });
    });
  });
};

function loadAndPrint(tempPath, options) {
  return new Promise((resolve, reject) => {
    window.loadFile(tempPath);
    window.webContents.on('did-finish-load', () => {
      window.webContents.print(
        {
          silent: options.preview === false,
          printBackground: true,
          deviceName: options.printerName,
          copies: options.copies,
          margins: { marginType: 'none' }
        },
        (success, reason) => {
          if (success) {
            resolve(true);
          } else {
            reject(new Error(`Print failed: ${reason}`));
          }
        }
      );
    });
  });
}

function generateHtml(data, pageSize) {
  let html = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            width: ${pageSize}mm;
            margin: 0;
            padding: 0;
          }
          .text {
            margin-bottom: 5px;
          }
          .center {
            text-align: center;
          }
          .right {
            text-align: right;
          }
          .left {
            text-align: left;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          td {
            font-size: 12px;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          .header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
          }
          .footer {
            font-size: 12px;
            margin-top: 10px;
            text-align: center;
          }
          .total {
            font-weight: bold;
            font-size: 14px;
          }
          .separator {
            border-top: 1px solid #ddd;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
  `;

  const htmlPromises = data.map(item => generateHtmlContent(item));

  return Promise.all(htmlPromises).then(contents => {
    html += contents.join('');
    html += '</body></html>';
    return html;
  });
}

function generateHtmlContent(item) {
  switch (item.type) {
    case 'text':
      return Promise.resolve(
        `<div class="text ${item.position || ''}" style="${convertStyleObjectToString(item.style)}">${item.value}</div>`
      );
    case 'barCode':
      return generateBarcode(
        item.value,
        item.width || '2',
        item.height || '40',
        item.displayValue,
        item.fontsize
      ).then(
        barCodeImage =>
          `<div class="${item.position || 'center'}"><img src="${barCodeImage}" alt="barcode" /></div>`
      );
    case 'qrCode':
      return generateQRCode(item.value, item.width || '55', item.height || '55').then(
        qrCodeImage =>
          `<div class="${item.position || 'center'}"><img src="${qrCodeImage}" alt="qrcode" /></div>`
      );
    case 'image':
      return Promise.resolve(
        `<div class="${item.position || 'center'}"><img src="${item.url}" style="width: ${item.width || 'auto'}; height: ${item.height || '50px'};" /></div>`
      );
    case 'table':
      return Promise.resolve(generateTable(item));
    default:
      return Promise.resolve('');
  }
}

function generateTable(item) {
  let tableHtml = `<table style="${convertStyleObjectToString(item.style)}">`;

  tableHtml += generateTableSection(item.tableHeader, item.tableHeaderStyle, 'thead');
  tableHtml += generateTableSection(item.tableBody, item.tableBodyStyle, 'tbody');
  tableHtml += generateTableSection(item.tableFooter, item.tableFooterStyle, 'tfoot');

  tableHtml += '</table>';
  return tableHtml;
}

function generateTableSection(data, style, section) {
  if (!data) return '';
  let sectionHtml = `<${section} style="${convertStyleObjectToString(style)}">`;
  data.forEach(row => {
    sectionHtml += '<tr>';
    row.forEach(cell => {
      if (typeof cell === 'string') {
        sectionHtml += `<td>${cell}</td>`;
      } else if (cell.type === 'text') {
        sectionHtml += `<td>${cell.value}</td>`;
      } else if (cell.type === 'image') {
        sectionHtml += `<td><img src="${cell.url || cell.path}" /></td>`;
      }
    });
    sectionHtml += '</tr>';
  });
  sectionHtml += `</${section}>`;
  return sectionHtml;
}

function generateBarcode(value, width, height, displayValue = false, fontSize = 12) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'code128',
        text: value,
        scale: 3,
        height: parseInt(height),
        includetext: displayValue,
        textxalign: 'center',
        textsize: fontSize
      },
      (err, png) => {
        if (err) {
          reject(err);
        } else {
          resolve(`data:image/png;base64,${png.toString('base64')}`);
        }
      }
    );
  });
}

function generateQRCode(value, width, height) {
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(value, { width: parseInt(width), height: parseInt(height) }, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
}

function convertStyleObjectToString(style) {
  if (!style) return '';
  return Object.entries(style)
    .map(([key, value]) => `${camelToKebabCase(key)}: ${value}`)
    .join('; ');
}

function camelToKebabCase(str) {
  return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}
