import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        padding: '60px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          color: 'white'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '500',
          margin: '0 0 16px 0',
          color: 'white'
        }}>
          Not Found
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '0 0 32px 0',
          lineHeight: '1.5'
        }}>
          Could not find requested resource
        </p>
        <Link 
          href='/'
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
