'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Typography,
    Menu,
    Steps,
    Table,
    Alert,
    Tag,
    Divider,
    Card,
    Anchor,
    Button,
    Drawer,
    Tooltip,
} from 'antd';
import {
    UploadOutlined,
    SettingOutlined,
    TranslationOutlined,
    ExportOutlined,
    FileTextOutlined,
    ApiOutlined,
    CodeOutlined,
    SafetyOutlined,
    ThunderboltOutlined,
    CloudServerOutlined,
    RocketOutlined,
    VideoCameraOutlined,
    MenuOutlined,
    DesktopOutlined,
    CopyOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import { Highlight, themes } from 'prism-react-renderer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

// ─── Helpers ────────────────────────────────────────────────────────────────

function CodeBlock({ children, language = 'text' }: { children: string; language?: string }) {
    const { isDark } = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(children).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [children]);

    return (
        <div style={{ position: 'relative', margin: '12px 0 20px' }}>
            {/* Language badge + Copy button */}
            <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                zIndex: 1,
            }}>
                {language !== 'text' && (
                    <span style={{
                        fontSize: 11,
                        color: isDark ? '#8b949e' : '#6e7781',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontWeight: 500,
                    }}>
                        {language}
                    </span>
                )}
                <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <Button
                        type="text"
                        size="small"
                        icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                        onClick={handleCopy}
                        style={{
                            color: isDark ? '#8b949e' : '#6e7781',
                            borderRadius: 6,
                            width: 28,
                            height: 28,
                        }}
                    />
                </Tooltip>
            </div>

            <Highlight
                theme={isDark ? themes.nightOwl : themes.github}
                code={children.trim()}
                language={language}
            >
                {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        style={{
                            ...style,
                            borderRadius: 8,
                            padding: '16px 20px',
                            overflow: 'auto',
                            fontSize: 13,
                            lineHeight: 1.7,
                            fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
                            margin: 0,
                            border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
                        }}
                    >
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token })} />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <Title
            level={2}
            id={id}
            style={{
                scrollMarginTop: 80,
                paddingTop: 8,
                marginTop: 40,
                marginBottom: 16,
                fontSize: 24,
                fontWeight: 600,
            }}
        >
            {children}
        </Title>
    );
}

function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <Title
            level={3}
            id={id}
            style={{
                scrollMarginTop: 80,
                paddingTop: 4,
                marginTop: 28,
                marginBottom: 12,
                fontSize: 18,
                fontWeight: 600,
            }}
        >
            {children}
        </Title>
    );
}

function InfoCard({ title, children, tag, tagColor }: {
    title: string;
    children: React.ReactNode;
    tag?: string;
    tagColor?: string;
}) {
    const { isDark } = useTheme();
    return (
        <div style={{
            padding: '16px 20px',
            borderRadius: 10,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            marginBottom: 12,
        }}>
            <div style={{ marginBottom: 6 }}>
                {tag && <Tag color={tagColor} style={{ marginRight: 8 }}>{tag}</Tag>}
                <Text strong style={{ fontSize: 15 }}>{title}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>{children}</Text>
        </div>
    );
}

// ─── UI Guide Content ───────────────────────────────────────────────────────

function UIGuideContent() {
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const d = t.docs.ui;

    return (
        <>
            {/* Getting Started */}
            <SectionHeading id="getting-started">
                <RocketOutlined style={{ marginRight: 10 }} />
                {d.gettingStarted}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                {d.gettingStartedDesc}
            </Paragraph>
            <Steps
                orientation="vertical"
                current={-1}
                items={[
                    { title: <Text strong>{d.step1Title}</Text>, content: d.step1Desc, icon: <UploadOutlined /> },
                    { title: <Text strong>{d.step2Title}</Text>, content: d.step2Desc, icon: <SettingOutlined /> },
                    { title: <Text strong>{d.step3Title}</Text>, content: d.step3Desc, icon: <TranslationOutlined /> },
                    { title: <Text strong>{d.step4Title}</Text>, content: d.step4Desc, icon: <ExportOutlined /> },
                ]}
            />

            {/* Supported Formats */}
            <SectionHeading id="formats">
                <FileTextOutlined style={{ marginRight: 10 }} />
                {d.supportedFormats}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                {d.supportedFormatsDesc}
            </Paragraph>
            <InfoCard title="SRT" tag="SRT" tagColor="#52c41a">{d.formatSrt}</InfoCard>
            <InfoCard title="VTT" tag="VTT" tagColor="#1890ff">{d.formatVtt}</InfoCard>
            <InfoCard title="ASS/SSA" tag="ASS" tagColor="#722ed1">{d.formatAss}</InfoCard>
            <InfoCard title="JSON" tag="JSON" tagColor="#faad14">{d.formatJson}</InfoCard>
            <InfoCard title="XML" tag="XML" tagColor="#f5222d">{d.formatXml}</InfoCard>

            {/* Translation Modes */}
            <SectionHeading id="modes">
                <ThunderboltOutlined style={{ marginRight: 10 }} />
                {d.translationModes}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                {d.translationModesDesc}
            </Paragraph>
            <InfoCard title={d.guestModeTitle} tag="FREE" tagColor="green">{d.guestModeDesc}</InfoCard>
            <InfoCard title={d.customKeyTitle} tag="PRO" tagColor="blue">{d.customKeyDesc}</InfoCard>

            {/* AI Providers */}
            <SectionHeading id="providers">
                <CloudServerOutlined style={{ marginRight: 10 }} />
                {d.providers}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                {d.providersDesc}
            </Paragraph>
            <InfoCard title={d.providerGemini} tag="Google" tagColor="blue">{d.providerGeminiDesc}</InfoCard>
            <InfoCard title={d.providerOpenRouter} tag="OpenRouter" tagColor="purple">{d.providerOpenRouterDesc}</InfoCard>
            <InfoCard title={d.providerCustom} tag="Custom" tagColor="orange">{d.providerCustomDesc}</InfoCard>

            {/* Advanced Settings */}
            <SectionHeading id="advanced">
                <SettingOutlined style={{ marginRight: 10 }} />
                {d.advancedSettings}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                {d.advancedSettingsDesc}
            </Paragraph>
            <InfoCard title={d.settingContext}>{d.settingContextDesc}</InfoCard>
            <InfoCard title={d.settingStyle}>{d.settingStyleDesc}</InfoCard>
            <InfoCard title={d.settingBatchSize}>{d.settingBatchSizeDesc}</InfoCard>

            {/* Export Options */}
            <SectionHeading id="export">
                <ExportOutlined style={{ marginRight: 10 }} />
                {d.exportOptions}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                {d.exportOptionsDesc}
            </Paragraph>
            <InfoCard title={d.exportSingle}>{d.exportSingleDesc}</InfoCard>
            <InfoCard title={d.exportBatch}>{d.exportBatchDesc}</InfoCard>
            <InfoCard title={d.exportBilingual}>{d.exportBilingualDesc}</InfoCard>

            {/* Video Preview */}
            <SectionHeading id="video">
                <VideoCameraOutlined style={{ marginRight: 10 }} />
                {d.videoPreview}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                {d.videoPreviewDesc}
            </Paragraph>
        </>
    );
}

// ─── API Guide Content ──────────────────────────────────────────────────────

function APIGuideContent({ origin }: { origin: string }) {
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const d = t.docs.api;

    const paramColumns = [
        { title: d.paramName, dataIndex: 'name', key: 'name', width: 160, render: (text: string) => <code style={{ fontSize: 13 }}>{text}</code> },
        { title: d.paramType, dataIndex: 'type', key: 'type', width: 80, render: (text: string) => <Tag>{text}</Tag> },
        { title: d.paramRequired, dataIndex: 'required', key: 'required', width: 90, render: (val: boolean) => val ? <Tag color="red">{d.paramYes}</Tag> : <Tag>{d.paramNo}</Tag> },
        { title: d.paramDescription, dataIndex: 'desc', key: 'desc' },
    ];

    const paramData = [
        { key: '1', name: 'file', type: 'File', required: true, desc: d.paramFileDesc },
        { key: '2', name: 'apiKey', type: 'string', required: true, desc: d.paramApiKeyDesc },
        { key: '3', name: 'provider', type: 'string', required: true, desc: d.paramProviderDesc },
        { key: '4', name: 'model', type: 'string', required: true, desc: d.paramModelDesc },
        { key: '5', name: 'targetLanguage', type: 'string', required: true, desc: d.paramTargetLanguageDesc },
        { key: '6', name: 'context', type: 'string', required: false, desc: d.paramContextDesc },
        { key: '7', name: 'style', type: 'string', required: false, desc: d.paramStyleDesc },
        { key: '8', name: 'batchSize', type: 'string', required: false, desc: d.paramBatchSizeDesc },
        { key: '9', name: 'customEndpoint', type: 'string', required: false, desc: d.paramCustomEndpointDesc },
    ];

    const errorColumns = [
        { title: d.errorCode, dataIndex: 'code', key: 'code', width: 200, render: (text: string) => <Tag color="red">{text}</Tag> },
        { title: d.errorDescription, dataIndex: 'desc', key: 'desc' },
    ];

    const errorData = [
        { key: '1', code: d.error400, desc: d.error400Desc },
        { key: '2', code: d.error500, desc: d.error500Desc },
    ];

    return (
        <>
            {/* Overview */}
            <SectionHeading id="api-overview">
                <ApiOutlined style={{ marginRight: 10 }} />
                {d.overview}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                {d.overviewDesc}
            </Paragraph>
            <Alert
                type="info"
                showIcon
                title={d.baseUrl}
                description={<code style={{ fontSize: 14 }}>{origin}/api/v1</code>}
                style={{ marginBottom: 24 }}
            />

            {/* Authentication */}
            <SectionHeading id="api-auth">
                <SafetyOutlined style={{ marginRight: 10 }} />
                {d.authentication}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                {d.authenticationDesc}
            </Paragraph>

            {/* GET /api/v1/models */}
            <SectionHeading id="api-models">
                <CodeOutlined style={{ marginRight: 10 }} />
                {d.listModels}
            </SectionHeading>
            <div style={{ marginBottom: 16 }}>
                <Tag color="green" style={{ fontSize: 13, padding: '2px 10px' }}>GET</Tag>
                <code style={{ fontSize: 15, marginLeft: 8 }}>/api/v1/models</code>
            </div>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                {d.listModelsDesc}
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 14 }}>
                {d.listModelsResponse}
            </Paragraph>
            <SubHeading id="api-models-response">Response</SubHeading>
            <CodeBlock language="json">{`{
  "google": [
    { "id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash" },
    { "id": "gemini-2.0-flash-lite", "name": "Gemini 2.0 Flash Lite" }
  ],
  "openrouter": [
    {
      "id": "meta-llama/llama-3.1-8b-instruct:free",
      "name": "Llama 3.1 8B Instruct (free)",
      "free": true,
      "pricing": { "prompt": 0, "completion": 0 },
      "contextLength": 131072
    }
  ]
}`}</CodeBlock>

            {/* POST /api/v1/translate */}
            <SectionHeading id="api-translate">
                <CodeOutlined style={{ marginRight: 10 }} />
                {d.translateFile}
            </SectionHeading>
            <div style={{ marginBottom: 16 }}>
                <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>POST</Tag>
                <code style={{ fontSize: 15, marginLeft: 8 }}>/api/v1/translate</code>
            </div>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                {d.translateFileDesc}
            </Paragraph>

            {/* Request Format */}
            <SubHeading id="api-translate-request">{d.requestFormat}</SubHeading>
            <Alert
                type="warning"
                showIcon
                title="Content-Type: multipart/form-data"
                style={{ marginBottom: 20 }}
            />

            {/* Parameters */}
            <SubHeading id="api-translate-params">{d.parameters}</SubHeading>
            <Table
                columns={paramColumns}
                dataSource={paramData}
                pagination={false}
                size="small"
                bordered
                style={{ marginBottom: 28 }}
            />

            {/* Response Format */}
            <SubHeading id="api-translate-response">{d.responseFormat}</SubHeading>
            <Paragraph type="secondary" style={{ fontSize: 14, marginBottom: 12 }}>
                {d.responseFormatDesc}
            </Paragraph>
            <Alert
                type="info"
                showIcon
                title="Content-Type: application/x-ndjson"
                style={{ marginBottom: 20 }}
            />

            {/* Streaming Events */}
            <SubHeading id="api-translate-streaming">{d.streamingResponse}</SubHeading>
            <Paragraph type="secondary" style={{ fontSize: 14, marginBottom: 12 }}>
                {d.streamingResponseDesc}
            </Paragraph>
            <InfoCard title="translating" tag="translating" tagColor="blue">{d.translatingEvent}</InfoCard>
            <InfoCard title="done" tag="done" tagColor="green">{d.doneEvent}</InfoCard>
            <InfoCard title="error" tag="error" tagColor="red">{d.errorEvent}</InfoCard>

            <SubHeading id="api-streaming-example">{d.streamingExample}</SubHeading>
            <CodeBlock language="json">{`{"index":0,"originalText":"Hello","translatedText":"Xin chào","status":"translating","completed":1,"total":100}
{"index":1,"originalText":"World","translatedText":"Thế giới","status":"translating","completed":2,"total":100}
...
{"index":99,"originalText":"Goodbye","translatedText":"Tạm biệt","status":"done","completed":100,"total":100}`}</CodeBlock>

            <SubHeading id="api-error-example">{d.errorExample}</SubHeading>
            <CodeBlock language="json">{`{"status":"error","message":"Invalid API key","code":"INVALID_API_KEY","completed":5,"total":100}`}</CodeBlock>

            {/* Code Examples */}
            <SectionHeading id="api-examples">
                <CodeOutlined style={{ marginRight: 10 }} />
                {d.curlExample}
            </SectionHeading>
            <CodeBlock language="bash">{`curl -X POST \\
  ${origin}/api/v1/translate \\
  -F "file=@subtitle.srt" \\
  -F "apiKey=your-api-key" \\
  -F "provider=google" \\
  -F "model=gemini-2.0-flash" \\
  -F "targetLanguage=vi"`}</CodeBlock>

            <SectionHeading id="api-js-example">
                <CodeOutlined style={{ marginRight: 10 }} />
                {d.jsExample}
            </SectionHeading>
            <CodeBlock language="javascript">{`const formData = new FormData();
formData.append('file', subtitleFile);
formData.append('apiKey', 'your-api-key');
formData.append('provider', 'google');
formData.append('model', 'gemini-2.0-flash');
formData.append('targetLanguage', 'vi');

const response = await fetch('${origin}/api/v1/translate', {
  method: 'POST',
  body: formData,
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const lines = decoder.decode(value).split('\\n').filter(Boolean);
  for (const line of lines) {
    const data = JSON.parse(line);
    
    if (data.status === 'error') {
      console.error('Error:', data.message);
      break;
    }
    
    console.log(\`[\${data.completed}/\${data.total}]\`, data.translatedText);
    
    if (data.status === 'done') {
      console.log('Translation complete!');
    }
  }
}`}</CodeBlock>

            {/* Error Handling */}
            <SectionHeading id="api-errors">
                <SafetyOutlined style={{ marginRight: 10 }} />
                {d.errorHandling}
            </SectionHeading>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                {d.errorHandlingDesc}
            </Paragraph>
            <Table
                columns={errorColumns}
                dataSource={errorData}
                pagination={false}
                size="small"
                bordered
            />
        </>
    );
}

// ─── Sidebar Navigation ─────────────────────────────────────────────────────

type DocSection = 'ui' | 'api';

function useSidebarItems(section: DocSection) {
    const { t } = useLanguage();
    const d = t.docs;

    if (section === 'ui') {
        return [
            { key: 'getting-started', href: '#getting-started', title: d.ui.gettingStarted },
            { key: 'formats', href: '#formats', title: d.ui.supportedFormats },
            { key: 'modes', href: '#modes', title: d.ui.translationModes },
            { key: 'providers', href: '#providers', title: d.ui.providers },
            { key: 'advanced', href: '#advanced', title: d.ui.advancedSettings },
            { key: 'export', href: '#export', title: d.ui.exportOptions },
            { key: 'video', href: '#video', title: d.ui.videoPreview },
        ];
    }

    return [
        { key: 'api-overview', href: '#api-overview', title: d.api.overview },
        { key: 'api-auth', href: '#api-auth', title: d.api.authentication },
        {
            key: 'api-models', href: '#api-models', title: 'GET /api/v1/models',
            children: [
                { key: 'api-models-response', href: '#api-models-response', title: 'Response' },
            ],
        },
        {
            key: 'api-translate', href: '#api-translate', title: 'POST /api/v1/translate',
            children: [
                { key: 'api-translate-request', href: '#api-translate-request', title: d.api.requestFormat },
                { key: 'api-translate-params', href: '#api-translate-params', title: d.api.parameters },
                { key: 'api-translate-response', href: '#api-translate-response', title: d.api.responseFormat },
                { key: 'api-translate-streaming', href: '#api-translate-streaming', title: d.api.streamingResponse },
            ],
        },
        { key: 'api-examples', href: '#api-examples', title: d.api.curlExample },
        { key: 'api-js-example', href: '#api-js-example', title: d.api.jsExample },
        { key: 'api-errors', href: '#api-errors', title: d.api.errorHandling },
    ];
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DocsPage() {
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const [section, setSection] = useState<DocSection>('ui');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [origin, setOrigin] = useState('https://your-domain.com');
    const anchorItems = useSidebarItems(section);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        setOrigin(window.location.origin);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const sidebarMenuItems = [
        {
            key: 'ui',
            icon: <DesktopOutlined />,
            label: t.docs.uiTab,
        },
        {
            key: 'api',
            icon: <ApiOutlined />,
            label: t.docs.apiTab,
        },
    ];

    const sidebarContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Section Switcher */}
            <Menu
                mode="inline"
                selectedKeys={[section]}
                onClick={({ key }) => {
                    setSection(key as DocSection);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                items={sidebarMenuItems}
                style={{
                    border: 'none',
                    marginBottom: 16,
                }}
            />
            <Divider style={{ margin: '0 0 12px' }} />
            {/* Anchor Navigation */}
            <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, padding: '0 12px', display: 'block', marginBottom: 8 }}>
                    {section === 'ui' ? t.docs.uiTab : t.docs.apiTab}
                </Text>
                <Anchor
                    items={anchorItems}
                    offsetTop={80}
                    onClick={() => setMobileMenuOpen(false)}
                />
            </div>
        </div>
    );

    return (
        <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
            {/* Mobile menu button */}
            {isMobile && (
                <div style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1001,
                }}>
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuOpen(true)}
                        style={{ width: 48, height: 48, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                    />
                </div>
            )}

            {/* Mobile Drawer */}
            <Drawer
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                placement="left"
                size={280}
                styles={{ body: { padding: '16px 0' } }}
            >
                {sidebarContent}
            </Drawer>

            {/* Desktop Sidebar */}
            {!isMobile && (
                <Sider
                    width={260}
                    style={{
                        background: isDark ? '#141414' : '#fff',
                        borderRight: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                        position: 'sticky',
                        top: 64,
                        height: 'calc(100vh - 64px)',
                        overflow: 'auto',
                        paddingTop: 16,
                    }}
                >
                    {sidebarContent}
                </Sider>
            )}

            {/* Main Content */}
            <Content style={{
                padding: isMobile ? '24px 16px' : '32px 48px',
                width: '100%',
            }}>
                {/* Page Header */}
                <div style={{ marginBottom: 40 }}>
                    <Title level={1} style={{ marginBottom: 8, fontSize: 28 }}>
                        {section === 'ui' ? (
                            <><DesktopOutlined style={{ marginRight: 12 }} />{t.docs.uiTab}</>
                        ) : (
                            <><ApiOutlined style={{ marginRight: 12 }} />{t.docs.apiTab}</>
                        )}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        {t.docs.subtitle}
                    </Text>
                </div>

                {/* Content */}
                {section === 'ui' ? <UIGuideContent /> : <APIGuideContent origin={origin} />}

                {/* Bottom spacer */}
                <div style={{ height: 80 }} />
            </Content>
        </Layout>
    );
}
