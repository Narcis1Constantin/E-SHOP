import React, { useState, useEffect } from 'react';
import './FinancingModal.css';

function FinancingModal({ isOpen, onClose, user }) {
    const [amount, setAmount] = useState(5000);
    const [months, setMonths] = useState(12);
    const [monthlyRate, setMonthlyRate] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentPlan, setPaymentPlan] = useState([]);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [formData, setFormData] = useState({
        cnp: '',
        monthlyIncome: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ANNUAL_RATE = 9.9; // 9.9% pe an

    useEffect(() => {
        calculateFinancing();
    }, [amount, months]);

    const calculateFinancing = () => {
        const principal = parseFloat(amount);
        const monthlyInterestRate = (ANNUAL_RATE / 100) / 12;
        const monthlyPayment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) /
            (Math.pow(1 + monthlyInterestRate, months) - 1);

        const total = monthlyPayment * months;

        setMonthlyRate(monthlyPayment);
        setTotalAmount(total);

        const plan = [];
        let remainingBalance = principal;

        for (let i = 1; i <= months; i++) {
            const interestPayment = remainingBalance * monthlyInterestRate;
            const principalPayment = monthlyPayment - interestPayment;
            remainingBalance -= principalPayment;

            plan.push({
                month: i,
                monthlyPayment: monthlyPayment,
                principalPayment: principalPayment,
                interestPayment: interestPayment,
                remainingBalance: Math.max(0, remainingBalance)
            });
        }

        setPaymentPlan(plan);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();

        // Validare CNP
        if (formData.cnp.length !== 13 || !/^\d+$/.test(formData.cnp)) {
            alert('⚠️ CNP-ul trebuie să conțină exact 13 cifre!');
            return;
        }

        // Validare venit
        if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) < 1000) {
            alert('⚠️ Venitul lunar trebuie să fie de minim 1000 Lei!');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');

            const applicationData = {
                fullName: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                cnp: formData.cnp,
                monthlyIncome: parseFloat(formData.monthlyIncome),
                amount: parseFloat(amount),
                months: months,
                monthlyRate: parseFloat(monthlyRate.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                interestRate: ANNUAL_RATE
            };

            console.log('Trimit datele:', applicationData); // Debug

            const response = await fetch('http://localhost:3002/api/financing/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(applicationData)
            });

            const result = await response.json();
            console.log('Răspuns server:', result); // Debug

            if (!response.ok) {
                throw new Error(result.error || 'Eroare la trimiterea cererii');
            }

            alert('✅ Cererea ta a fost înregistrată cu succes!\n\nTe vom contacta în maxim 24 de ore pentru finalizarea contractului.\n\nVei primi un email de confirmare în curând.');

            // Reset form
            setFormData({
                cnp: '',
                monthlyIncome: ''
            });
            setShowApplicationForm(false);
            onClose();

        } catch (error) {
            console.error('Eroare completă:', error);
            alert(`❌ Eroare: ${error.message}\n\nTe rugăm să încerci din nou sau contactează suportul.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="financing-modal-overlay" onClick={onClose}>
            <div className="financing-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="financing-header">
                    <h2>{showApplicationForm ? 'Formular de aplicare' : 'Calculator Finanțare'}</h2>
                    <button className="close-modal-btn" onClick={onClose}>✕</button>
                </div>

                {!showApplicationForm ? (
                    <>
                        <div className="financing-body" onClick={(e) => e.stopPropagation()}>
                            {/* Calculator Section */}
                            <div className="calculator-section">
                                <div className="input-group">
                                    <label>Suma dorită (Lei)</label>
                                    <input
                                        type="number"
                                        min="500"
                                        max="50000"
                                        step="100"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="amount-input"
                                    />
                                    <input
                                        type="range"
                                        min="500"
                                        max="50000"
                                        step="100"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="amount-slider"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Perioada (luni)</label>
                                    <div className="months-selector">
                                        {[3, 6, 12, 24, 36].map(m => (
                                            <button
                                                key={m}
                                                className={`month-btn ${months === m ? 'active' : ''}`}
                                                onClick={() => setMonths(m)}
                                            >
                                                {m} luni
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="results-section">
                                    <div className="result-card">
                                        <span className="result-label">Rata lunară</span>
                                        <span className="result-value">{monthlyRate.toFixed(2)} Lei</span>
                                    </div>
                                    <div className="result-card">
                                        <span className="result-label">Total de plată</span>
                                        <span className="result-value">{totalAmount.toFixed(2)} Lei</span>
                                    </div>
                                    <div className="result-card">
                                        <span className="result-label">Dobândă totală</span>
                                        <span className="result-value">{(totalAmount - amount).toFixed(2)} Lei</span>
                                    </div>
                                    <div className="result-card">
                                        <span className="result-label">Dobândă anuală</span>
                                        <span className="result-value">{ANNUAL_RATE}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Plan Table */}
                            <div className="payment-plan-section">
                                <h3>Plan de plată lunar</h3>
                                <div className="payment-table-container">
                                    <table className="payment-table">
                                        <thead>
                                        <tr>
                                            <th>Luna</th>
                                            <th>Rată lunară</th>
                                            <th>Principal</th>
                                            <th>Dobândă</th>
                                            <th>Rest de plată</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {paymentPlan.map((row) => (
                                            <tr key={row.month}>
                                                <td>{row.month}</td>
                                                <td>{row.monthlyPayment.toFixed(2)} Lei</td>
                                                <td>{row.principalPayment.toFixed(2)} Lei</td>
                                                <td>{row.interestPayment.toFixed(2)} Lei</td>
                                                <td>{row.remainingBalance.toFixed(2)} Lei</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="financing-info">
                                <p><strong>Informații importante:</strong></p>
                                <ul>
                                    <li>Dobânda anuală fixă: {ANNUAL_RATE}%</li>
                                    <li>Fără avans necesar</li>
                                    <li>Aprobare în 24 ore</li>
                                    <li>Documente necesare: CI/Buletin și dovada veniturilor</li>
                                </ul>
                            </div>
                        </div>

                        <div className="financing-footer">
                            <button className="btn-apply" onClick={() => setShowApplicationForm(true)}>
                                Aplică acum
                            </button>
                            <button className="btn-cancel" onClick={onClose}>
                                Închide
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="financing-body" onClick={(e) => e.stopPropagation()}>
                            <form onSubmit={handleSubmitApplication} className="application-form">
                                <div className="form-summary">
                                    <h3>Detalii finanțare</h3>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <span>Sumă solicitată:</span>
                                            <strong>{amount.toFixed(2)} Lei</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Perioadă:</span>
                                            <strong>{months} luni</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Rată lunară:</span>
                                            <strong>{monthlyRate.toFixed(2)} Lei</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Total de plată:</span>
                                            <strong>{totalAmount.toFixed(2)} Lei</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Date personale</h3>

                                    <div className="form-group-app">
                                        <label>Nume complet</label>
                                        <input
                                            type="text"
                                            value={user?.name || 'Utilizator'}
                                            disabled
                                            className="input-disabled"
                                        />
                                        <small className="input-note">Preluat din contul tău</small>
                                    </div>

                                    <div className="form-row-app">
                                        <div className="form-group-app">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="input-disabled"
                                            />
                                            <small className="input-note">Preluat din contul tău</small>
                                        </div>

                                        <div className="form-group-app">
                                            <label>Telefon</label>
                                            <input
                                                type="tel"
                                                value={user?.phone || 'Nu este setat'}
                                                disabled
                                                className="input-disabled"
                                            />
                                            <small className="input-note">Preluat din contul tău</small>
                                        </div>
                                    </div>

                                    <div className="form-divider"></div>

                                    <h3>Informații suplimentare</h3>

                                    <div className="form-group-app">
                                        <label htmlFor="cnp">CNP *</label>
                                        <input
                                            type="text"
                                            id="cnp"
                                            name="cnp"
                                            value={formData.cnp}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 1234567890123"
                                            minLength="13"
                                            maxLength="13"
                                            required
                                        />
                                        <small className="input-note">Necesar pentru verificarea identității (13 cifre)</small>
                                    </div>

                                    <div className="form-group-app">
                                        <label htmlFor="monthlyIncome">Venit lunar net (Lei) *</label>
                                        <input
                                            type="number"
                                            id="monthlyIncome"
                                            name="monthlyIncome"
                                            value={formData.monthlyIncome}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 3500"
                                            min="1000"
                                            required
                                        />
                                        <small className="input-note">Necesar pentru aprobarea finanțării</small>
                                    </div>
                                </div>

                                <div className="form-info">
                                    <p><strong>📋 Documente necesare (le vei încărca ulterior):</strong></p>
                                    <ul>
                                        <li>Copie CI/Buletin</li>
                                        <li>Adeverință de venit / Extras de cont ultim 3 luni</li>
                                        <li>Dovada domiciliului (factura utilități)</li>
                                    </ul>
                                    <p className="form-disclaimer">
                                        Prin trimiterea acestui formular, confirm că am citit și sunt de acord cu
                                        <a href="#" onClick={(e) => e.preventDefault()}> termenii și condițiile</a> de finanțare.
                                    </p>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-back" onClick={() => setShowApplicationForm(false)}>
                                        ← Înapoi
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Se trimite...' : 'Trimite cererea →'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
export default FinancingModal;