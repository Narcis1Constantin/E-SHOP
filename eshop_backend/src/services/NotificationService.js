const nodemailer = require("nodemailer");

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    /**
     * EMAIL SIMPLU (fără factură) - pentru comenzi ramburs
     */
    async sendOrderConfirmation(email, orderId, total, items, address) {
        const productsList = items.map(i =>
            `<li>${i.title} x${i.quantity} - ${(i.price * i.quantity).toFixed(2)} Lei</li>`
        ).join('');

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF6B35;">SmartDepot - Confirmare Comandă</h2>
                <p>Salut! Comanda ta <strong>#${orderId}</strong> a fost înregistrată cu succes.</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Detalii comandă:</h3>
                    <p><strong>Adresă livrare:</strong> ${address}</p>
                    <p><strong>Total:</strong> ${total.toFixed(2)} Lei</p>
                </div>
                
                <h3>Produse comandate:</h3>
                <ul>${productsList}</ul>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Vei plăti la livrare (ramburs).
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
                    Mulțumim pentru comandă!<br>
                    Echipa SmartDepot<br>
                    contact@smartdepot.ro
                </p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Confirmare Comandă #${orderId} - SmartDepot`,
                html: htmlContent
            });
            console.log(`[NotificationService] Email trimis către ${email}`);
        } catch (err) {
            console.error("[NotificationService] Eroare trimitere email:", err);
        }
    }

    /**
     * EMAIL CU FACTURĂ PDF ATAȘATĂ (pentru plăți card)
     */
    async sendOrderConfirmationWithInvoice(email, orderId, total, items, address, invoicePath) {
        const productsList = items.map(i =>
            `<li>${i.title} x${i.quantity} - ${(i.price * i.quantity).toFixed(2)} Lei</li>`
        ).join('');

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF6B35;">SmartDepot - Confirmare Comandă și Factură</h2>
                <p>Salut! Mulțumim pentru comandă!</p>
                
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                    <p style="margin: 0; color: #2e7d32;">
                        ✅ Plata a fost procesată cu succes!
                    </p>
                </div>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Detalii comandă #${orderId}:</h3>
                    <p><strong>Adresă livrare:</strong> ${address}</p>
                    <p><strong>Total plătit:</strong> ${total.toFixed(2)} Lei</p>
                </div>
                
                <h3>Produse comandate:</h3>
                <ul>${productsList}</ul>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;">
                        📄 <strong>Factura este atașată la acest email</strong> în format PDF.
                    </p>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Comanda ta va fi procesată în curând și vei primi un email când va fi expediată.
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
                    Mulțumim pentru încredere!<br>
                    Echipa SmartDepot<br>
                    contact@smartdepot.ro
                </p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Confirmare Plată & Factură #${orderId} - SmartDepot`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `Factura_${orderId}.pdf`,
                        path: invoicePath,
                    }
                ]
            });
            console.log(`[NotificationService] Email cu factură trimis către ${email}`);
        } catch (err) {
            console.error("[NotificationService] Eroare trimitere email cu factură:", err);
            throw err;
        }
    }

    /**
     * EMAIL PENTRU UPDATE STATUS RETUR (existent - păstrat)
     */
    async sendReturnStatusUpdate(email, userName, orderId, status, adminNotes) {
        const statusText = {
            'pending': 'în așteptare',
            'approved': 'aprobată',
            'rejected': 'respinsă',
            'completed': 'finalizată'
        };

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF6B35;">Update Cerere Retur</h2>
                <p>Bună ${userName},</p>
                <p>Cererea ta de retur pentru comanda #${orderId} a fost <strong>${statusText[status]}</strong>.</p>
                ${adminNotes ? `<p><strong>Notițe:</strong> ${adminNotes}</p>` : ''}
                ${status === 'approved' ? '<p>Vei primi instrucțiuni pentru returnarea produsului în curând.</p>' : ''}
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                    Mulțumim!<br>
                    Echipa SmartDepot
                </p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Update cerere retur - Comanda #${orderId}`,
                html: htmlContent
            });
            console.log(`[NotificationService] Email update retur trimis către ${email}`);
        } catch (err) {
            console.error("[NotificationService] Eroare trimitere email retur:", err);
        }
    }
}

module.exports = new NotificationService();