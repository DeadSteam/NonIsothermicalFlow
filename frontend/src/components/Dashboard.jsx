import React, { useEffect } from 'react';

const Dashboard = () => {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome to the dashboard!</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;