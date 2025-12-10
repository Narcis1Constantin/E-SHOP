import React from "react";

export default function AccountOrders({ orders }) {
    return (
        <div className="auth-container" style={{ width: "100%" }}>
            <div className="auth-header">
                <h1>Comenzile mele</h1>
            </div>

            <div className="form-panel">
                {orders.length === 0 && (
                    <p style={{ fontSize: "18px", marginTop: "10px" }}>
                        Nu există comenzi.
                    </p>
                )}

                {orders.map((order) => (
                    <div key={order.id} className="order-card">
                        <h2>Comanda #{order.id}</h2>
                        <p>Status: {order.status}</p>
                        <p>Total: {order.total} lei</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
