import { useAuthContext } from '@/context/AuthContext';

/** Convenience re-export so components import a hook, not the context. */
export const useAuth = useAuthContext;
