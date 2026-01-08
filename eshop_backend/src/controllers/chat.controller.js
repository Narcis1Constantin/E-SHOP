const pool = require('../db/pool');

/**
 * GUSTI CHATBOT CONTROLLER
 * Integrare cu OpenAI GPT-3.5-turbo pentru asistenta clienti
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * system prompt pentru Gusti
 */
const GUSTI_SYSTEM_PROMPT = `
Ești Gusti, asistentul virtual prietenos al magazinului SmartDepot - un e-commerce românesc care vinde electronice și electrocasnice.

PERSONALITATE:
- Prietenos, empatic și profesional
- Răspunzi ÎNTOTDEAUNA în limba română
- Folosești emoji-uri moderat pentru a fi mai prietenos
- Ești concis dar informativ

INFORMAȚII DESPRE SMARTDEPOT:
- Contact: eshop2025is@gmail.com, 0712 345 678
- Adresă: Strada Olari, Bloc 16, Scara 1, Târgu-Jiu, Gorj
- Program: Luni-Vineri, 9:00-18:00
- Metode de plată: Card online (Stripe), Ramburs la livrare
- Livrare: 2-3 zile lucrătoare (gratuit)
- Retur: 14 zile de la primire

RĂSPUNSURI LA ÎNTREBĂRI FRECVENTE:

1. Urmărire comandă:
   "Poți urmări comanda accesând 'Contul meu' → 'Comenzi'. Acolo vei vedea statusul comenzii tale în timp real."

2. Returnare produs:
   "Ai 14 zile pentru returnare! Accesează 'Contul meu' → 'Comenzi', găsește comanda și apasă 'Returnează comanda'. Vei primi instrucțiuni pe email."

3. Metode de plată:
   "Acceptăm plata cu cardul online (prin Stripe - 100% sigur) și ramburs la livrare (cash sau card la curier)."

4. Livrare:
   "Livrarea standard durează 2-3 zile lucrătoare și este GRATUITĂ! Poți alege livrare la adresă sau la Easybox."

5. Probleme tehnice/Support:
   "Pentru probleme tehnice, contactează-ne la eshop2025is@gmail.com sau 0712 345 678 (L-V, 9-18). Îți răspundem în maxim 24h!"

REGULI:
- Dacă nu știi răspunsul, sugerează contactarea echipei de support
- Nu inventa informații despre produse sau prețuri
- Pentru întrebări despre comenzi specifice, sugerează verificarea în "Contul meu"
- Fii empatic și înțelegător cu problemele clienților
`;

exports.chatWithGusti = async (req, res) => {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user?.uid;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Mesajul nu poate fi gol' });
    }

    if (!OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY lipsește din .env!');
        return res.status(500).json({
            error: 'Chatbot-ul este temporar indisponibil. Te rugăm să ne contactezi la eshop2025is@gmail.com'
        });
    }

    try {
        console.log(`[Gusti] User ${userId} întreabă: "${message}"`);

        let userContext = '';
        if (userId) {
            try {
                const { rows: userData } = await pool.query(
                    'SELECT name, email FROM users WHERE id = $1',
                    [userId]
                );

                if (userData.length > 0) {
                    userContext = `Utilizatorul se numește ${userData[0].name}.`;
                }

                // verificăm daca are comenzi recente
                const { rows: recentOrders } = await pool.query(
                    `SELECT COUNT(*) as order_count, MAX(created_at) as last_order 
                     FROM orders WHERE user_id = $1`,
                    [userId]
                );

                if (recentOrders[0].order_count > 0) {
                    userContext += ` Are ${recentOrders[0].order_count} comenzi plasate.`;
                }
            } catch (dbErr) {
                console.error('Eroare la obținere context user:', dbErr);
            }
        }

        // construim istoric conversație pentru OpenAI
        const messages = [
            {
                role: 'system',
                content: GUSTI_SYSTEM_PROMPT + (userContext ? `\n\nCONTEXT USER: ${userContext}` : '')
            },
            ...conversationHistory.slice(-8).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        // apel catre OpenAI API
        const openaiResponse = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0.3
            })
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error('Eroare OpenAI API:', errorData);
            throw new Error('Eroare la comunicare cu OpenAI');
        }

        const data = await openaiResponse.json();
        const assistantMessage = data.choices[0].message.content;

        console.log(`[Gusti] Răspuns: "${assistantMessage.substring(0, 100)}..."`);

        try {
            await pool.query(
                `INSERT INTO chat_logs (user_id, user_message, bot_response, created_at)
                 VALUES ($1, $2, $3, NOW())`,
                [userId || null, message, assistantMessage]
            );
        } catch (logErr) {
            console.error('Eroare salvare chat log:', logErr);
        }

        res.json({
            response: assistantMessage,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Gusti] Eroare procesare chat:', error);
        res.status(500).json({
            error: 'Ne pare rău, am întâmpinat o problemă! Te rugăm să ne contactezi direct la eshop2025is@gmail.com sau 0712 345 678.'
        });
    }
};


exports.getChatStats = async (req, res) => {
    try {
        const { rows: stats } = await pool.query(`
            SELECT 
                COUNT(*) as total_conversations,
                COUNT(DISTINCT user_id) as unique_users,
                DATE(created_at) as date,
                COUNT(*) as daily_count
            FROM chat_logs
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        res.json(stats);
    } catch (error) {
        console.error('Eroare statistici chat:', error);
        res.status(500).json({ error: 'Eroare la încărcare statistici' });
    }
};