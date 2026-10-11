
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfig } from '@/contexts/ConfigContext';
import { CategoryConfig } from '@/types/config';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const CategorySettings = () => {
  const { categoryConfigs, saveCategoryConfig, updateCategoryConfig, deleteCategoryConfig, getCategoriesByParent, refreshConfigs } = useConfig();
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryParentId, setEditCategoryParentId] = useState<string | null>(null);
  const [newCategoryParentId, setNewCategoryParentId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Show all categories in a hierarchical view, not just top-level
    const sortedCategories = [...categoryConfigs].sort((a, b) => {
      // Sort by level first, then by display_order
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.display_order - b.display_order;
    });
    setCategories(sortedCategories);
  }, [categoryConfigs]);

  const getCategoryIndentation = (category: CategoryConfig) => {
    return category.level * 20; // 20px per level
  };

  const getCategoryPath = (category: CategoryConfig): string => {
    const path: CategoryConfig[] = [];
    let current: CategoryConfig | undefined = category;
    
    while (current) {
      path.unshift(current);
      current = categoryConfigs.find(c => c.id === current!.parent_id);
    }
    
    return path.map(c => c.name).join(' > ');
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const newCategory: Omit<CategoryConfig, 'id'> = {
      name: newCategoryName,
      parent_id: newCategoryParentId,
      level: newCategoryParentId ? categoryConfigs.find(c => c.id === newCategoryParentId)!.level + 1 : 0,
      display_order: 0,
      freshdesk_config_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const success = await saveCategoryConfig(newCategory);
    if (success) {
      setNewCategoryName('');
      setNewCategoryParentId(null);
      setIsCreateModalOpen(false);
      await refreshConfigs();
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
       toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!editingCategory) return;

    const updatedCategory: Partial<CategoryConfig> = {
      name: editCategoryName,
      parent_id: editCategoryParentId,
      level: editCategoryParentId ? categoryConfigs.find(c => c.id === editCategoryParentId)!.level + 1 : 0,
      updated_at: new Date().toISOString(),
    };

    const success = await updateCategoryConfig(editingCategory.id, updatedCategory);
    if (success) {
      setEditCategoryName('');
      setEditCategoryParentId(null);
      setEditingCategory(null);
      setIsEditModalOpen(false);
      await refreshConfigs();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const success = await deleteCategoryConfig(id);
    if (success) {
      await refreshConfigs();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    }
  };

  const openEditModal = (category: CategoryConfig) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryParentId(category.parent_id);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Settings</h2>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your Freshdesk tickets.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Parent Category
                  </Label>
                  <Select onValueChange={(value) => setNewCategoryParentId(value === 'none' ? null : value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {categoryConfigs.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleCreateCategory}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>A hierarchical list of your categories showing parent-child relationships.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Category Name</TableHead>
              <TableHead className="w-1/4">Level</TableHead>
              <TableHead className="w-1/4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  <div 
                    style={{ paddingLeft: `${getCategoryIndentation(category)}px` }}
                    className="flex items-center"
                  >
                    {category.level > 0 && (
                      <span className="text-gray-400 mr-2">
                        {'└─ '.repeat(1)}
                      </span>
                    )}
                    <span>{category.name}</span>
                  </div>
                  {category.level > 0 && (
                    <div className="text-xs text-gray-500 mt-1" style={{ paddingLeft: `${getCategoryIndentation(category)}px` }}>
                      Path: {getCategoryPath(category)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Level {category.level}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(category)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                  No categories configured. Create your first category to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Edit an existing category to organize your Freshdesk tickets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                Parent Category
              </Label>
              <Select value={editCategoryParentId || 'none'} onValueChange={(value) => setEditCategoryParentId(value === 'none' ? null : value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {categoryConfigs
                    .filter(category => category.id !== editingCategory?.id) // Prevent self-parent
                    .map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleEditCategory}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySettings;
