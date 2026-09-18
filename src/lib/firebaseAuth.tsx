"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { auth, db } from "./firebase";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Trade {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  openTime: string;
  closeTime: string;
  openPrice: number;
  closePrice: number;
  lots: number;
  profit: number;
  pips: number;
  status: "WIN" | "LOSS";
  notes?: string;
}

export interface FBUser {
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL?: string | null;
  emailVerified: boolean;
  createdAt: string;
  loginHistory: string[];
  enrolledProducts: string[];
  courseProgress: Record<string, Record<string, boolean>>; // productId → lessonId → done
  trades?: Trade[];
  balance?: number;
  tier?: "Basic" | "Pro" | "VIP";
  role?: "student" | "admin";
}

interface AuthContextType {
  user: FBUser | null;
  loading: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  enrollProduct: (productId: string) => void;
  updateLessonProgress: (productId: string, lessonId: string, done: boolean) => void;
  clearError: () => void;
  saveTrade: (trade: Trade) => Promise<void>;
  updateBalance: (balance: number) => Promise<void>;
  updateUserProfile: (data: { firstName?: string; lastName?: string; phone?: string; displayName?: string; tier?: "Basic" | "Pro" | "VIP"; role?: "student" | "admin" }) => Promise<boolean>;
  updateUserTierByAdmin: (targetUid: string, newTier: "Basic" | "Pro" | "VIP") => Promise<boolean>;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const FirebaseAuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<FBUser | null>(() => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem("tfx_fb_user");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setUser = useCallback((u: FBUser | null | ((prev: FBUser | null) => FBUser | null)) => {
    setUserState((prev) => {
      const next = typeof u === "function" ? u(prev) : u;
      if (typeof window !== "undefined") {
        if (next) {
          localStorage.setItem("tfx_fb_user", JSON.stringify(next));
        } else {
          localStorage.removeItem("tfx_fb_user");
        }
      }
      return next;
    });
  }, []);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const existingData = userDocSnap.data() as FBUser;
            const updatedUser: FBUser = {
              ...existingData,
              trades: existingData.trades || [],
              balance: existingData.balance ?? 100000
            };
            setUser(updatedUser);
          } else {
            // Document doesn't exist in Firestore yet (e.g. initial Google login or signup interrupted)
            const nameParts = (firebaseUser.displayName || "").split(" ");
            const firstName = nameParts[0] || "Trader";
            const lastName = nameParts.slice(1).join(" ") || "";
            const now = new Date().toISOString();
            
            const fallbackUser: FBUser = {
              uid: firebaseUser.uid,
              firstName,
              lastName,
              displayName: firebaseUser.displayName || "Trader",
              email: firebaseUser.email || "",
              phone: firebaseUser.phoneNumber || "",
              photoURL: firebaseUser.photoURL || null,
              emailVerified: firebaseUser.emailVerified,
              createdAt: now,
              loginHistory: [now],
              enrolledProducts: [],
              courseProgress: {},
              trades: [],
              balance: 100000
            };
            
            await setDoc(userDocRef, fallbackUser);
            setUser(fallbackUser);
          }
        } catch (err) {
          console.error("Error fetching user document on state change:", err);
          // Construct fallback user from auth data
          const nameParts = (firebaseUser.displayName || "").split(" ");
          const firstName = nameParts[0] || "Trader";
          const lastName = nameParts.slice(1).join(" ") || "";
          const now = new Date().toISOString();
          
          setUser({
            uid: firebaseUser.uid,
            firstName,
            lastName,
            displayName: firebaseUser.displayName || "Trader",
            email: firebaseUser.email || "",
            phone: firebaseUser.phoneNumber || "",
            photoURL: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified,
            createdAt: now,
            loginHistory: [now],
            enrolledProducts: [],
            courseProgress: {},
            trades: [],
            balance: 100000
          });
        }
      } else {
        const storedFb = typeof window !== "undefined" ? localStorage.getItem("tfx_fb_user") : null;
        if (!storedFb) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const clearError = useCallback(() => setError(null), []);

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = useCallback(async (data: SignUpData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      const displayName = `${data.firstName} ${data.lastName}`;
      await updateProfile(firebaseUser, { displayName });

      const now = new Date().toISOString();
      const dbUser: FBUser = {
        uid: firebaseUser.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || "",
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified,
        createdAt: now,
        loginHistory: [now],
        enrolledProducts: [],
        courseProgress: {},
        trades: [],
        balance: 100000
      };

      await setDoc(doc(db, "users", firebaseUser.uid), dbUser);
      setUser(dbUser);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      console.error("SignUp error:", err);
      const firebaseError = err as { code?: string; message?: string };
      let msg = firebaseError.message || "Sign up failed.";
      if (firebaseError.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please sign in.";
      } else if (firebaseError.code === "auth/invalid-email") {
        msg = "The email address is invalid.";
      } else if (firebaseError.code === "auth/weak-password") {
        msg = "Password must be at least 6 characters.";
      }
      setError(msg);
      setLoading(false);
      return false;
    }
  }, []);

  // ── Sign In ──────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let dbUser: FBUser;
      const now = new Date().toISOString();

      if (userDocSnap.exists()) {
        const existingData = userDocSnap.data() as FBUser;
        const updatedHistory = [now, ...(existingData.loginHistory || [])].slice(0, 20);

        dbUser = {
          ...existingData,
          displayName: firebaseUser.displayName || existingData.displayName,
          emailVerified: firebaseUser.emailVerified,
          loginHistory: updatedHistory,
          trades: existingData.trades || [],
          balance: existingData.balance ?? 100000
        };

        await updateDoc(userDocRef, {
          loginHistory: updatedHistory,
          trades: dbUser.trades,
          balance: dbUser.balance
        });
      } else {
        const nameParts = (firebaseUser.displayName || "").split(" ");
        const firstName = nameParts[0] || "Trader";
        const lastName = nameParts.slice(1).join(" ") || "";
        dbUser = {
          uid: firebaseUser.uid,
          firstName,
          lastName,
          displayName: firebaseUser.displayName || "Trader",
          email: firebaseUser.email || email,
          phone: firebaseUser.phoneNumber || "",
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified,
          createdAt: now,
          loginHistory: [now],
          enrolledProducts: [],
          courseProgress: {},
          trades: [],
          balance: 100000
        };
        await setDoc(userDocRef, dbUser);
      }

      setUser(dbUser);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      console.error("SignIn error:", err);
      const firebaseError = err as { code?: string; message?: string };

      // Auto-create user account if it doesn't exist in Firebase Auth yet
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/invalid-credential"
      ) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          const nameParts = (firebaseUser.displayName || email.split("@")[0]).split(" ");
          const firstName = nameParts[0] || "Trader";
          const lastName = nameParts.slice(1).join(" ") || "";
          const now = new Date().toISOString();

          const dbUser: FBUser = {
            uid: firebaseUser.uid,
            firstName,
            lastName,
            displayName: firebaseUser.displayName || email.split("@")[0].toUpperCase(),
            email: email.toLowerCase().trim(),
            phone: "",
            photoURL: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified,
            createdAt: now,
            loginHistory: [now],
            enrolledProducts: [],
            courseProgress: {},
            trades: [],
            balance: 100000
          };

          await setDoc(doc(db, "users", firebaseUser.uid), dbUser);
          setUser(dbUser);
          setLoading(false);
          return true;
        } catch (signUpErr: unknown) {
          console.error("Auto sign-up fallback error:", signUpErr);
        }
      }

      let msg = firebaseError.message || "Sign in failed.";
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/invalid-credential"
      ) {
        msg = "Incorrect email or password. Please try again.";
      }
      setError(msg);
      setLoading(false);
      return false;
    }
  }, []);

  // ── Google Sign In ───────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let dbUser: FBUser;
      const now = new Date().toISOString();

      if (userDocSnap.exists()) {
        const existingData = userDocSnap.data() as FBUser;
        const updatedHistory = [now, ...(existingData.loginHistory || [])].slice(0, 20);

        dbUser = {
          ...existingData,
          displayName: firebaseUser.displayName || existingData.displayName,
          emailVerified: firebaseUser.emailVerified,
          loginHistory: updatedHistory,
          trades: existingData.trades || [],
          balance: existingData.balance ?? 100000
        };

        await updateDoc(userDocRef, {
          loginHistory: updatedHistory,
          trades: dbUser.trades,
          balance: dbUser.balance
        });
      } else {
        const nameParts = (firebaseUser.displayName || "").split(" ");
        const firstName = nameParts[0] || "Google";
        const lastName = nameParts.slice(1).join(" ") || "User";
        dbUser = {
          uid: firebaseUser.uid,
          firstName,
          lastName,
          displayName: firebaseUser.displayName || "Google User",
          email: firebaseUser.email || "",
          phone: firebaseUser.phoneNumber || "",
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified,
          createdAt: now,
          loginHistory: [now],
          enrolledProducts: [],
          courseProgress: {},
          trades: [],
          balance: 100000
        };
        await setDoc(userDocRef, dbUser);
      }

      setUser(dbUser);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      console.error("Google Sign-In error:", err);
      const firebaseError = err as { code?: string; message?: string };
      let msg = firebaseError.message || "Google Sign-In failed.";
      if (firebaseError.code === "auth/popup-closed-by-user") {
        msg = "Google sign-in popup was closed before completing.";
      }
      setError(msg);
      setLoading(false);
      return false;
    }
  }, []);

  // ── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    setLoading(true);
    fbSignOut(auth)
      .then(() => {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("tfx_fb_user");
          localStorage.removeItem("tfx_user");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("SignOut error:", err);
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("tfx_fb_user");
          localStorage.removeItem("tfx_user");
        }
        setLoading(false);
      });
  }, [setUser]);

  // ── Reset Password ───────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: unknown) {
      console.error("ResetPassword error:", err);
      const firebaseError = err as { code?: string; message?: string };
      let msg = firebaseError.message || "Failed to send reset link.";
      if (firebaseError.code === "auth/user-not-found") {
        msg = "No account found with this email.";
      }
      setError(msg);
      return false;
    }
  }, []);

  // ── Enroll Product ───────────────────────────────────────────────────────
  const enrollProduct = useCallback((productId: string) => {
    if (!user) return;

    setUser(prev => {
      if (!prev) return null;
      if (prev.enrolledProducts.includes(productId)) return prev;
      return {
        ...prev,
        enrolledProducts: [...prev.enrolledProducts, productId]
      };
    });

    const userDocRef = doc(db, "users", user.uid);
    updateDoc(userDocRef, { enrolledProducts: arrayUnion(productId) }).catch((err) => {
      console.error("EnrollProduct Firestore error:", err);
    });
  }, [user]);

  // ── Update Lesson Progress ───────────────────────────────────────────────
  const updateLessonProgress = useCallback((productId: string, lessonId: string, done: boolean) => {
    if (!user) return;

    setUser(prev => {
      if (!prev) return null;
      const currentProgress = prev.courseProgress[productId] || {};
      return {
        ...prev,
        courseProgress: {
          ...prev.courseProgress,
          [productId]: {
            ...currentProgress,
            [lessonId]: done
          }
        }
      };
    });

    const userDocRef = doc(db, "users", user.uid);
    updateDoc(userDocRef, {
      [`courseProgress.${productId}.${lessonId}`]: done
    }).catch((err) => {
      console.error("UpdateLessonProgress Firestore error:", err);
    });
  }, [user]);

  // ── Save Simulator Trade ─────────────────────────────────────────────────
  const saveTrade = useCallback(async (trade: Trade) => {
    if (!user) return;

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        trades: [trade, ...(prev.trades || [])]
      };
    });

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      trades: arrayUnion(trade)
    }).catch((err) => {
      console.error("SaveTrade Firestore error:", err);
    });
  }, [user]);

  // ── Update Simulator Balance ─────────────────────────────────────────────
  const updateBalance = useCallback(async (newBalance: number) => {
    if (!user) return;

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: newBalance
      };
    });

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      balance: newBalance
    }).catch((err) => {
      console.error("UpdateBalance Firestore error:", err);
    });
  }, [user]);

  // ── Update User Profile Details ──────────────────────────────────────────
  const updateUserProfile = useCallback(async (data: { firstName?: string; lastName?: string; phone?: string; displayName?: string; tier?: "Basic" | "Pro" | "VIP"; role?: "student" | "admin" }): Promise<boolean> => {
    if (!user) return false;

    const newFirstName = data.firstName !== undefined ? data.firstName : user.firstName;
    const newLastName = data.lastName !== undefined ? data.lastName : user.lastName;
    const newPhone = data.phone !== undefined ? data.phone : user.phone;
    const newDisplayName = data.displayName || `${newFirstName} ${newLastName}`.trim();
    const newTier = data.tier !== undefined ? data.tier : (user.tier || "VIP");
    const newRole = data.role !== undefined ? data.role : (user.role || "student");

    const updatedUser: FBUser = {
      ...user,
      firstName: newFirstName,
      lastName: newLastName,
      displayName: newDisplayName,
      phone: newPhone,
      tier: newTier,
      role: newRole
    };

    setUser(updatedUser);

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        firstName: newFirstName,
        lastName: newLastName,
        displayName: newDisplayName,
        phone: newPhone,
        tier: newTier,
        role: newRole
      });
      return true;
    } catch (err) {
      console.error("Error updating user profile in Firestore:", err);
      return false;
    }
  }, [user]);

  // ── Update User Tier By Admin ─────────────────────────────────────────────
  const updateUserTierByAdmin = useCallback(async (targetUid: string, newTier: "Basic" | "Pro" | "VIP"): Promise<boolean> => {
    try {
      const userDocRef = doc(db, "users", targetUid);
      await updateDoc(userDocRef, { tier: newTier });
      if (user && user.uid === targetUid) {
        setUser(prev => prev ? { ...prev, tier: newTier } : null);
      }
      return true;
    } catch (err) {
      console.error("Error updating user tier by admin:", err);
      return false;
    }
  }, [user]);

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        enrollProduct,
        updateLessonProgress,
        clearError,
        saveTrade,
        updateBalance,
        updateUserProfile,
        updateUserTierByAdmin
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useFirebaseAuth = (): AuthContextType => {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider");
  return ctx;
};
