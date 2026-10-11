import { useAuth } from './useAuth';

export const useGuestMode = () => {
  const { user } = useAuth();
  const isGuest = !user;
  
  return {
    isGuest,
    isAuthenticated: !isGuest,
  };
};
