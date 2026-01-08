import React from "react";

export default function AccountPremium({ user }) {
    const PREMIUM_THRESHOLD = 10000;
    const currentPoints = user?.points || 0;
    const isPremium = currentPoints >= PREMIUM_THRESHOLD;
    const pointsNeeded = Math.max(0, PREMIUM_THRESHOLD - currentPoints);
    const progressPercentage = Math.min(100, (currentPoints / PREMIUM_THRESHOLD) * 100);

    return (
        <div className="orders-wrapper">
            <div className="orders-header">
                <h1>Premium Account</h1>
            </div>

            <div className="orders-content premium-content">

                {/* STATUS PREMIUM */}
                <div className="premium-status-card">
                    {isPremium ? (
                        <>
                            <div className="premium-badge active">
                                <span className="badge-icon">⭐</span>
                                <span className="badge-text">CONT PREMIUM ACTIV</span>
                            </div>
                            <p className="premium-message success">
                                Felicitări! Ai acces la toate beneficiile Premium!
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="premium-badge inactive">
                                <span className="badge-icon">🔒</span>
                                <span className="badge-text">CONT STANDARD</span>
                            </div>
                            <p className="premium-message info">
                                Cheltuie încă {pointsNeeded.toLocaleString()} lei pentru Premium!
                            </p>
                        </>
                    )}
                </div>

                {/* PUNCTE ACUMULATE */}
                <div className="points-section">
                    <h3>Total puncte</h3>
                    <div className="points-display">
                        <span className="points-number">{currentPoints.toLocaleString()}</span>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                {!isPremium && (
                    <div className="progress-section">
                        <div className="progress-header">
                            <h3>Progres către Premium</h3>
                            <span className="points-remaining">
                                Încă {pointsNeeded.toLocaleString()} puncte necesare
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <span className="progress-text">
                                    {progressPercentage.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* BENEFICII PREMIUM */}
                <div className="benefits-section">
                    <h3>Beneficii Premium</h3>
                    <div className="benefits-list">
                        <div className={`benefit-item ${isPremium ? 'unlocked' : 'locked'}`}>
                            <span className="benefit-icon">🚚</span>
                            <div className="benefit-info">
                                <h4>Livrare gratuită</h4>
                                <p>Livrare gratuită la toate comenzile</p>
                            </div>
                        </div>
                        <div className={`benefit-item ${isPremium ? 'unlocked' : 'locked'}`}>
                            <span className="benefit-icon">🎁</span>
                            <div className="benefit-info">
                                <h4>Reduceri exclusive</h4>
                                <p>Până la 20% reducere la produse selectate</p>
                            </div>
                        </div>
                        <div className={`benefit-item ${isPremium ? 'unlocked' : 'locked'}`}>
                            <span className="benefit-icon">⚡</span>
                            <div className="benefit-info">
                                <h4>Acces prioritar</h4>
                                <p>Acces anticipat la produse noi</p>
                            </div>
                        </div>
                        <div className={`benefit-item ${isPremium ? 'unlocked' : 'locked'}`}>
                            <span className="benefit-icon">💎</span>
                            <div className="benefit-info">
                                <h4>Puncte bonus</h4>
                                <p>Bonus la fiecare comandă</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CUM SĂ ACUMULEZI PUNCTE */}
                <div className="earn-points-section">
                    <h3>Cum obții Premium?</h3>
                    <div className="earn-methods">
                        <div className="earn-method">
                            <span className="method-icon">🛒</span>
                            <div className="method-info">
                                <h4>Fă comenzi</h4>
                                <p>Cheltuiește 10.000 lei în total pentru Premium</p>
                            </div>
                        </div>
                        <div className="earn-method">
                            <span className="method-icon">📦</span>
                            <div className="method-info">
                                <h4>Toate comenzile contează</h4>
                                <p>Fiecare leu cheltuit te apropie de Premium</p>
                            </div>
                        </div>
                        <div className="earn-method">
                            <span className="method-icon">⭐</span>
                            <div className="method-info">
                                <h4>Premium permanent</h4>
                                <p>Odată obținut, statutul rămâne activ</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}