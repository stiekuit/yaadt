
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CategoryConfig } from '@/types/config';

export const useCategoryConfig = () => {
  const { toast } = useToast();

  const saveCategoryConfig = async (config: Omit<CategoryConfig, 'id'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('freshdesk_category_config')
        .insert([config]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category configuration saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving category config:', error);
      toast({
        title: "Error",
        description: "Failed to save category configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCategoryConfig = async (id: string, config: Partial<CategoryConfig>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('freshdesk_category_config')
        .update(config)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category configuration updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating category config:', error);
      toast({
        title: "Error",
        description: "Failed to update category configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategoryConfig = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('freshdesk_category_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category configuration deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting category config:', error);
      toast({
        title: "Error",
        description: "Failed to delete category configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const getCategoriesByParent = (categoryConfigs: CategoryConfig[], parentId: string | null) => {
    return categoryConfigs.filter(config => config.parent_id === parentId);
  };

  const getCategoryPath = (categoryConfigs: CategoryConfig[], categoryId: string): CategoryConfig[] => {
    const category = categoryConfigs.find(c => c.id === categoryId);
    if (!category) return [];
    
    if (category.parent_id) {
      return [...getCategoryPath(categoryConfigs, category.parent_id), category];
    }
    return [category];
  };

  return {
    saveCategoryConfig,
    updateCategoryConfig,
    deleteCategoryConfig,
    getCategoriesByParent,
    getCategoryPath,
  };
};
