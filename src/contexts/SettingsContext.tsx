
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SettingsContextType {
  // Notification settings
  newTicketAlerts: boolean;
  chatMessages: boolean;
  
  // Security settings
  sessionTimeout: boolean;
  
  // Preference settings
  language: string;
  timezone: string;
  theme: 'light' | 'dark';
  
  // Actions
  updateNotificationSettings: (newTicketAlerts: boolean, chatMessages: boolean) => void;
  updateSecuritySettings: (sessionTimeout: boolean) => void;
  updatePreferenceSettings: (language: string, timezone: string, theme: 'light' | 'dark') => void;
  openTwoFactorConfig: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  // Notification settings
  const [newTicketAlerts, setNewTicketAlerts] = useState(() => {
    const saved = localStorage.getItem('settings-newTicketAlerts');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('settings-chatMessages');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Security settings
  const [sessionTimeout, setSessionTimeout] = useState(() => {
    const saved = localStorage.getItem('settings-sessionTimeout');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Preference settings
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('settings-language') || 'English';
  });
  
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('settings-timezone') || 'UTC';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('settings-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('settings-newTicketAlerts', JSON.stringify(newTicketAlerts));
  }, [newTicketAlerts]);

  useEffect(() => {
    localStorage.setItem('settings-chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('settings-sessionTimeout', JSON.stringify(sessionTimeout));
  }, [sessionTimeout]);

  useEffect(() => {
    localStorage.setItem('settings-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('settings-timezone', timezone);
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('settings-theme', theme);
  }, [theme]);

  const updateNotificationSettings = (newTicketAlertsValue: boolean, chatMessagesValue: boolean) => {
    setNewTicketAlerts(newTicketAlertsValue);
    setChatMessages(chatMessagesValue);
  };

  const updateSecuritySettings = (sessionTimeoutValue: boolean) => {
    setSessionTimeout(sessionTimeoutValue);
  };

  const updatePreferenceSettings = (languageValue: string, timezoneValue: string, themeValue: 'light' | 'dark') => {
    setLanguage(languageValue);
    setTimezone(timezoneValue);
    setTheme(themeValue);
  };

  const openTwoFactorConfig = () => {
    // TODO: Implement two-factor authentication configuration
    alert('Two-factor authentication configuration will be implemented in a future update.');
  };

  const value: SettingsContextType = {
    newTicketAlerts,
    chatMessages,
    sessionTimeout,
    language,
    timezone,
    theme,
    updateNotificationSettings,
    updateSecuritySettings,
    updatePreferenceSettings,
    openTwoFactorConfig,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
