import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>404 - Page Not Found</h1>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>The page you are looking for does not exist.</p>
      <Link href="/" style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 'bold' }}>
        Return to Home
      </Link>
    </div>
  );
}
