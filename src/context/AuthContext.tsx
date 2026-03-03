import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    userId: string | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(sessionStorage.getItem('user_id'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleHandshake = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (userId) {
                setIsLoading(false);
                return;
            }

            if (token) {
                try {
                    const response = await fetch('https://api.mantracare.com/user/user-info', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const id = data.user_id?.toString();
                        if (id) {
                            sessionStorage.setItem('user_id', id);
                            setUserId(id);

                            // Clean URL
                            const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]+/, '').replace(/^&/, '?');
                            window.history.replaceState({}, document.title, newUrl);
                        } else {
                            throw new Error('Invalid user_id in response');
                        }
                    } else {
                        throw new Error('Handshake failed');
                    }
                } catch (error) {
                    console.error('Auth error:', error);
                    window.location.href = '/token';
                } finally {
                    setIsLoading(false);
                }
            } else {
                // No token and no session
                window.location.href = '/token';
            }
        };

        handleHandshake();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-heading text-xl">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ userId, isLoading }}>
            {userId ? children : null}
        </AuthContext.Provider>
    );
};
