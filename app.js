const PDFDocument = require('pdfkit-table')
const QRCode = require('qrcode')
const uniqid = require('uniqid')
fs = require('fs');
let taxMapRed = '#e0002a'
let taxMapRedLight = '#ff5454';
let taxMapRedBackground = '#ff9191';
let darkGray = "#444444";
let lightGray = "#7a7a7a"

let doc = new PDFDocument()
doc.pipe(fs.createWriteStream('output.pdf'));
let marginLeft = 50;
let tableYMargin = 15;

const createInvoice = async () => {
    //generate invoice data
    let invoice = {
        "invoiceId": "",
        "personId": "7eb85ba7-6a01-4555-9a2e-cf9acc96a97a",
        "customer": "Sara Fielding",
        "dateCreated": "2022-05-30T15:30:54.243Z",
        "dateDue": "2022-06-04T00:00:00.000Z",
        "paid": false,
        "amount": 620,
        "qrCode": "",
        tax: 10,
        "products": [
            {
                "Name": "Mathilda (ppbk)",
                "Quantity": "124",
                "Price": 5,
            },
            {
                "Name": "On Greener Days: A Love Story (ppbk)",
                "Quantity": "14",
                "Price": 75.15,
            },
            {
                "Name": "Friendly Skies",
                "Quantity": "14",
                "Price": 12.15,
            },
            {
                "Name": "When The Cows Come Home And Other Short Stories By Celebrated Author ",
                "Quantity": "14",
                "Price": 75.15,
            }
        ],
        "shipping": {
            name: "Cecelia Auerswald",
            "city": "Greenwood Corners",
            "street": "123 Greenwood Center",
            "zip": "12455",
            state: "Connecticut",
            country: "United States"
        }
    }
    invoice.amount = 0
    invoice.products.forEach(p => {
        invoice.amount += p.Quantity * p.Price;
    })
    invoice.invoiceId = '4356-21' //uniqid()
    const base64Result = await QRCode.toDataURL(
        `${process.env.BASE_URL}/invoices/${invoice.invoiceId}`
    )
    invoice.qrCode = base64Result
    return invoice
}

let generatePdf = async () => {
    let invoice = await createInvoice();
    let user = {
        id: "eu-west-2:1a9fadec-44bd-4eca-b6df-a598232279f5",
        name: "Mary Garth Inc.",
        address: {
            address1: "7272 Lite Ave. #1244",
            address2: 'New York, NY, 10025',
        }
    }
    doc.font('Montserrat/static/Montserrat-Light.ttf')
    //create invoice pdf
    generateHeader(doc, invoice, user)
    generateCustomerInformation(doc, invoice, user);
    generateInvoiceTable(doc, invoice)
    generateFooter(doc)
    doc.end()
};

function generateHeader(doc, invoice, user) {
    doc.rect(doc.page.width - marginLeft - 80 - 5, 50, 90, 90).strokeColor(taxMapRed).stroke()

    doc.fontSize(20)
        .fillColor(taxMapRed)
        .text("______ I N V O I C E", 50, 50, { align: 'left' })
        .moveDown(0.2)
        .fontSize(10)
        .fillColor(lightGray)
        .font('Montserrat/static/Montserrat-Light.ttf')
        .text(`no. `, { continued: true })
        .font('Montserrat/static/Montserrat-Medium.ttf')
        .text(`${invoice.invoiceId}`, { continued: true })
        .font('Montserrat/static/Montserrat-Light.ttf')
        .text(`   //   `, { continued: true })
        .font('Montserrat/static/Montserrat-Medium.ttf')
        .text(`${(new Date(invoice.dateCreated)).toLocaleDateString("en-US")}`,)
        .fillColor(lightGray)
        .moveDown(2)
        .font("Montserrat/static/Montserrat-Medium.ttf")
        .text("billing from:   ",)
        .fontSize(10)
        .font("Montserrat/static/Montserrat-Light.ttf")
        .text(user.address.address1, { continued: true })
        .text("  ", { continued: true })
        .text(user.address.address2)
        .image(invoice.qrCode, doc.page.width - marginLeft - 80, 50 + 5, { width: 80 })


        .fontSize(10)
        .moveDown();
}

function generateCustomerInformation(doc, invoice, user) {
    doc.font('Montserrat/static/Montserrat-Light.ttf')
    doc
        .fillColor(taxMapRed)
        .fontSize(20)
        .text(user.name.toUpperCase(), marginLeft, 180);

    generateHr(doc, 205);

    const customerInformationTop = 220;

    doc
        .fillColor(darkGray)
        .fontSize(10)
        // .font("Montserrat/static/Montserrat-Medium.ttf")
        // .text("Invoice Number:", marginLeft, customerInformationTop)
        // .font("Montserrat/static/Montserrat-Light.ttf")
        // .text(invoice.invoiceId, 150, customerInformationTop)
        // .text("Invoice Created:", marginLeft, customerInformationTop + 15)
        // .text((new Date(invoice.dateCreated)).toLocaleDateString("en-US"), 150, customerInformationTop + 15)
        .font("Montserrat/static/Montserrat-Medium.ttf")
        .text("due", marginLeft, customerInformationTop)
        .font("Montserrat/static/Montserrat-Light.ttf")
        .text((new Date(invoice.dateDue)).toLocaleDateString("en-US"), 150, customerInformationTop)
        .font("Montserrat/static/Montserrat-Medium.ttf")
        .text("balance", marginLeft, customerInformationTop + 35)
        .fontSize(20)
        .fillColor(darkGray)
        .font('Montserrat/static/Montserrat-Medium.ttf')
        .text(
            formatCurrency(getTotal(invoice)),
            150,
            customerInformationTop + 35
        )
        .fillColor(darkGray)
        .fontSize(10)
        .font("Montserrat/static/Montserrat-Medium.ttf")
        .text('shipping to:', 300, customerInformationTop)
        .font("Montserrat/static/Montserrat-Light.ttf")
        .text(invoice.shipping.name, 300, customerInformationTop + 15)
        .text(invoice.shipping.street, 300, customerInformationTop + 30)
        .text(
            invoice.shipping.city +
            ", " +
            invoice.shipping.state +
            ", " +
            invoice.shipping.country,
            300,
            customerInformationTop + 45
        )
        .moveDown();

    // generateHr(doc, 267);
}

function generateFooter(doc) {
    doc.moveDown(3)
    doc
        .fill(taxMapRedLight)
        .fontSize(12)
        .font('Montserrat/static/Montserrat-Medium.ttf')
        .text("Thank you for your business!",
            { width: 500, align: "Left" }
        )
        .font('Montserrat/static/Montserrat-Light.ttf')
        .fill(darkGray)
        .moveDown()
        .fontSize(10)
        .text(
            "Payment is due within 15 days.")
        .text("Invoice generated by ", { continued: true })
        .fill(taxMapRed)
        .font('Montserrat/static/Montserrat-Light.ttf')
        .text('tax', { continued: true })
        .font('Montserrat/static/Montserrat-Bold.ttf')
        .text('map')

}

let getTotal = (invoice) => (invoice.amount + invoice.amount * invoice.tax / 100);


function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;
    let yposition = invoiceTableTop;

    doc.font("Montserrat/static/Montserrat-Light.ttf");
    yposition = generateTableHeader(
        doc,
        yposition,
    );
    doc.font("Montserrat/static/Montserrat-Light.ttf");


    for (i = 0; i < invoice.products.length; i++) {
        const item = invoice.products[i];
        // position = invoiceTableTop + 2 * tableYMargin + (i + 1) * 30;
        yposition = generateTableRow(
            doc,
            yposition,
            i,
            item.Name,
            item.Price,
            item.Quantity,
            formatCurrency(item.Price * item.Quantity),
            i
        );
        // generateHr(doc, position + 20);
    }

    // yposition = yposition + 20;
    yposition = generateBaseTableRow(doc, yposition, "subtotal", formatCurrency(invoice.amount))

    yposition = generateBaseTableRow(doc, yposition, `tax (${invoice.tax}%)`, `${formatCurrency(invoice.tax / 100 * invoice.amount)}`)

    // yposition = yposition + 20;
    doc.font("Montserrat/static/Montserrat-SemiBold.ttf");
    yposition = generateBaseTableRow(doc, yposition, "balance due", `${formatCurrency(getTotal(invoice))}`)
    doc.font("Montserrat/static/Montserrat-Light.ttf");
    doc.x = marginLeft;
}

function generateTableRow(
    doc,
    y,
    index,
    item,
    unitCost,
    quantity,
    lineTotal
) {
    let yPosition = y + tableYMargin;
    let widthOfItemCell = 205;
    let numLines = Math.ceil((doc.widthOfString(item) / widthOfItemCell) + 0.5); // 0.5 is added buffer for long words needing extra lines
    const itemLineHeight = numLines * doc.currentLineHeight()
    let midCellY = yPosition + itemLineHeight / 2 - doc.currentLineHeight() / 2
    console.log(itemLineHeight)
    doc
        .fontSize(6)
        .text(index >= 0 ? `${index + 1}.` : "", marginLeft + 5, midCellY)
        .font('Montserrat/static/Montserrat-MediumItalic.ttf')
        .text(item.toUpperCase(), marginLeft + 50, yPosition, { width: widthOfItemCell })
        .font('Montserrat/static/Montserrat-Light.ttf')
        .text(unitCost ? formatCurrency(unitCost) : "", 320, midCellY, { width: 90, align: "left" })
        .text(quantity, 370, midCellY, { width: 90, align: "center" })
        .text(lineTotal, 490, midCellY, { width: 90, align: "left" });
    bottomY = yPosition + tableYMargin + itemLineHeight;
    // generateHr(doc, bottomY, { width: 0.5 });
    if (index % 2 == 1) {
        doc.rect(marginLeft, y, 500, bottomY - y)
            .fillOpacity(0.2).fill(taxMapRedBackground).stroke()
        doc.fillOpacity(1)
        doc.fillColor(darkGray)
    }
    return bottomY;

}

function generateBaseTableRow(
    doc,
    y,
    label,
    entry
) {
    let position = y + tableYMargin;
    doc
        // .text(label, 320, position, { width: 90, align: "left" })
        .text(label, 370, position, { width: 90, align: "left" })
        .text(entry, 490, position, { width: 90, align: "left" });

    generateHr(doc, position + tableYMargin, { start: 370, width: 0.5 });
    return position + tableYMargin / 2;

}

function generateTableHeader(
    doc,
    y
) {
    let position = y
    generateHr(doc, position)
    position = y + tableYMargin;
    doc
        .fontSize(10)
        .text("NO.", marginLeft, position)
        .text("ITEM", marginLeft + 50, position)
        .text("UNIT COST", 320, position, { width: 90, align: "left" })
        .text("QTY", 370, position, { width: 90, align: "center" })
        .text("TOTAL", 490, position, { align: "left" });

    generateHr(doc, position + tableYMargin + 10)
    return position + tableYMargin + 10;
}


function generateHr(doc, y, options = {}) {

    console.log(options)
    doc
        .strokeColor(darkGray)
        .lineWidth(options.width ? options.width : 1)
        .moveTo(options.start ? options.start : marginLeft, y)
        .lineTo(550, y)
        .stroke();
}

const drawVertical = (x) => {
    /* FOR DEBUGGING */
    doc
        .strokeColor(darkGray)
        .lineWidth(1)
        .moveTo(x, 0)
        .lineTo(x, 1000)
        .stroke();
}

function formatCurrency(price) {
    return `$ ${price.toFixed(2)}`;
}

generatePdf()