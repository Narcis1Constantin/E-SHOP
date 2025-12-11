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

    async sendOrderConfirmation(email, orderId, total, items, address) {
        const productsList = items.map(i =>
            `<li>${i.title} x${i.quantity} - ${(i.price * i.quantity).toFixed(2)} Lei</li>`
        ).join('');

        const htmlContent = `
            <h3>Salut! Comanda ta a fost înregistrată.</h3>
            <p><strong>Adresă:</strong> ${address}</p>
            <p><strong>Total:</strong> ${total.toFixed(2)} Lei</p>
            <ul>${productsList}</ul>
        `;

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Confirmare Comandă #${orderId}`,
                html: htmlContent
            });
            console.log(`Email trimis catre ${email}`);
        } catch (err) {
            console.error("Eroare trimitere email:", err);
            // Nu aruncăm eroare aici pentru a nu bloca comanda dacă doar emailul eșuează
        }
    }
}

module.exports = new NotificationService();