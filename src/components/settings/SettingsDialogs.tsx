
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageDialog = ({ isOpen, onClose, currentLanguage, onLanguageChange }: LanguageDialogProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSave = () => {
    onLanguageChange(selectedLanguage);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Language</DialogTitle>
          <DialogDescription>
            Choose your preferred language for the application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Italian">Italian</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface TimezoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export const TimezoneDialog = ({ isOpen, onClose, currentTimezone, onTimezoneChange }: TimezoneDialogProps) => {
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);

  const handleSave = () => {
    onTimezoneChange(selectedTimezone);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Timezone</DialogTitle>
          <DialogDescription>
            Choose your local timezone for date and time display.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="EST">Eastern Time (EST)</SelectItem>
              <SelectItem value="PST">Pacific Time (PST)</SelectItem>
              <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
              <SelectItem value="CET">Central European Time (CET)</SelectItem>
              <SelectItem value="JST">Japan Standard Time (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ThemeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const ThemeDialog = ({ isOpen, onClose, currentTheme, onThemeChange }: ThemeDialogProps) => {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(currentTheme);

  const handleSave = () => {
    onThemeChange(selectedTheme);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Theme</DialogTitle>
          <DialogDescription>
            Choose between light and dark mode for the application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedTheme} onValueChange={(value: 'light' | 'dark') => setSelectedTheme(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
