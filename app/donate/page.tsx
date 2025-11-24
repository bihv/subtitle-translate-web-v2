"use client";

import { useI18n } from '@/lib/i18n/I18nContext';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, Zap, TrendingUp, Share2, Bug, Star, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function DonatePage() {
    const { t } = useI18n();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const bankInfo = {
        bankName: t('donate.bankNameValue'),
        accountNumber: t('donate.accountNumberValue'),
        accountHolder: t('donate.accountHolderValue'),
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
                <div className="container max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('donate.backToApp')}
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4 shadow-lg">
                        <Heart className="h-8 w-8 text-white" fill="currentColor" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent leading-relaxed">
                        {t('donate.title')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('donate.subtitle')}
                    </p>
                </div>

                {/* Hero Description */}
                <div className="mb-16">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm border border-border/50 p-8 md:p-10">
                        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                {t('donate.heroTitle')}
                            </h2>
                            <p className="text-muted-foreground leading-loose">
                                {t('donate.heroDescription')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Donate Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-center mb-8">
                        {t('donate.whyDonate')}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Heart, title: t('donate.reason1Title'), desc: t('donate.reason1Description'), gradient: 'from-pink-500 to-rose-500' },
                            { icon: Zap, title: t('donate.reason2Title'), desc: t('donate.reason2Description'), gradient: 'from-purple-500 to-indigo-500' },
                            { icon: TrendingUp, title: t('donate.reason3Title'), desc: t('donate.reason3Description'), gradient: 'from-blue-500 to-cyan-500' },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col items-center text-center"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} mb-4 shadow-md`}>
                                    <item.icon className="h-6 w-6 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Code and Bank Info Section */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* QR Code */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/20 backdrop-blur-sm border border-border/50 p-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">
                                {t('donate.scanQrTitle')}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                {t('donate.scanQrDescription')}
                            </p>
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                                <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                                    <Image
                                        src="/qr-donate.png"
                                        alt="QR Code Donate"
                                        width={200}
                                        height={200}
                                        className="rounded-xl"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/20 backdrop-blur-sm border border-border/50 p-8">
                        <h3 className="text-xl font-bold mb-6">
                            {t('donate.bankInfoTitle')}
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: t('donate.bankName'), value: bankInfo.bankName, field: 'bank' },
                                { label: t('donate.accountNumber'), value: bankInfo.accountNumber, field: 'account' },
                                { label: t('donate.accountHolder'), value: bankInfo.accountHolder, field: 'holder' },
                            ].map((item, idx) => (
                                <div key={idx} className="group">
                                    <label className="text-sm text-muted-foreground mb-1 block">
                                        {item.label}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-muted/50 rounded-lg px-4 py-3 font-mono text-sm border border-border/50">
                                            {item.value}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(item.value, item.field)}
                                            className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-105"
                                            title="Copy to clipboard"
                                        >
                                            {copiedField === item.field ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Thank You Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-green-500/20 p-8 md:p-10 mb-16">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
                    <div className="relative z-10 text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            {t('donate.thankYouTitle')}
                        </h3>
                        <p className="text-muted-foreground leading-loose max-w-2xl mx-auto">
                            {t('donate.thankYouMessage')}
                        </p>
                    </div>
                </div>

                {/* Other Ways to Support */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-8">
                        {t('donate.otherWays')}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Share2, text: t('donate.shareWithFriends'), gradient: 'from-blue-500 to-cyan-500' },
                            { icon: Bug, text: t('donate.reportBugs'), gradient: 'from-orange-500 to-red-500' },
                            { icon: Star, text: t('donate.leaveReview'), gradient: 'from-yellow-500 to-amber-500' },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:scale-105"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} shadow-md`}>
                                    <item.icon className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-sm font-medium text-center leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-16 py-8">
                <div className="container max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>Made with ❤️ for the community</p>
                </div>
            </footer>
        </div>
    );
}
