"use client";

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Globe, 
  Key, 
  Upload, 
  Languages, 
  Play, 
  Download,
  Zap,
  Brain,
  Activity,
  Edit,
  FileText,
  ArrowLeftRight,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const GuideSummary = () => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check localStorage for user's preference
  useEffect(() => {
    const savedPreference = localStorage.getItem('guideVisible');
    if (savedPreference !== null) {
      setIsVisible(JSON.parse(savedPreference));
    }
  }, []);

  const handleHideGuide = () => {
    setIsVisible(false);
    localStorage.setItem('guideVisible', 'false');
  };

  const handleShowGuide = () => {
    setIsVisible(true);
    setIsCollapsed(false);
    localStorage.setItem('guideVisible', 'true');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // If user has hidden the guide, show a small button to bring it back
  if (!isVisible) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShowGuide}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
            {t('guideSummary.showGuide')}
          </Button>
        </div>
      </div>
    );
  }

  const steps = [
    {
      icon: Globe,
      title: t('guideSummary.step1Title'),
      description: t('guideSummary.step1Description')
    },
    {
      icon: Key,
      title: t('guideSummary.step2Title'),
      description: t('guideSummary.step2Description')
    },
    {
      icon: Upload,
      title: t('guideSummary.step3Title'),
      description: t('guideSummary.step3Description')
    },
    {
      icon: Languages,
      title: t('guideSummary.step4Title'),
      description: t('guideSummary.step4Description')
    },
    {
      icon: Play,
      title: t('guideSummary.step5Title'),
      description: t('guideSummary.step5Description')
    },
    {
      icon: Download,
      title: t('guideSummary.step6Title'),
      description: t('guideSummary.step6Description')
    }
  ];

  const features = [
    {
      icon: Globe,
      title: t('guideSummary.feature1'),
      description: t('guideSummary.feature1Description')
    },
    {
      icon: Zap,
      title: t('guideSummary.feature2'),
      description: t('guideSummary.feature2Description')
    },
    {
      icon: Activity,
      title: t('guideSummary.feature3'),
      description: t('guideSummary.feature3Description')
    },
    {
      icon: Edit,
      title: t('guideSummary.feature4'),
      description: t('guideSummary.feature4Description')
    },
    {
      icon: FileText,
      title: t('guideSummary.feature5'),
      description: t('guideSummary.feature5Description')
    },
    {
      icon: ArrowLeftRight,
      title: t('guideSummary.feature6'),
      description: t('guideSummary.feature6Description')
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          {t('guideSummary.title')}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('guideSummary.subtitle')}
        </p>
      </div>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            {t('guideSummary.howItWorksTitle')}
          </CardTitle>
          <CardDescription>
            {t('guideSummary.howItWorksDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t('guideSummary.featuresTitle')}
          </CardTitle>
          <CardDescription>
            {t('guideSummary.featuresDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-accent/5 transition-all group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <IconComponent className="h-5 w-5 text-secondary-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="flex items-center gap-2 px-8" 
              asChild
            >
              <a 
                href="#translator"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('translator')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                <Play className="h-4 w-4" />
                {t('guideSummary.getStarted')}
              </a>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center gap-2 px-8" asChild>
              <Link href="/guide">
                <ExternalLink className="h-4 w-4" />
                {t('guideSummary.viewFullGuide')}
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="flex items-center gap-2 px-8 text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 hover:scale-105 active:scale-95 group" 
              onClick={handleHideGuide}
            >
              <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
              {t('guideSummary.understood')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideSummary;
