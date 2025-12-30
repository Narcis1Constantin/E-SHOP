import React from "react";
import AccountProfile from "./sections/AccountProfile";
import AccountOrders from "./sections/AccountOrders";
import AccountPremium from "./sections/AccountPremium";
import AccountResetPassword from "./sections/AccountResetPassword";

export default function MyAccountPageView({
                                              activeTab,
                                              setActiveTab,
                                              loading,
                                              user,
                                              setUser,
                                              orders,
                                              message,
                                              handleUpdateSubmit,
                                              handleLogout,
                                              newPassword,
                                              confirmPassword,
                                              setNewPassword,
                                              setConfirmPassword,
                                              handleChangePassword,
                                          }) {
    return (
        <div className="myaccount-wrapper">

            {/* SIDEBAR */}
            <div className="myaccount-sidebar">
                <div
                    className={activeTab === "profile" ? "active-tab" : ""}
                    onClick={() => setActiveTab("profile")}
                >
                    PROFILUL MEU
                </div>

                <div
                    className={activeTab === "orders" ? "active-tab" : ""}
                    onClick={() => setActiveTab("orders")}
                >
                    COMENZI
                </div>

                <div
                    className={activeTab === "premium" ? "active-tab" : ""}
                    onClick={() => setActiveTab("premium")}
                >
                    PREMIUM ACCOUNT
                </div>

                <div
                    className={activeTab === "reset" ? "active-tab" : ""}
                    onClick={() => setActiveTab("reset")}
                >
                    RESETARE PAROLA
                </div>
                <div className="logout-tab" onClick={handleLogout}>
                    DECONECTARE
                </div>
            </div>

            {/* CONȚINUT */}
            <div className="myaccount-content">
                {activeTab === "profile" && <AccountProfile user={user} setUser={setUser} message={message} handleUpdateSubmit={handleUpdateSubmit} />}
                {activeTab === "orders" && <AccountOrders orders={orders} />}
                {activeTab === "premium" && <AccountPremium user={user} />}
                {activeTab === "reset" && (
                    <AccountResetPassword
                        newPassword={newPassword}
                        confirmPassword={confirmPassword}
                        setNewPassword={setNewPassword}
                        setConfirmPassword={setConfirmPassword}
                        handleChangePassword={handleChangePassword}
                        message={message}
                    />
                )}
            </div>

        </div>
    );

}
