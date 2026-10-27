import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

// Import provisioned config if available
let appletConfig: Record<string, any> = {};
try {
  // @ts-ignore
  import('../../firebase-applet-config.json').then((m) => {
    appletConfig = m.default || m;
  }).catch(() => {
    // File not found or running in external host
  });
} catch {
  // Ignore
}

// Support both AI Studio provisioned config and Vercel/Vite environment variables
const getFirebaseOptions = () => {
  // 1. Try local storage manual override (for custom Vercel testing without rebuild)
  const localConfigStr = typeof window !== 'undefined' ? localStorage.getItem('jpis_firebase_config') : null;
  if (localConfigStr) {
    try {
      const parsed = JSON.parse(localConfigStr);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }

  // 2. Try Vite env vars (Vercel standard)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envApiKey) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
    };
  }

  // 3. User's active Firebase Project: walikelas
  return {
    apiKey: "AIzaSyAw1iJ5U2UD7GV6-q0zAnJS3Kdoe3r7TB8",
    authDomain: "walikelas.firebaseapp.com",
    projectId: "walikelas",
    storageBucket: "walikelas.firebasestorage.app",
    messagingSenderId: "322561210567",
    appId: "1:322561210567:web:cb489142bf6d84c3e4e6e2",
    firestoreDatabaseId: "(default)",
  };
};

const firebaseConfig = getFirebaseOptions();

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Checking configuration...');
    }
    return false;
  }
}

// Run initial connection test silently
if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}
