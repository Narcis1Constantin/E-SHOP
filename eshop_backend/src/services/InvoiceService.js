const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
    /**
     * Generează o factură PDF pentru o comandă
     * @param {Object} orderData - Datele comenzii
     * @returns {String} - Path către fișierul PDF generat
     */
    async generateInvoice(orderData) {
        const { orderId, customerName, email, address, items, totalCents, createdAt } = orderData;

        // Creăm directorul pentru facturi dacă nu există
        const invoicesDir = path.join(__dirname, '../../invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const fileName = `factura_${orderId}_${Date.now()}.pdf`;
        const filePath = path.join(invoicesDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                // Creăm documentul PDF
                const doc = new PDFDocument({ margin: 50 });
                const stream = fs.createWriteStream(filePath);

                doc.pipe(stream);

                // === HEADER FACTURĂ ===
                doc
                    .fontSize(20)
                    .fillColor('#FF6B35')
                    .text('SMARTDEPOT', 50, 50)
                    .fontSize(10)
                    .fillColor('#666666')
                    .text('E-Shop Online', 50, 75)
                    .text('www.smartdepot.ro', 50, 90)
                    .text('contact@smartdepot.ro', 50, 105);

                // Titlu FACTURĂ
                doc
                    .fontSize(24)
                    .fillColor('#000000')
                    .text('FACTURĂ', 400, 50, { align: 'right' });

                doc
                    .fontSize(10)
                    .fillColor('#666666')
                    .text(`Nr. Comandă: #${orderId}`, 400, 80, { align: 'right' })
                    .text(`Data: ${new Date(createdAt).toLocaleDateString('ro-RO')}`, 400, 95, { align: 'right' });

                // Linie separatoare
                doc
                    .moveTo(50, 130)
                    .lineTo(550, 130)
                    .strokeColor('#DDDDDD')
                    .stroke();

                // === DATE CLIENT ===
                doc
                    .fontSize(12)
                    .fillColor('#000000')
                    .text('Date Client:', 50, 150);

                doc
                    .fontSize(10)
                    .fillColor('#333333')
                    .text(`Nume: ${customerName || 'Client'}`, 50, 170)
                    .text(`Email: ${email}`, 50, 185)
                    .text(`Adresă: ${address || '-'}`, 50, 200);

                // === TABEL PRODUSE ===
                const tableTop = 250;
                const itemHeight = 25;

                // Header tabel
                doc
                    .fontSize(10)
                    .fillColor('#FFFFFF')
                    .rect(50, tableTop, 500, 25)
                    .fill('#FF6B35');

                doc
                    .fillColor('#FFFFFF')
                    .text('Produs', 60, tableTop + 8)
                    .text('Cantitate', 320, tableTop + 8, { width: 60, align: 'center' })
                    .text('Preț/buc', 400, tableTop + 8, { width: 70, align: 'right' })
                    .text('Total', 480, tableTop + 8, { width: 60, align: 'right' });

                // Produse
                let yPosition = tableTop + 30;
                let subtotal = 0;

                items.forEach((item, index) => {
                    const itemTotal = Number(item.price) * item.quantity;
                    subtotal += itemTotal;

                    // Fundal alternativ pentru rânduri
                    if (index % 2 === 0) {
                        doc
                            .rect(50, yPosition - 5, 500, itemHeight)
                            .fill('#F9F9F9');
                    }

                    doc
                        .fontSize(9)
                        .fillColor('#333333')
                        .text(item.title, 60, yPosition, { width: 240 })
                        .text(item.quantity.toString(), 320, yPosition, { width: 60, align: 'center' })
                        .text(`${Number(item.price).toFixed(2)} Lei`, 400, yPosition, { width: 70, align: 'right' })
                        .text(`${itemTotal.toFixed(2)} Lei`, 480, yPosition, { width: 60, align: 'right' });

                    yPosition += itemHeight;
                });

                // Linie separatoare înainte de total
                yPosition += 10;
                doc
                    .moveTo(50, yPosition)
                    .lineTo(550, yPosition)
                    .strokeColor('#DDDDDD')
                    .stroke();

                // === TOTAL ===
                yPosition += 20;
                doc
                    .fontSize(12)
                    .fillColor('#000000')
                    .text('TOTAL:', 400, yPosition)
                    .fontSize(14)
                    .fillColor('#FF6B35')
                    .text(`${(totalCents / 100).toFixed(2)} Lei`, 480, yPosition, { width: 60, align: 'right' });

                // === FOOTER ===
                doc
                    .fontSize(8)
                    .fillColor('#999999')
                    .text(
                        'Mulțumim pentru achiziție! Pentru întrebări, contactați-ne la contact@smartdepot.ro',
                        50,
                        750,
                        { align: 'center', width: 500 }
                    );

                // Finalizăm documentul
                doc.end();

                stream.on('finish', () => {
                    console.log(`[InvoiceService] Factură generată: ${filePath}`);
                    resolve(filePath);
                });

                stream.on('error', (error) => {
                    console.error('[InvoiceService] Eroare generare PDF:', error);
                    reject(error);
                });

            } catch (error) {
                console.error('[InvoiceService] Eroare creare PDF:', error);
                reject(error);
            }
        });
    }

    /**
     * Șterge fișierul factură (cleanup după trimitere email)
     * @param {String} filePath - Path către fișier
     */
    async deleteInvoice(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[InvoiceService] Factură ștearsă: ${filePath}`);
            }
        } catch (error) {
            console.error('[InvoiceService] Eroare ștergere factură:', error);
        }
    }
}

module.exports = new InvoiceService();