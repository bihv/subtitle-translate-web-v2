"use client";

import { useI18n } from '@/lib/i18n/I18nContext';
import Link from 'next/link';
import { ArrowLeft, Github, Mail, Facebook, ExternalLink } from 'lucide-react';

export default function ContactPage() {
    const { t } = useI18n();

    const contactMethods = [
        {
            icon: Github,
            title: t('contact.githubTitle'),
            description: t('contact.githubDescription'),
            link: t('contact.githubUrl'),
            action: t('contact.viewOnGithub'),
            gradient: 'from-gray-700 to-gray-900',
            hoverGradient: 'hover:from-gray-600 hover:to-gray-800',
        },
        {
            icon: Mail,
            title: t('contact.emailTitle'),
            description: t('contact.emailDescription'),
            link: `mailto:${t('contact.emailAddress')}`,
            action: t('contact.sendEmail'),
            gradient: 'from-red-500 to-pink-500',
            hoverGradient: 'hover:from-red-400 hover:to-pink-400',
        },
        {
            icon: Facebook,
            title: t('contact.facebookTitle'),
            description: t('contact.facebookDescription'),
            link: t('contact.facebookUrl'),
            action: t('contact.visitPage'),
            gradient: 'from-blue-600 to-blue-800',
            hoverGradient: 'hover:from-blue-500 hover:to-blue-700',
        },
    ];

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
                        {t('contact.backToApp')}
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-relaxed">
                        {t('contact.title')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('contact.subtitle')}
                    </p>
                </div>

                {/* Hero Description */}
                <div className="mb-16">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm border border-border/50 p-8 md:p-10">
                        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                {t('contact.heroTitle')}
                            </h2>
                            <p className="text-muted-foreground leading-loose max-w-2xl mx-auto">
                                {t('contact.heroDescription')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Methods */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-center mb-8">
                        {t('contact.getInTouch')}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {contactMethods.map((method, idx) => (
                            <div
                                key={idx}
                                className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col items-center text-center"
                            >
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br ${method.gradient} mb-4 shadow-lg transition-all duration-300 ${method.hoverGradient}`}>
                                    <method.icon className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="text-xl font-semibold mb-2">{method.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    {method.description}
                                </p>
                                <Link
                                    href={method.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r ${method.gradient} text-white font-medium transition-all duration-200 hover:scale-105 shadow-md ${method.hoverGradient}`}
                                >
                                    {method.action}
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-blue-500/20 p-8 md:p-10">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
                    <div className="relative z-10 text-center">
                        <h3 className="text-xl md:text-2xl font-bold mb-4">
                            {t('contact.feedbackTitle')}
                        </h3>
                        <p className="text-muted-foreground leading-loose max-w-2xl mx-auto">
                            {t('contact.feedbackDescription')}
                        </p>
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
