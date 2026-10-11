
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/contexts/ConfigContext';

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string | null) => void;
}

export const CategorySelector = ({ value, onChange }: CategorySelectorProps) => {
  const { categoryConfigs, getCategoriesByParent, getCategoryPath } = useConfig();
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    if (value && categoryConfigs.length > 0) {
      const path = getCategoryPath(value);
      setSelectedPath(path.map(cat => cat.id));
      setCurrentLevel(path.length - 1);
    } else {
      setSelectedPath([]);
      setCurrentLevel(0);
    }
  }, [value, categoryConfigs, getCategoryPath]);

  const getAvailableCategories = (level: number) => {
    const parentId = level === 0 ? null : selectedPath[level - 1];
    return getCategoriesByParent(parentId);
  };

  const handleLevelChange = (level: number, categoryId: string) => {
    const newPath = [...selectedPath];
    newPath[level] = categoryId;
    
    // Remove any levels beyond the current selection
    newPath.splice(level + 1);
    
    setSelectedPath(newPath);
    
    // Find the selected category to determine if it has children
    const category = categoryConfigs.find(cat => cat.id === categoryId);
    const hasChildren = getCategoriesByParent(categoryId).length > 0;
    
    if (hasChildren) {
      setCurrentLevel(level + 1);
      onChange(null); // Don't select until we reach a leaf node
    } else {
      setCurrentLevel(level);
      onChange(categoryId); // This is a leaf node, select it
    }
  };

  const renderLevelSelector = (level: number) => {
    const categories = getAvailableCategories(level);
    
    if (categories.length === 0) return null;

    const levelLabels = ['Category', 'Subcategory', 'Sub-subcategory'];
    const label = levelLabels[level] || `Level ${level + 1}`;

    return (
      <div key={level} className="space-y-2">
        <Label>{label}</Label>
        <Select
          value={selectedPath[level] || ''}
          onValueChange={(categoryId) => handleLevelChange(level, categoryId)}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderBreadcrumb = () => {
    if (selectedPath.length === 0) return null;

    const path = getCategoryPath(selectedPath[selectedPath.length - 1]);
    
    return (
      <div className="text-sm text-gray-600 mb-2">
        <span className="font-medium">Selected: </span>
        {path.map((cat, index) => (
          <span key={cat.id}>
            {index > 0 && ' > '}
            {cat.name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderBreadcrumb()}
      
      <div className="space-y-4">
        {Array.from({ length: currentLevel + 1 }, (_, level) => renderLevelSelector(level))}
        {selectedPath.length > 0 && getAvailableCategories(currentLevel).length > 0 && renderLevelSelector(currentLevel)}
      </div>
    </div>
  );
};
