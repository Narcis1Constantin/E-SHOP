import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser trebuie folosit într-un UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3002/api/account/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Token invalid sau expirat - logout automat
                throw new Error('Token invalid sau expirat');
            }

            const data = await response.json();
            setUser(data.user);
        } catch (error) {
            console.error('Eroare la încărcarea user-ului:', error);
            // Token invalid - ștergem tot și forțăm logout
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async () => {
        setLoading(true);
        await fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <UserContext.Provider value={{
            user,
            loading,
            isAdmin,
            login,
            logout,
            refreshUser: fetchUser
        }}>
            {children}
        </UserContext.Provider>
    );
};