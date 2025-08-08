export {};

// Define o tipo para as roles permitidas
export type Roles = 'ADMIN' | 'INVESTOR' | 'VIEWER' | 'EDITOR';

declare global {
  interface CustomJwtSessionClaims {
    metadata?: { // Usar '?' se a metadata for opcional
      role?: Roles; // Usar '?' se a role for opcional
    };
  }
} 