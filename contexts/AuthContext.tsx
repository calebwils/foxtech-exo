
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'customer' | 'seller' | 'courier') => Promise<void>;
  register: (data: { 
    name: string; 
    email: string; 
    password: string; 
    role: 'customer' | 'seller' | 'courier';
    storeName?: string;
    vehicleType?: 'bike' | 'car' | 'van';
  }) => Promise<void>;
  logout: () => void;
  completeProfile: () => Promise<void>;
  updateProfileImage: (url: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: 'customer' | 'seller' | 'courier') => {
    // Mock API Call latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // --- ROLE SIMULATION LOGIC ---
    let id = 'u-customer';
    let name = email.split('@')[0];
    let storeName = undefined;
    let vehicleType: 'bike' | 'car' | 'van' | undefined = undefined;
    let isProfileComplete = true;
    let isVerified = true;
    let finalEmail = email;
    let profileImage = undefined;

    // Hardcoded Admin Override (Always works)
    if (email.includes('admin')) {
      setUser({
        id: 'u-admin',
        name: 'Owner Admin',
        email: email,
        role: 'admin',
        storeName: 'Izitobuy HQ',
        isProfileComplete: true,
        isVerified: true
      });
      return;
    }

    // Check if the credentials match the requested role (Mock Logic)
    if (role === 'seller') {
      // FORCE the only supported seller account to avoid "two addresses" confusion
      id = 'u-seller'; 
      name = 'Habas Vendor';
      storeName = 'Habas Store';
      finalEmail = 'seller@habas.store.com'; // Standardize the email
      
      // Simulate an unverified seller login if email contained "new" originally
      if (email.includes('new')) {
        isProfileComplete = false;
        isVerified = false;
      }
    } else if (role === 'courier') {
      id = 'u-courier';
      name = 'Mike Delivery';
      vehicleType = 'bike';
      if (email.includes('new')) {
        isProfileComplete = false;
        isVerified = false;
      }
    } else {
      // Customer - always verified for shopping
      isProfileComplete = true;
      isVerified = true;
    }

    // Create the simulated user session
    setUser({
      id,
      name, 
      email: finalEmail,
      role: role,
      storeName: storeName,
      vehicleType: vehicleType,
      profileImage,
      isProfileComplete,
      isVerified
    });
  };

  const register = async (data: { 
    name: string; 
    email: string; 
    password: string; 
    role: 'customer' | 'seller' | 'courier';
    storeName?: string;
    vehicleType?: 'bike' | 'car' | 'van';
  }) => {
    // Mock API Call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Logic: Customers are verified instantly. Sellers/Couriers need profile completion.
    const isBusiness = data.role === 'seller' || data.role === 'courier';

    setUser({
      id: `u-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      storeName: data.storeName,
      vehicleType: data.vehicleType,
      // Important: Business accounts start unverified
      isProfileComplete: !isBusiness, 
      isVerified: !isBusiness 
    });
  };

  const completeProfile = async () => {
    if (user) {
        // Simulate submitting documents
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({ ...user, isProfileComplete: true, isVerified: true }); // Auto-verify for demo
    }
  };

  const updateProfileImage = async (url: string) => {
     if (user) {
         setUser({ ...user, profileImage: url });
     }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (user) {
        setUser({ ...user, ...data });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, completeProfile, updateProfileImage, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
