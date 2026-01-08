const nodemailer = require('nodemailer');

// configurare email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendContactMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // validare
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii' });
    }

    // validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email invalid' });
    }

    try {
        console.log(`[Contact] Mesaj nou de la ${name} (${email})`);

        // trimite email căatre SmartDepot
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email, // pentru a putea raspunde direct
            subject: `📩 Contact SmartDepot: ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 20px;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        }
                        .email-header {
                            background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .email-header h1 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .email-body {
                            padding: 30px;
                        }
                        .info-row {
                            margin-bottom: 20px;
                            padding: 15px;
                            background: #f9f9f9;
                            border-radius: 8px;
                        }
                        .info-label {
                            font-weight: 700;
                            color: #fda085;
                            font-size: 14px;
                            margin-bottom: 5px;
                        }
                        .info-value {
                            color: #333;
                            font-size: 16px;
                        }
                        .message-box {
                            background: #fff8f5;
                            border-left: 4px solid #fda085;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 20px;
                        }
                        .email-footer {
                            background: #f9f9f9;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>📩 Mesaj nou de contact</h1>
                            <p style="margin: 5px 0 0; opacity: 0.9;">SmartDepot - Formular Contact</p>
                        </div>
                        
                        <div class="email-body">
                            <div class="info-row">
                                <div class="info-label">👤 Nume:</div>
                                <div class="info-value">${name}</div>
                            </div>
                            
                            <div class="info-row">
                                <div class="info-label">📧 Email:</div>
                                <div class="info-value">
                                    <a href="mailto:${email}" style="color: #fda085; text-decoration: none;">
                                        ${email}
                                    </a>
                                </div>
                            </div>
                            
                            <div class="info-row">
                                <div class="info-label">📝 Subiect:</div>
                                <div class="info-value">${subject}</div>
                            </div>
                            
                            <div class="message-box">
                                <div class="info-label">💬 Mesaj:</div>
                                <p style="color: #333; line-height: 1.6; margin: 10px 0 0;">
                                    ${message.replace(/\n/g, '<br>')}
                                </p>
                            </div>
                        </div>
                        
                        <div class="email-footer">
                            <p style="margin: 0;">
                                Pentru a răspunde, apasă pe adresa de email sau folosește butonul Reply
                            </p>
                            <p style="margin: 10px 0 0; color: #999;">
                                SmartDepot © ${new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        // trimite email de confirmare catre client
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Am primit mesajul tău - SmartDepot',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 20px;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        }
                        .email-header {
                            background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
                            color: white;
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .email-body {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .checkmark {
                            font-size: 60px;
                            color: #4caf50;
                            margin-bottom: 20px;
                        }
                        h2 {
                            color: #333;
                            margin: 0 0 15px;
                        }
                        p {
                            color: #666;
                            line-height: 1.6;
                        }
                        .contact-info {
                            background: #f9f9f9;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1 style="margin: 0;">SmartDepot</h1>
                            <p style="margin: 10px 0 0; opacity: 0.9;">Mulțumim pentru mesaj!</p>
                        </div>
                        
                        <div class="email-body">
                            <div class="checkmark">✓</div>
                            <h2>Mesajul tău a fost primit!</h2>
                            <p>Bună ${name},</p>
                            <p>
                                Am primit mesajul tău și îți mulțumim că ne-ai contactat.<br>
                                Echipa noastră îți va răspunde în maxim <strong>24 de ore</strong>.
                            </p>
                            
                            <div class="contact-info">
                                <p style="margin: 0; font-weight: 600; color: #fda085;">
                                    Pentru urgențe, ne poți contacta direct:
                                </p>
                                <p style="margin: 10px 0 0;">
                                    📧 eshop2025is@gmail.com<br>
                                    📞 0712 345 678 (L-V, 9-18)
                                </p>
                            </div>
                            
                            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                                Cu drag,<br>
                                <strong>Echipa SmartDepot</strong>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        console.log(`[Contact] Email trimis cu succes de la ${name}`);

        res.json({
            success: true,
            message: 'Mesajul a fost trimis cu succes! Vei primi un răspuns în maxim 24 de ore.'
        });

    } catch (error) {
        console.error('[Contact] Eroare trimitere email:', error);
        res.status(500).json({
            error: 'Ne pare rău, a apărut o eroare la trimiterea mesajului. Te rugăm să ne contactezi direct la eshop2025is@gmail.com'
        });
    }
};