import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-darkBg transition-colors duration-300 font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col lg:ml-72 transition-all duration-300">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-6 lg:p-8 overflow-y-auto relative scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
