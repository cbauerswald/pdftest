"use strict";

var PDFDocument = require('pdfkit-table');

var QRCode = require('qrcode');

var uniqid = require('uniqid');

fs = require('fs');
var taxMapRed = '#e0002a';
var taxMapRedLight = '#ff5454';
var taxMapRedBackground = '#ff9191';
var darkGray = "#444444";
var lightGray = "#7a7a7a";
var doc = new PDFDocument();
doc.pipe(fs.createWriteStream('output.pdf'));
var marginLeft = 50;
var tableYMargin = 20;

var createInvoice = function createInvoice() {
  var invoice, base64Result;
  return regeneratorRuntime.async(function createInvoice$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          //generate invoice data
          invoice = {
            "invoiceId": "",
            "personId": "7eb85ba7-6a01-4555-9a2e-cf9acc96a97a",
            "customer": "Sara Fielding",
            "dateCreated": "2022-05-30T15:30:54.243Z",
            "dateDue": "2022-06-04T00:00:00.000Z",
            "paid": false,
            "amount": 620,
            "qrCode": "",
            tax: 10,
            "products": [{
              "Name": "Mathilda (ppbk)",
              "Quantity": "124",
              "Description": "fun facts about this item",
              "Price": 5
            }, {
              "Name": "On Greener Days: A Love Story (ppbk)",
              "Quantity": "14",
              "Description": "I wrote a whole sentence anout this one.",
              "Price": 75.15
            }],
            "shipping": {
              name: "Cecelia Auerswald",
              "city": "Greenwood Corners",
              "street": "123 Greenwood Center",
              "zip": "12455",
              state: "Connecticut",
              country: "United States"
            }
          };
          invoice.amount = 0;
          invoice.products.forEach(function (p) {
            invoice.amount += p.Quantity * p.Price;
          });
          invoice.invoiceId = '4356-21'; //uniqid()

          _context.next = 6;
          return regeneratorRuntime.awrap(QRCode.toDataURL("".concat(process.env.BASE_URL, "/invoices/").concat(invoice.invoiceId)));

        case 6:
          base64Result = _context.sent;
          invoice.qrCode = base64Result;
          return _context.abrupt("return", invoice);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
};

var generatePdf = function generatePdf() {
  var invoice, user;
  return regeneratorRuntime.async(function generatePdf$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(createInvoice());

        case 2:
          invoice = _context2.sent;
          user = {
            id: "eu-west-2:1a9fadec-44bd-4eca-b6df-a598232279f5",
            name: "Mary Garth Inc.",
            address: {
              address1: "7272 Lite Ave. #1244",
              address2: 'New York, NY, 10025'
            }
          };
          doc.font('Montserrat/static/Montserrat-Light.ttf'); //create invoice pdf

          generateHeader(doc, invoice, user);
          generateCustomerInformation(doc, invoice, user);
          generateInvoiceTable(doc, invoice);
          doc.end();

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
};

function generateHeader(doc, invoice, user) {
  doc.rect(doc.page.width - marginLeft - 80 - 5, 50, 90, 90).strokeColor(taxMapRed).stroke();
  doc.fontSize(20).fillColor(taxMapRed).text("______ I N V O I C E", 50, 50, {
    align: 'left'
  }).moveDown(0.2).fontSize(10).fillColor(lightGray).font('Montserrat/static/Montserrat-Light.ttf').text("no. ", {
    continued: true
  }).font('Montserrat/static/Montserrat-Medium.ttf').text("".concat(invoice.invoiceId), {
    continued: true
  }).font('Montserrat/static/Montserrat-Light.ttf').text("   //   ", {
    continued: true
  }).font('Montserrat/static/Montserrat-Medium.ttf').text("".concat(new Date(invoice.dateCreated).toLocaleDateString("en-US"))).fillColor(lightGray).moveDown(2).font("Montserrat/static/Montserrat-Medium.ttf").text("billing to:   ").fontSize(10).font("Montserrat/static/Montserrat-Light.ttf").text(user.address.address1, {
    continued: true
  }).text("  ", {
    continued: true
  }).text(user.address.address2).image(invoice.qrCode, doc.page.width - marginLeft - 80, 50 + 5, {
    width: 80
  }).fontSize(10).moveDown();
}

function generateCustomerInformation(doc, invoice, user) {
  doc.font('Montserrat/static/Montserrat-Light.ttf');
  doc.fillColor(taxMapRed).fontSize(20).text(user.name.toUpperCase(), marginLeft, 180);
  generateHr(doc, 205);
  var customerInformationTop = 220;
  doc.fillColor(darkGray).fontSize(10) // .font("Montserrat/static/Montserrat-Medium.ttf")
  // .text("Invoice Number:", marginLeft, customerInformationTop)
  // .font("Montserrat/static/Montserrat-Light.ttf")
  // .text(invoice.invoiceId, 150, customerInformationTop)
  // .text("Invoice Created:", marginLeft, customerInformationTop + 15)
  // .text((new Date(invoice.dateCreated)).toLocaleDateString("en-US"), 150, customerInformationTop + 15)
  .font("Montserrat/static/Montserrat-Medium.ttf").text("Invoice Due:", marginLeft, customerInformationTop).font("Montserrat/static/Montserrat-Light.ttf").text(new Date(invoice.dateDue).toLocaleDateString("en-US"), 150, customerInformationTop).font("Montserrat/static/Montserrat-Medium.ttf").text("Balance Due", marginLeft, customerInformationTop + 15).fontSize(20).fillColor(darkGray).font('Montserrat/static/Montserrat-Medium.ttf').text(formatCurrency(getTotal(invoice)), 50, customerInformationTop + 35).fillColor(darkGray).fontSize(10).font("Montserrat/static/Montserrat-Medium.ttf").text('Ship to:', 300, customerInformationTop).font("Montserrat/static/Montserrat-Light.ttf").text(invoice.shipping.name, 300, customerInformationTop + 15).text(invoice.shipping.street, 300, customerInformationTop + 30).text(invoice.shipping.city + ", " + invoice.shipping.state + ", " + invoice.shipping.country, 300, customerInformationTop + 45).moveDown(); // generateHr(doc, 267);
}

var getTotal = function getTotal(invoice) {
  return invoice.amount + invoice.amount * invoice.tax / 100;
}; // async function generateProductTable(doc, invoice) {
//     let productRows = invoice.products.map(p => {
//         let subtotal = p.Price * p.Quantity
//         return [p.Name, p.Quantity, `$${p.Price}`, `$${subtotal.toFixed(2)}`]
//     })
//     let total = getTotal(invoice)
//     const table = {
//         title: { label: 'Products', color: taxMapRed },
//         headers: [
//             { label: "Item", headerColor: taxMapRedBackground },
//             { label: "Quantity", headerColor: taxMapRedBackground },
//             { label: "Cost", headerColor: taxMapRedBackground },
//             { label: "Total", headerColor: taxMapRedBackground }
//         ],
//         rows: productRows
//     }
//     const table2 = {
//         headers: ["", ""],
//         rows: [
//             ["Subtotal:", `$${invoice.amount.toFixed(2)}`],
//             ["Tax:", `${invoice.tax}%`],
//             ["Total:", `${total}`]]
//     }
//     doc.moveDown(3)
//     doc.x = marginLeft
//     await doc.table(table, {
//         width: 500,
//         padding: 30,
//         headerColor: taxMapRedBackground,
//         minRowHeight: 20,
//         columnsSize: [200, 100, 100, 100],
//     });
//     doc.moveDown(2);
//     await doc.table(table2, {
//         hideHeader: true,
//         width: 200,
//         x: 300 + marginLeft,
//         prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => { if (indexRow == 2) doc.font("Helvetica-Bold") }, // {Function} 
//     })
// }


function generateInvoiceTable(doc, invoice) {
  var i;
  var invoiceTableTop = 330;
  var yposition = invoiceTableTop;
  doc.font("Montserrat/static/Montserrat-Light.ttf");
  yposition = generateTableHeader(doc, yposition);
  doc.font("Montserrat/static/Montserrat-Light.ttf");

  for (i = 0; i < invoice.products.length; i++) {
    var item = invoice.products[i]; // position = invoiceTableTop + 2 * tableYMargin + (i + 1) * 30;

    yposition = generateTableRow(doc, yposition, i, item.Name, item.Description, item.Price, item.Quantity, formatCurrency(item.Price * item.Quantity), i); // generateHr(doc, position + 20);
  } // yposition = yposition + 20;


  yposition = generateBaseTableRow(doc, yposition, "Subtotal", formatCurrency(invoice.amount));
  yposition = generateBaseTableRow(doc, yposition, "Tax", "".concat(invoice.tax, "%")); // yposition = yposition + 20;

  doc.font("Montserrat/static/Montserrat-SemiBold.ttf");
  yposition = generateBaseTableRow(doc, yposition, "Balance Due", "".concat(formatCurrency(getTotal(invoice))));
  doc.font("Montserrat/static/Montserrat-Light.ttf");
}

function generateTableRow(doc, y, index, item, description, unitCost, quantity, lineTotal) {
  var position = y + tableYMargin;
  doc.fontSize(8).text(index >= 0 ? "".concat(index + 1, ".") : "", marginLeft + 5, position).font('Montserrat/static/Montserrat-MediumItalic.ttf').text(item.toUpperCase(), marginLeft + 50, position).font('Montserrat/static/Montserrat-Light.ttf') // .text(description, position)
  .text(unitCost ? formatCurrency(unitCost) : "", 320, position, {
    width: 90,
    align: "left"
  }).text(quantity, 370, position, {
    width: 90,
    align: "center"
  }).text(lineTotal, 490, position, {
    width: 90,
    align: "left"
  });
  bottomY = position + tableYMargin + 10; // generateHr(doc, bottomY, { width: 0.5 });

  if (index % 2 == 1) {
    doc.rect(marginLeft, y, 500, bottomY - y).fillOpacity(0.2).fill(taxMapRedBackground).stroke();
    doc.fillOpacity(1);
    doc.fillColor(darkGray);
  }

  return bottomY;
}

function generateBaseTableRow(doc, y, label, entry) {
  var position = y + tableYMargin / 2;
  doc // .text(label, 320, position, { width: 90, align: "left" })
  .text(label, 370, position, {
    width: 90,
    align: "left"
  }).text(entry, 490, position, {
    width: 90,
    align: "left"
  });
  generateHr(doc, position + tableYMargin / 2, {
    start: 370,
    width: 0.5
  });
  return position + tableYMargin / 2;
}

function generateTableHeader(doc, y) {
  var position = y;
  generateHr(doc, position);
  position = y + tableYMargin;
  doc.fontSize(10).text("NO.", marginLeft, position).text("ITEM", marginLeft + 50, position).text("UNIT COST", 320, position, {
    width: 90,
    align: "left"
  }).text("QTY", 370, position, {
    width: 90,
    align: "center"
  }).text("TOTAL", 490, position, {
    align: "left"
  });
  generateHr(doc, position + tableYMargin + 10);
  return position + tableYMargin + 10;
}

function generateHr(doc, y) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  console.log(options);
  doc.strokeColor(darkGray).lineWidth(options.width ? options.width : 1).moveTo(options.start ? options.start : marginLeft, y).lineTo(550, y).stroke();
}

function formatCurrency(price) {
  return "$ ".concat(price.toFixed(2));
}

generatePdf();