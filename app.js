const PDFDocument = require('pdfkit-table')
const QRCode = require('qrcode')
const uniqid = require('uniqid')
fs = require('fs');
let taxMapRed = '#e0002a'
let taxMapRedLight = '#ff5454'
let taxMapRedBackground = '#ff9191'
let darkGray = "#444444"
let lightGray = "#7a7a7a"
let lightFont = 'Montserrat/static/Montserrat-Light.ttf'
let baseFont = 'Montserrat/static/Montserrat-Medium.ttf'
let boldFont = 'Montserrat/static/Montserrat-Bold.ttf'
let baseItalic = 'Montserrat/static/Montserrat-MediumItalic.ttf'
let semiBoldFont = "Montserrat/static/Montserrat-SemiBold.ttf"

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
        "products": [
            {
                "Name": "Mathilda (ppbk)",
                "Quantity": "124",
                "Price": 5,
                tax: 10,
            },
            {
                "Name": "On Greener Days: A Love Story (ppbk)",
                "Quantity": "14",
                "Price": 75.15,
                tax: 15,
            },
            {
                "Name": "Friendly Skies",
                "Quantity": "14",
                "Price": 12.15,
                tax: 7.5,
            },
            {
                "Name": "When The Cows Come Home And Other Short Stories By Celebrated Author ",
                "Quantity": "14",
                "Price": 75.15,
                tax: 10,
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
    //create invoice pdf
    doc.font(lightFont)
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
        .font(lightFont)
        .text(`no. `, { continued: true })
        .font(baseFont)
        .text(`${invoice.invoiceId}`, { continued: true })
        .font(lightFont)
        .text(`   //   `, { continued: true })
        .font(baseFont)
        .text(`${(new Date(invoice.dateCreated)).toLocaleDateString("en-US")}`,)
        .fillColor(lightGray)
        .moveDown(2)
        .font(baseFont)
        .text("billing from:",)
        .fontSize(10)
        .font(lightFont)
        .text(user.address.address1, { continued: true })
        .text(",  ", { continued: true })
        .text(user.address.address2)
        .image(invoice.qrCode, doc.page.width - marginLeft - 80, 50 + 5, { width: 80 })
        .fontSize(10)
        .moveDown();
}

function generateCustomerInformation(doc, invoice, user) {
    doc.font(lightFont)
        .fillColor(taxMapRed)
        .fontSize(20)
        .text(user.name.toUpperCase(), marginLeft, 180);

    generateHr(doc, 180 + tableYMargin + doc.currentLineHeight());

    const customerInformationTop = 180 + 2 * tableYMargin + doc.currentLineHeight();

    doc
        .fillColor(darkGray)
        .fontSize(10)
        .font(baseFont)
        .text("due", marginLeft, customerInformationTop)
        .font(lightFont)
        .text((new Date(invoice.dateDue)).toLocaleDateString("en-US"), 150, customerInformationTop)
        .font(baseFont)
        .text("balance", marginLeft, customerInformationTop + 35)
        .fontSize(20)
        .fillColor(darkGray)
        .font(baseFont)
        .text(
            formatCurrency(getTotal(invoice)),
            150,
            customerInformationTop + 35
        )
        .fillColor(darkGray)
        .fontSize(10)
        .font(baseFont)
        .text('shipping to:', 300, customerInformationTop)
        .font(lightFont)
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
}

function generateFooter(doc) {
    doc.moveDown(3)
    doc
        .fill(taxMapRedLight)
        .fontSize(12)
        .font(baseFont)
        .text("Thank you for your business!",
            { width: 500, align: "Left" }
        )
        .font(lightFont)
        .fill(darkGray)
        .moveDown()
        .fontSize(10)
        .text(
            "Payment is due within 15 days.")
        .text("Invoice generated by ", { continued: true })
        .fill(taxMapRed)
        .font(lightFont)
        .text('tax', { continued: true })
        .font(boldFont)
        .text('map')

}

let getTotal = (invoice) => {
    let total = 0
    invoice.products.forEach(p => total += getProductTotal(p))
    return total
}

let getProductTotal = (product) => {
    return product.Price * product.Quantity * (1 + product.tax / 100);
}

let getTotalTax = (invoice) => {
    let totalTax = 0
    invoice.products.forEach(p => totalTax += p.Price * p.Quantity * p.tax / 100)
    return totalTax
}



function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;
    let yposition = invoiceTableTop;

    doc.font(lightFont);
    yposition = generateTableHeader(
        doc,
        yposition,
    );
    doc.font(lightFont);


    for (i = 0; i < invoice.products.length; i++) {
        const item = invoice.products[i];
        // position = invoiceTableTop + 2 * tableYMargin + (i + 1) * 30;
        yposition = generateTableRow(
            doc,
            yposition,
            i,
            item
        );
        // generateHr(doc, position + 20);
    }

    // yposition = yposition + 20;
    yposition = generateBaseTableRow(doc, yposition, "subtotal", formatCurrency(invoice.amount))

    yposition = generateBaseTableRow(doc, yposition, `tax`, `${formatCurrency(getTotalTax(invoice))}`)

    // yposition = yposition + 20;
    doc.font(semiBoldFont);
    yposition = generateBaseTableRow(doc, yposition, "balance due", `${formatCurrency(getTotal(invoice))}`)
    doc.font(lightFont);
    doc.x = marginLeft;
}

function generateTableRow(
    doc,
    y,
    index,
    product
    // item,
    // unitCost,
    // quantity,
    // lineTotal
) {
    let yPosition = y + tableYMargin;
    let widthOfItemCell = 205;
    let numLines = Math.ceil((doc.widthOfString(product.Name) / widthOfItemCell) + 0.5); // 0.5 is added buffer for long words needing extra lines
    const itemLineHeight = numLines * doc.currentLineHeight()
    let midCellY = yPosition + itemLineHeight / 2 - doc.currentLineHeight() / 2
    console.log(itemLineHeight)
    doc
        .fontSize(6)
        .text(index >= 0 ? `${index + 1}.` : "", marginLeft + 5, midCellY)
        .font(baseItalic)
        .text(product.Name.toUpperCase(), marginLeft + 50, yPosition, { width: widthOfItemCell })
        .font(lightFont)
        .text(product.Price ? formatCurrency(product.Price) : "", 320, midCellY, { width: 57, align: "left" })
        .text(product.tax ? `${product.tax}%` : "", 377, midCellY, { width: 57, align: "left" })
        .text(product.Quantity, 434, midCellY, { width: 57, align: "left" })
        .text(formatCurrency(getProductTotal(product)), 490, midCellY, { width: 90, align: "left" });
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
    let lineHeight = doc.currentLineHeight();
    doc.text("NO.", marginLeft, position)
        .text("ITEM", marginLeft + 50, position)
        .text("PRICE", 320, position, { width: 57, align: "left" })
        .text("TAX", 377, position, { width: 57, align: "left" })
        .text("QTY", 434, position, { width: 57, align: "left" })
        .text("TOTAL", 490, position, { align: "left" })
        .fontSize(6)
        .text("tax included", 490, position + lineHeight, { align: "left" });

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