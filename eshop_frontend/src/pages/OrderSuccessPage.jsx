import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShopFacade } from '../hooks/useShopFacade';

export default function OrderSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkPaymentStatus } = useShopFacade();

    const [loading, setLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            setError('Sesiune invalidă');
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                const result = await checkPaymentStatus(sessionId);

                if (result && result.paymentStatus === 'paid') {
                    setPaymentInfo(result);
                } else {
                    setError('Plata nu a fost confirmată');
                }
            } catch (err) {
                setError('Eroare la verificarea plății');
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [searchParams, checkPaymentStatus]);

    if (loading) {
        return (
            <div className="success-page-wrapper">
                <div className="success-container loading">
                    <div className="loader"></div>
                    <p>Verificăm plata ta...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="success-page-wrapper">
                <div className="success-container error">
                    <div className="icon">❌</div>
                    <h1>Oops!</h1>
                    <p>{error}</p>
                    <button onClick={() => navigate('/shop')} className="btn-primary">
                        Înapoi la magazin
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="success-page-wrapper">
            <div className="success-container">
                <div className="icon success">✅</div>
                <h1>Plată Reușită!</h1>
                <p className="success-message">
                    Mulțumim pentru comandă! Plata ta a fost procesată cu succes.
                </p>

                {paymentInfo && (
                    <div className="order-details">
                        <h3>Detalii comandă:</h3>
                        <p><strong>Comandă:</strong> #{paymentInfo.orderId}</p>
                        <p><strong>Email:</strong> {paymentInfo.email}</p>
                    </div>
                )}

                <div className="success-info">
                    <p>📧 Vei primi un email de confirmare cu factura atașată.</p>
                    <p>📦 Comanda ta va fi procesată în cel mai scurt timp.</p>
                </div>

                <div className="success-actions">
                    <button onClick={() => navigate('/my-account')} className="btn-primary">
                        Vezi Comenzile Mele
                    </button>
                    <button onClick={() => navigate('/shop')} className="btn-secondary">
                        Continuă Cumpărăturile
                    </button>
                </div>
            </div>

            <style jsx>{`
                .success-page-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                }

                .success-container {
                    background: white;
                    border-radius: 20px;
                    padding: 50px;
                    max-width: 600px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .success-container.loading {
                    padding: 80px 50px;
                }

                .icon {
                    font-size: 80px;
                    margin-bottom: 20px;
                }

                .icon.success {
                    animation: scaleIn 0.5s ease;
                }

                @keyframes scaleIn {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }

                h1 {
                    font-size: 32px;
                    color: #333;
                    margin-bottom: 15px;
                }

                .success-message {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 30px;
                }

                .order-details {
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 30px 0;
                    text-align: left;
                }

                .order-details h3 {
                    margin-top: 0;
                    color: #333;
                }

                .order-details p {
                    margin: 10px 0;
                    color: #666;
                }

                .success-info {
                    background: #e8f5e9;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }

                .success-info p {
                    margin: 10px 0;
                    color: #2e7d32;
                }

                .success-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 30px;
                }

                .btn-primary, .btn-secondary {
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                    font-size: 16px;
                }

                .btn-primary {
                    background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }

                .btn-secondary {
                    background: white;
                    color: #667eea;
                    border: 2px solid #667eea;
                }

                .btn-secondary:hover {
                    background: #667eea;
                    color: white;
                }

                .loader {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error {
                    border-top: 5px solid #f44336;
                }

                @media (max-width: 768px) {
                    .success-container {
                        padding: 30px 20px;
                    }

                    .success-actions {
                        flex-direction: column;
                    }

                    .btn-primary, .btn-secondary {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}