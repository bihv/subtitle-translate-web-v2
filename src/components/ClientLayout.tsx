'use client';

import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            {children}
        </Layout>
    );
}
