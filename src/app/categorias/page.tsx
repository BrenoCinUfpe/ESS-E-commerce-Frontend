'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { cn } from "@/lib/utils";
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useUserDataContext } from '@/app/contexts/UserData';
import { useRouter } from 'next/navigation';

interface Media {
  id: number;
  url: string;
}

interface Category {
  id: number;
  name: string;
  mediaId: number;
  createdAt: string;
  deletedAt?: any;
  updatedAt?: any;
  Media?: Media;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryImage, setNewCategoryImage] = useState<string>('');
  const [creatingCategory, setCreatingCategory] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [errorDialogVisible, setErrorDialogVisible] = useState<boolean>(false); 

  const axiosAuth = useAxiosAuth();
  const { userData } = useUserDataContext();
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        if (response.status !== 200) {
          throw new Error('Falha ao buscar categorias');
        }
        const data: Category[] = response.data;
        setCategories(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocorreu um erro desconhecido');
        }
        setLoading(false);
        setErrorDialogVisible(true);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryImage.trim()) return;
    setCreatingCategory(true);
    try {
      const response = await axiosAuth.post("/api/categories", {
        name: newCategoryName,
        imageUrl: newCategoryImage
      });
      const newCategory: Category = response.data;
      setCategories(prevCategories => [...prevCategories, newCategory]);
      setNewCategoryName('');
      setNewCategoryImage('');
      setCreatingCategory(false);
      setDialogVisible(false);
    } catch (err: any) {
      if (err?.request?.status === 409) {
        setError('Categoria já existe!');
      } else {
        setError('Ocorreu um erro desconhecido');
      }
      setCreatingCategory(false);
      setErrorDialogVisible(true);
    }
  };

  const handleEditCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryImage.trim() || !editingCategory) return;
    setCreatingCategory(true);
    try {
      const response = await axiosAuth.put(`/api/categories`, {
        name: newCategoryName,
        imageUrl: newCategoryImage,
        id: editingCategory.id
      });
      const updatedCategory: Category = { ...editingCategory, name: newCategoryName, Media: { id: editingCategory.mediaId, url: newCategoryImage } };
      setCategories(prevCategories => 
        prevCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      setNewCategoryName('');
      setNewCategoryImage('');
      setCreatingCategory(false);
      setEditDialogVisible(false);
      setEditingCategory(null);
    } catch (err: any) {
      if (err?.request?.status === 409) {
        setError('Categoria já existe!');
      } else {
        setError('Ocorreu um erro desconhecido');
      }
      setCreatingCategory(false);
      setErrorDialogVisible(true); // Show error dialog
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await axiosAuth.delete(`/api/categories/${deletingCategory.id}`);
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== deletingCategory.id)
      );
      setDeleteDialogVisible(false);
      setDeletingCategory(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido');
      }
      setErrorDialogVisible(true); // Show error dialog
    }
  };

  const openCreateDialog = () => {
    setNewCategoryName('');
    setNewCategoryImage('');
    setDialogVisible(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryImage(category.Media?.url || '');
    setEditDialogVisible(true);
  };

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogVisible(true);
  };

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/product?categoria=${categoryId}`);
  };

  const closeErrorDialog = () => {
    setErrorDialogVisible(false);
    setError(null);
  };

  if (loading) return <div id="loading-message">Carregando...</div>;

  return (
    <div className={cn("w-full flex flex-col")}>
      <div className={cn("flex flex-col mb-4")}>
        {categories.map((category) => (
          <button 
            key={category.id} 
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "flex items-start justify-between p-4 border-b border-gray-300",
              "w-full",
              "bg-white",
              "hover:bg-gray-100",
              "relative",
              "text-left"
            )}
            id={`category-item-${category.id}`}
          >
            <div className="flex items-center">
              {category.Media?.url && (
                <img 
                  src={category.Media.url} 
                  alt={category.name} 
                  className="w-12 h-12 object-cover mr-4" 
                  id={`category-image-${category.id}`}
                />
              )}
              <span id={`category-name-${category.id}`}>{category.name}</span>
            </div>
            {userData?.role === 'ADMIN' && (
              <div className="flex space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditDialog(category); }}
                  className="p-1 text-gray-600 hover:text-gray-900 edit"
                >
                  <PencilIcon className="w-4 h-4" /> 
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openDeleteDialog(category); }} 
                  className="p-1 text-gray-600 hover:text-gray-900 delete"
                >
                  <TrashIcon className="w-4 h-4" /> 
                </button>
              </div>
            )}
          </button>
        ))}
      </div>
      {userData?.role === 'ADMIN' && (
        <div className={cn("flex justify-center mt-4")}>
          <button
            onClick={openCreateDialog} 
            className={cn(
              "flex items-center justify-center p-2 bg-green-500 text-white rounded",
              "hover:bg-green-600"
            )}
            id="add-category-button"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="ml-2">Adicionar Categoria</span>
          </button>
        </div>
      )}
      {dialogVisible && (
        <div className={cn(
          "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center",
          "z-20"
        )}>
          <div className={cn(
            "bg-white p-6 rounded shadow-md",
            "w-96"
          )}>
            <h2 className="text-lg font-bold mb-4">Criar Nova Categoria</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da categoria"
              className="mb-4 p-2 border border-gray-300 rounded w-full"
              id="new-category-name-input"
            />
            <input
              type="text"
              value={newCategoryImage}
              onChange={(e) => setNewCategoryImage(e.target.value)}
              placeholder="URL da Imagem"
              className="mb-4 p-2 border border-gray-300 rounded w-full"
              id="new-category-image-input"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDialogVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                id="cancel-create-category-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCategory}
                className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${creatingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={creatingCategory}
                id="confirm-create-category-button"
              >
                {creatingCategory ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {editDialogVisible && (
        <div className={cn(
          "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center",
          "z-20"
        )}>
          <div className={cn(
            "bg-white p-6 rounded shadow-md",
            "w-96"
          )}>
            <h2 className="text-lg font-bold mb-4">Editar Categoria</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da categoria"
              className="mb-4 p-2 border border-gray-300 rounded w-full"
              id="edit-category-name-input"
            />
            <input
              type="text"
              value={newCategoryImage}
              onChange={(e) => setNewCategoryImage(e.target.value)}
              placeholder="URL da Imagem"
              className="mb-4 p-2 border border-gray-300 rounded w-full"
              id="edit-category-image-input"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditDialogVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                id="cancel-edit-category-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditCategory}
                className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${creatingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={creatingCategory}
                id="confirm-edit-category-button"
              >
                {creatingCategory ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteDialogVisible && (
        <div className={cn(
          "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center",
          "z-20"
        )}>
          <div className={cn(
            "bg-white p-6 rounded shadow-md",
            "w-96"
          )}>
            <h2 className="text-lg font-bold mb-4">Excluir Categoria</h2>
            <p>Tem certeza de que deseja excluir esta categoria?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setDeleteDialogVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                id="cancel-delete-category-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCategory}
                className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600`}
                id="confirm-delete-category-button"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {errorDialogVisible && error && (
        <div className={cn(
          "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center",
          "z-20"
        )}>
          <div className={cn(
            "bg-white p-6 rounded shadow-md",
            "w-96"
          )}>
            <h2 className="text-lg font-bold mb-4">Erro</h2>
            <p>{error}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closeErrorDialog}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                id="close-error-dialog-button"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;

