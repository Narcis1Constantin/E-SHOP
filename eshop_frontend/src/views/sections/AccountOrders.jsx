import React, { useState } from "react";

export default function AccountOrders({ orders }) {
    const [expandedOrderId, setExpandedOrderId] = useState(null);

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

                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}