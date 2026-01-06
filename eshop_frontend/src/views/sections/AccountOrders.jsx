import React, { useState } from "react";

export default function AccountOrders({ orders }) {
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [returnReason, setReturnReason] = useState('');
    const [returnDetails, setReturnDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // DEBUG - Să vedem ce primim
    console.log('AccountOrders - orders received:', orders);
    console.log('AccountOrders - orders length:', orders?.length);
    console.log('AccountOrders - orders type:', typeof orders);

    const toggleOrder = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // Formatare dată
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Traducere status
    const getStatusLabel = (status) => {
        const statusMap = {
            'placed': 'Plasată',
            'paid': 'Plătită',
            'shipped': 'Expediată',
            'delivered': 'Livrată',
            'canceled': 'Anulată'
        };
        return statusMap[status] || status;
    };

    // Deschide modal retur
    const handleOpenReturnModal = (order) => {
        setSelectedOrder(order);
        setReturnReason('');
        setReturnDetails('');
        setShowReturnModal(true);
    };

    // Închide modal retur
    const handleCloseReturnModal = () => {
        setShowReturnModal(false);
        setSelectedOrder(null);
        setReturnReason('');
        setReturnDetails('');
    };

    // Trimite cerere retur
    const handleSubmitReturn = async (e) => {
        e.preventDefault();

        if (!returnReason) {
            alert('Te rugăm să selectezi un motiv pentru retur!');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3002/api/returns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: selectedOrder.id,
                    reason: returnReason,
                    details: returnDetails
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Eroare la trimiterea cererii de retur');
            }

            alert('✅ ' + data.message + '\n\nVei primi un email de confirmare în curând.');
            handleCloseReturnModal();

            // Reîncarcă pagina pentru a actualiza statusul comenzii
            window.location.reload();

        } catch (error) {
            console.error('Eroare:', error);
            alert('❌ ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Verifică dacă comanda poate fi returnată
    const canReturnOrder = (order) => {
        // Nu se poate returna dacă:
        // 1. Comanda NU e plătită (doar comenzile paid pot fi returnate)
        if (order.status !== 'paid') return false;

        // 2. Există deja un retur pentru această comandă
        if (order.return_status) return false;

        return true;
    };

    // Traducere motiv retur
    const getReturnReasonLabel = (reason) => {
        const reasonMap = {
            'defect': 'Produs defect',
            'mismatch': 'Nu corespunde descrierii',
            'changed_mind': 'Am schimbat decizia',
            'other': 'Altul'
        };
        return reasonMap[reason] || reason;
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="orders-wrapper">
                <div className="orders-header">
                    <h1>Comenzile mele</h1>
                </div>
                <div className="orders-content">
                    <p className="no-orders-text">
                        Nu ai nicio comandă încă.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-wrapper">
            <div className="orders-header">
                <h1>Comenzile mele</h1>
            </div>

            <div className="orders-content">
                <div className="orders-list">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''}`}
                        >
                            {/* HEADER COMANDĂ - CLICKABLE */}
                            <div
                                className="order-header-clickable"
                                onClick={() => toggleOrder(order.id)}
                            >
                                <div className="order-main-info">
                                    <h3 className="order-title">
                                        Comanda #{order.id}
                                    </h3>
                                    <div className="order-summary">
                                        <span className="order-status-badge">
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <span className="order-price">
                                            {order.total || (order.total_cents ? (order.total_cents / 100).toFixed(2) : '0')} lei
                                        </span>
                                    </div>
                                </div>
                                <span className="order-date">
                                    {formatDate(order.created_at)}
                                </span>
                                <span className="expand-icon">
                                    {expandedOrderId === order.id ? '▼' : '▶'}
                                </span>
                            </div>

                            {/* DETALII EXPANDATE */}
                            {expandedOrderId === order.id && (
                                <div className="order-details-expanded">

                                    {/* PRODUSE COMANDATE */}
                                    <div className="details-section">
                                        <h4>
                                            <i>📦</i> Produse comandate
                                        </h4>
                                        {order.items && order.items.length > 0 ? (
                                            <div className="products-list">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="product-item">
                                                        <div className="product-info">
                                                            <span className="product-name">
                                                                {item.title || item.product_title || item.product_name || `Produs #${item.product_id}`}
                                                            </span>
                                                            <span className="product-quantity">
                                                                x{item.quantity}
                                                            </span>
                                                        </div>
                                                        <span className="product-price">
                                                            {item.price || (item.price_cents ? (item.price_cents / 100).toFixed(2) : '0')} lei
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-data">Nu sunt disponibile detalii despre produse.</p>
                                        )}
                                    </div>

                                    {/* DATE LIVRARE */}
                                    <div className="details-section">
                                        <h4>
                                            <i>🚚</i> Date livrare
                                        </h4>
                                        <div className="delivery-info">
                                            <p>
                                                <strong>Data comenzii:</strong> {formatDate(order.created_at)}
                                            </p>
                                            {order.address && (
                                                <p>
                                                    <strong>Adresă de livrare:</strong> {order.address}
                                                </p>
                                            )}
                                            {!order.address && (
                                                <p className="no-data">Nu este disponibilă adresa de livrare.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* BUTON RETUR */}
                                    <div className="details-section">
                                        {canReturnOrder(order) ? (
                                            <button
                                                className="btn-return-order"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenReturnModal(order);
                                                }}
                                            >
                                                🔄 Returnează comanda
                                            </button>
                                        ) : order.return_status ? (
                                            <div className="return-status-info">
                                                <span className={`return-status-badge status-${order.return_status}`}>
                                                    {order.return_status === 'requested' && '⏳ Retur solicitat'}
                                                    {order.return_status === 'pending' && '⏳ Retur în așteptare'}
                                                    {order.return_status === 'approved' && '✅ Retur aprobat'}
                                                    {order.return_status === 'rejected' && '❌ Retur respins'}
                                                    {order.return_status === 'completed' && '✔️ Retur finalizat'}
                                                </span>
                                                <p className="return-status-text">
                                                    {order.return_status === 'requested' && 'Cererea de retur este în curs de procesare.'}
                                                    {order.return_status === 'pending' && 'Cererea de retur este în curs de procesare.'}
                                                    {order.return_status === 'approved' && 'Returul a fost aprobat! Vei primi instrucțiuni în curând.'}
                                                    {order.return_status === 'rejected' && 'Returul a fost respins. Verifică email-ul pentru detalii.'}
                                                    {order.return_status === 'completed' && 'Returul a fost finalizat cu succes!'}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>

                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL RETUR */}
            {showReturnModal && selectedOrder && (
                <div className="modal-overlay-return" onClick={handleCloseReturnModal}>
                    <div className="modal-content-return" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-return">
                            <h3>Returnează comanda #{selectedOrder.id}</h3>
                            <button className="close-modal-btn" onClick={handleCloseReturnModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmitReturn} className="return-form">
                            <div className="form-group-return">
                                <label htmlFor="returnReason">Motiv retur *</label>
                                <select
                                    id="returnReason"
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    required
                                >
                                    <option value="">Selectează motivul</option>
                                    <option value="defect">Produs defect</option>
                                    <option value="mismatch">Nu corespunde descrierii</option>
                                    <option value="changed_mind">Am schimbat decizia</option>
                                    <option value="other">Altul</option>
                                </select>
                            </div>

                            <div className="form-group-return">
                                <label htmlFor="returnDetails">Detalii suplimentare</label>
                                <textarea
                                    id="returnDetails"
                                    value={returnDetails}
                                    onChange={(e) => setReturnDetails(e.target.value)}
                                    rows="4"
                                    placeholder="Descrie problema sau motivul returului..."
                                />
                            </div>

                            <div className="return-info-box">
                                <p><strong>ℹ️ Informații importante:</strong></p>
                                <ul>
                                    <li>Vei primi un email de confirmare</li>
                                    <li>Răspuns în maxim 24-48 ore</li>
                                    <li>Produsele trebuie returnate în ambalajul original</li>
                                </ul>
                            </div>

                            <div className="modal-actions-return">
                                <button type="button" className="btn-cancel-return" onClick={handleCloseReturnModal}>
                                    Anulează
                                </button>
                                <button type="submit" className="btn-submit-return" disabled={isSubmitting}>
                                    {isSubmitting ? 'Se trimite...' : 'Trimite cererea'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}