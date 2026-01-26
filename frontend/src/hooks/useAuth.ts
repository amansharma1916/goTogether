import { useState, useEffect } from 'react';
import { verifyApi } from '../services/auth';

export default function useAuth() {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        verifyApi(token)
            .then(res => {
                if (res.ok) setIsAuth(true);
                else localStorage.removeItem('token');
            })
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuth(false);
    };

    return { isAuth, loading, logout };
}
