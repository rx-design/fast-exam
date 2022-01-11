import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
} from 'firebase/auth';

function login(email: string, password: string): Promise<UserCredential> {
  const auth = getAuth();

  return setPersistence(auth, browserSessionPersistence)
    .then(() => signInWithEmailAndPassword(auth, email, password));
}

function logout(): Promise<void> {
  const auth = getAuth();

  return signOut(auth);
}

function register(email: string, password: string, displayName: string): Promise<void> {
  const auth = getAuth();

  return createUserWithEmailAndPassword(auth, email, password)
    .then(credential => updateProfile(credential.user, { displayName }));
}

export {
  login,
  logout,
  register,
};
