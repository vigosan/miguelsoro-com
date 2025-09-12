import { NextApiRequest } from 'next';
import { GetServerSidePropsContext } from 'next';

export function isAuthenticated(req: NextApiRequest | GetServerSidePropsContext['req']): boolean {
  const cookies = req.headers.cookie;
  
  if (!cookies) {
    return false;
  }

  // Parse cookies manually (simple approach)
  const cookieArray = cookies.split(';').map(cookie => cookie.trim());
  const adminSessionCookie = cookieArray.find(cookie => cookie.startsWith('admin-session='));
  
  if (!adminSessionCookie) {
    return false;
  }

  const sessionValue = adminSessionCookie.split('=')[1];
  return sessionValue === 'authenticated';
}

export function requireAuth(handler: (req: NextApiRequest, res: any) => Promise<void> | void) {
  return async (req: NextApiRequest, res: any) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    return handler(req, res);
  };
}