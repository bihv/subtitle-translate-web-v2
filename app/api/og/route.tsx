import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Đọc các tham số từ URL
  const title = searchParams.get('title') || 'SubtitleAI';
  const description = searchParams.get('description') || 'Translate subtitles from SRT files using Gemini AI';
  
  // Sử dụng theme tối với màu sắc đẹp hơn
  const backgroundColor = '#0F172A';
  const textColor = '#FFFFFF';
  const accentColor = '#38BDF8'; // Màu xanh lam sáng
  const secondaryTextColor = '#CBD5E1'; // Màu xám nhạt hơn, dễ đọc
  const gradient = 'linear-gradient(135deg, #3B82F6, #6366F1, #8B5CF6)'; // Blue to indigo to violet
  
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: backgroundColor,
          padding: '48px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gradient background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: gradient,
            opacity: 1,
          }}
        />
        
        {/* Overlay pattern để tăng độ thẩm mỹ */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)',
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }}
        />
        
        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '48px',
            height: '100%',
            zIndex: 2,
          }}
        >
          {/* Logo section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                color: accentColor,
                fontSize: '24px',
                fontWeight: 'bold',
                marginRight: '16px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                border: `2px solid ${accentColor}`,
              }}
            >
              S
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: textColor,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              }}
            >
              SubtitleAI
            </div>
          </div>
          
          {/* Title */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: textColor,
              marginBottom: '24px',
              maxWidth: '80%',
              lineHeight: 1.2,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
            }}
          >
            {title}
          </div>
          
          {/* Description */}
          <div
            style={{
              fontSize: '32px',
              color: secondaryTextColor,
              maxWidth: '70%',
              marginBottom: '48px',
              lineHeight: 1.4,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
            }}
          >
            {description}
          </div>
          
          {/* Format badges */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
            }}
          >
            {["SRT", "VTT", "ASS"].map((format) => (
              <div
                key={format}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: textColor,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  border: `1px solid rgba(56, 189, 248, 0.3)`,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                }}
              >
                {format}
              </div>
            ))}
          </div>
          
          {/* Website URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '48px',
              right: '48px',
              display: 'flex',
              alignItems: 'center',
              color: textColor,
              fontSize: '24px',
              fontWeight: 'medium',
              opacity: 0.9,
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                marginRight: '8px',
              }}
            />
            translate.io.vn
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
} 