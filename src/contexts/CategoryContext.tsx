
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCategoryConfig } from '@/hooks/useCategoryConfig';
import { CategoryConfig } from '@/types/config';

interface CategoryContextType {
  categoryConfigs: CategoryConfig[];
  saveCategoryConfig: (config: Omit<CategoryConfig, 'id'>) => Promise<boolean>;
  updateCategoryConfig: (id: string, config: Partial<CategoryConfig>) => Promise<boolean>;
  deleteCategoryConfig: (id: string) => Promise<boolean>;
  getCategoriesByParent: (parentId: string | null) => CategoryConfig[];
  getCategoryPath: (categoryId: string) => CategoryConfig[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>([]);

  const categoryHook = useCategoryConfig();

  useEffect(() => {
    loadCategoryConfigs();
  }, []);

  const loadCategoryConfigs = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('freshdesk_category_config')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching category configs:', error);
        return;
      }

      setCategoryConfigs(categories || []);
    } catch (error) {
      console.error('Error in loadCategoryConfigs:', error);
    }
  };

  const getCategoriesByParent = (parentId: string | null): CategoryConfig[] => {
    return categoryConfigs.filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getCategoryPath = (categoryId: string): CategoryConfig[] => {
    const path: CategoryConfig[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = categoryConfigs.find(cat => cat.id === currentId);
      if (!category) break;
      path.unshift(category);
      currentId = category.parent_id;
    }

    return path;
  };

  const value: CategoryContextType = {
    categoryConfigs,
    saveCategoryConfig: categoryHook.saveCategoryConfig,
    updateCategoryConfig: categoryHook.updateCategoryConfig,
    deleteCategoryConfig: categoryHook.deleteCategoryConfig,
    getCategoriesByParent,
    getCategoryPath,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
