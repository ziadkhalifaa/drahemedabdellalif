import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Dr. Ahmed Abdellatif';
    const subtitle = searchParams.get('subtitle') || 'Consultant Urologist';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              padding: '60px 80px',
              borderRadius: '40px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              border: '2px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: 64, fontWeight: 'black', color: '#0f172a', marginBottom: 20 }}>
              {title}
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#3b82f6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {subtitle}
            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: 40, fontSize: 24, fontWeight: 'bold', color: '#94a3b8' }}>
            drahmedabdellatif.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
