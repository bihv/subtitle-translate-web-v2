'use client';

import React, { useState, useEffect } from 'react';
import {
    Layout,
    Typography,
    Space,
    Button,
    Drawer,
    Grid,
    Flex,
} from 'antd';
import {
    FileTextOutlined,
    GlobalOutlined,
    BookOutlined,
    MenuOutlined,
    SunOutlined,
    MoonOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const { Header } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function AppHeader() {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const pathname = usePathname();
    const screens = useBreakpoint();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isMobile = !screens.md;

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    const navItems = [
        { key: '/docs', label: t.nav.docs, icon: <BookOutlined /> },
    ];

    const activeColor = '#1890ff';
    const textColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)';
    const primaryTextColor = isDark ? '#fff' : '#000';

    const logoSection = (
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <FileTextOutlined style={{ fontSize: '24px', color: activeColor }} />
            <Title level={4} style={{ margin: 0, color: primaryTextColor, whiteSpace: 'nowrap' }}>
                {t.appTitle}
            </Title>
        </Link>
    );

    const navButtons = navItems.map((item) => {
        const isActive = pathname === item.key;
        return (
            <Link key={item.key} href={item.key} style={{ textDecoration: 'none' }}>
                <Button
                    type="text"
                    icon={item.icon}
                    block={isMobile}
                    size={isMobile ? 'large' : 'middle'}
                    style={{
                        color: isActive ? activeColor : textColor,
                        fontWeight: isActive ? 600 : 400,
                        borderBottom: !isMobile
                            ? `2px solid ${isActive ? activeColor : 'transparent'}`
                            : undefined,
                        borderRadius: isMobile ? 8 : 0,
                        background: isMobile && isActive
                            ? (isDark ? 'rgba(24,144,255,0.12)' : 'rgba(24,144,255,0.06)')
                            : undefined,
                        justifyContent: isMobile ? 'flex-start' : undefined,
                        textAlign: 'left',
                        height: isMobile ? 48 : undefined,
                    }}
                >
                    {item.label}
                </Button>
            </Link>
        );
    });

    const languageButton = (
        <Button
            type="text"
            icon={<GlobalOutlined />}
            block={isMobile}
            size={isMobile ? 'large' : 'middle'}
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            style={{
                color: primaryTextColor,
                justifyContent: isMobile ? 'flex-start' : undefined,
                height: isMobile ? 48 : undefined,
                borderRadius: isMobile ? 8 : undefined,
            }}
        >
            {language === 'vi' ? 'English' : 'Tiếng Việt'}
        </Button>
    );

    const themeButton = (
        <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            block={isMobile}
            size={isMobile ? 'large' : 'middle'}
            onClick={toggleTheme}
            style={{
                color: primaryTextColor,
                justifyContent: isMobile ? 'flex-start' : undefined,
                height: isMobile ? 48 : undefined,
                borderRadius: isMobile ? 8 : undefined,
            }}
        >
            {isDark ? t.lightMode : t.darkMode}
        </Button>
    );

    return (
        <Header style={{
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: 56,
            lineHeight: '56px',
        }}>
            <Flex justify="space-between" align="center" style={{ height: '100%' }}>
                {/* Left: Logo + Desktop Nav */}
                <Flex align="center" gap={isMobile ? 0 : 12}>
                    {logoSection}
                    {!isMobile && (
                        <>
                            <div style={{
                                width: 1,
                                height: 20,
                                background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                                margin: '0 4px',
                            }} />
                            {navButtons}
                        </>
                    )}
                </Flex>

                {/* Right: Desktop Controls or Hamburger */}
                {isMobile ? (
                    <Button
                        type="text"
                        icon={<MenuOutlined style={{ fontSize: 20 }} />}
                        onClick={() => setDrawerOpen(true)}
                        style={{
                            color: primaryTextColor,
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                ) : (
                    <Space>
                        {languageButton}
                        {themeButton}
                    </Space>
                )}
            </Flex>

            {/* Mobile Drawer */}
            <Drawer
                title={
                    <Flex align="center" gap={8}>
                        <FileTextOutlined style={{ fontSize: 20, color: activeColor }} />
                        <Text strong style={{ fontSize: 16 }}>{t.appTitle}</Text>
                    </Flex>
                }
                placement="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                closeIcon={<CloseOutlined />}
                styles={{
                    wrapper: { width: 280 },
                    body: { padding: '12px 16px' },
                }}
            >
                <Flex vertical gap={4}>
                    {/* Navigation */}
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', padding: '8px 12px 4px', letterSpacing: 0.5 }}>
                        {t.nav.home === 'Trang chủ' ? 'Điều hướng' : 'Navigation'}
                    </Text>
                    {navButtons}

                    {/* Divider */}
                    <div style={{
                        height: 1,
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        margin: '8px 0',
                    }} />

                    {/* Settings */}
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', padding: '4px 12px 4px', letterSpacing: 0.5 }}>
                        {language === 'vi' ? 'Cài đặt' : 'Settings'}
                    </Text>
                    {languageButton}
                    {themeButton}
                </Flex>
            </Drawer>
        </Header>
    );
}
