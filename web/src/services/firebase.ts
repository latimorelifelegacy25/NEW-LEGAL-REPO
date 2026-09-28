import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SavedResearchItem, WorkspaceExportItem, RecentSearchItem } from '../types';

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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Reuse app if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Provider with all configured Google Workspace scopes
const provider = new GoogleAuthProvider();
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/meetings.space.created'
];
WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get Google OAuth access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration.');
    }
    return false;
  }
}

// Firestore Database Operations with handleFirestoreError
export async function fetchUserSavedItems(userId: string): Promise<SavedResearchItem[]> {
  const path = `users/${userId}/savedItems`;
  try {
    const q = query(collection(db, path));
    const snap = await getDocs(q);
    const items: SavedResearchItem[] = [];
    snap.forEach(docSnap => {
      items.push(docSnap.data() as SavedResearchItem);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function persistSavedItem(userId: string, item: SavedResearchItem): Promise<void> {
  const path = `users/${userId}/savedItems/${item.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'savedItems', item.id);
    const payload = typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload);
    await setDoc(docRef, {
      id: item.id,
      userId,
      type: item.type,
      title: item.title,
      citation: item.citation || '',
      notes: item.notes || '',
      content: payload,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removePersistedItem(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/savedItems/${itemId}`;
  try {
    const docRef = doc(db, 'users', userId, 'savedItems', itemId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function updatePersistedItemNotes(userId: string, itemId: string, notes: string): Promise<void> {
  const path = `users/${userId}/savedItems/${itemId}`;
  try {
    const docRef = doc(db, 'users', userId, 'savedItems', itemId);
    await updateDoc(docRef, {
      notes,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function recordWorkspaceExport(userId: string, exportItem: WorkspaceExportItem): Promise<void> {
  const path = `users/${userId}/workspaceExports/${exportItem.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'workspaceExports', exportItem.id);
    await setDoc(docRef, {
      id: exportItem.id,
      userId,
      service: exportItem.service,
      title: exportItem.title,
      externalId: exportItem.externalId || '',
      externalUrl: exportItem.externalUrl || '',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchWorkspaceExports(userId: string): Promise<WorkspaceExportItem[]> {
  const path = `users/${userId}/workspaceExports`;
  try {
    const q = query(collection(db, path));
    const snap = await getDocs(q);
    const exports: WorkspaceExportItem[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      exports.push({
        id: data.id,
        service: data.service,
        title: data.title,
        externalId: data.externalId,
        externalUrl: data.externalUrl,
        timestamp: data.createdAt
      });
    });
    return exports;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// Search History Tracker in Firestore (stores up to last 5 searches)
export async function fetchRecentSearches(userId: string): Promise<RecentSearchItem[]> {
  const path = `users/${userId}/recentSearches`;
  try {
    const q = query(collection(db, path), orderBy('searchedAt', 'desc'));
    const snap = await getDocs(q);
    const searches: RecentSearchItem[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      searches.push({
        id: data.id,
        userId: data.userId,
        query: data.query,
        statuteId: data.statuteId,
        statuteCitation: data.statuteCitation,
        statuteHeading: data.statuteHeading,
        category: data.category,
        searchedAt: data.searchedAt,
        resultsCount: data.resultsCount
      });
    });
    // Return at most the last 5
    return searches.slice(0, 5);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function persistRecentSearch(userId: string, search: RecentSearchItem): Promise<void> {
  const path = `users/${userId}/recentSearches/${search.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'recentSearches', search.id);
    await setDoc(docRef, {
      id: search.id,
      userId,
      query: search.query,
      statuteId: search.statuteId || '',
      statuteCitation: search.statuteCitation || '',
      statuteHeading: search.statuteHeading || '',
      category: search.category || 'all',
      searchedAt: search.searchedAt || new Date().toISOString(),
      resultsCount: typeof search.resultsCount === 'number' ? search.resultsCount : 0
    });

    // Enforce strict limit: only keep the last 5 searched statutes in Firestore
    try {
      const q = query(collection(db, `users/${userId}/recentSearches`), orderBy('searchedAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.size > 5) {
        const extraDocs = snap.docs.slice(5);
        for (const extraDoc of extraDocs) {
          await deleteDoc(extraDoc.ref);
        }
      }
    } catch (pruneErr) {
      console.warn('Failed to prune old search records:', pruneErr);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeRecentSearchDoc(userId: string, searchId: string): Promise<void> {
  const path = `users/${userId}/recentSearches/${searchId}`;
  try {
    const docRef = doc(db, 'users', userId, 'recentSearches', searchId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function clearAllRecentSearches(userId: string): Promise<void> {
  const path = `users/${userId}/recentSearches`;
  try {
    const snap = await getDocs(collection(db, path));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

