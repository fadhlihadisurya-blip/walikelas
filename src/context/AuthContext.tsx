import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  loginWithGoogle: () => Promise<void>;
  loginDemo: (role: UserRole, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOOTSTRAPPED_ADMIN_EMAIL = 'fadhlihadisurya@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check demo user in localStorage if offline/demo mode is used
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const emailLower = (user.email || '').toLowerCase();
        const isAdmin = emailLower === BOOTSTRAPPED_ADMIN_EMAIL;

        // Fetch or create user in Firestore
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile({
              ...data,
              role: isAdmin ? 'admin' : (data.role || 'wali_kelas'),
            });
          } else {
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Ustadz / Ustadzah Wali Kelas',
              role: isAdmin ? 'admin' : 'wali_kelas',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.warn('Failed to load profile from firestore, using fallback auth profile:', e);
          setUserProfile({
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Wali Kelas',
            role: isAdmin ? 'admin' : 'wali_kelas',
          });
        }
      } else {
        // Check for local stored demo session
        const demoSession = localStorage.getItem('jpis_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession);
            setUserProfile(parsed);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('jpis_demo_session');
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      // If popup was blocked or closed by user, don't break app
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (role: UserRole, customName?: string) => {
    setLoading(true);
    try {
      const demoProfile: UserProfile = {
        id: `demo_${role}_${Date.now()}`,
        email: role === 'admin' ? BOOTSTRAPPED_ADMIN_EMAIL : 'walikelas@alhikmah-ib.sch.id',
        displayName: customName || (role === 'admin' ? 'Ustadz Fadhli Hadi Surya (Super Admin)' : role === 'wali_kelas' ? 'Ustadz Ahmad Fauzi, S.Pd. (Wali Kelas XI-A)' : 'Ustadz Ridwan Syah, Lc. (Pembina Asrama)'),
        role,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('jpis_demo_session', JSON.stringify(demoProfile));
      setUserProfile(demoProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('jpis_demo_session');
    setUserProfile(null);
    setCurrentUser(null);
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
  };

  const switchRole = (role: UserRole) => {
    if (userProfile) {
      const updated = { ...userProfile, role };
      setUserProfile(updated);
      if (!currentUser) {
        localStorage.setItem('jpis_demo_session', JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isFirebaseReady: isFirebaseConfigured,
        loginWithGoogle,
        loginDemo,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
