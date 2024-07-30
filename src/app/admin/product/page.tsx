"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from "@/lib/axios";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useUserDataContext } from '@/app/contexts/UserData';

interface Product {
  id?: number;
  name?: string;
  description: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  stock?: number;
  salePrice?: number;
  productMedia?: { id: number; media: Media; mediaId: number; productId: number; }[];
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

interface Media {
  id: number;
  url: string;
}

function ProductPageContent() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [productData, setProductData] = useState<Product[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  const [errorDialogVisible, setErrorDialogVisible] = useState<boolean>(false); 
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Product>();
  const { userData } = useUserDataContext();
  const router = useRouter();
  const [userIsAdmin, setUserIsAdmin] = useState(userData.role === 'ADMIN');
  const [isAuthenticated, setIsAuthenticated] = useState(session?.user.accessToken != null);

  useEffect(() => {
    setUserIsAdmin(userData.role === 'ADMIN');
    setIsAuthenticated(session?.user.accessToken != null);
    if (isAuthenticated && !userIsAdmin) {
      router.push('/');
    }
  }, [userData, session]);

  const handleConfirmYes: SubmitHandler<Product> = async (data) => {
    const priceAsFloat = parseFloat(String(data.price));
    const stockAsFloat = parseFloat(String(data.stock));
    const categoryIdAsNumber = Number(data.categoryId);
    if (isNaN(priceAsFloat) || isNaN(stockAsFloat)) {
      console.error("Invalid price or stock value:", data.price, data.stock);
      return;
    }
    const newData = { ...data, price: priceAsFloat, stock: stockAsFloat, categoryId: categoryIdAsNumber };

    try {
      const response = await axiosAuth.post("/api/product", newData);
      alert("Item cadastrado com sucesso!");
      reset();
      getInfo();
    } catch (refreshError) {
      console.error("Erro ao enviar informações para o backend:", refreshError);
      alert(refreshError);
    }
  };

  const convertProductData = (data: Product) => {
    const priceAsFloat = parseFloat(String(data.price));
    const stockAsFloat = parseFloat(String(data.stock));
    const categoryIdAsNumber = Number(data.categoryId);
    return { ...data, price: priceAsFloat, stock: stockAsFloat, categoryId: categoryIdAsNumber };
  };

  const updateProduct = async (productId: number | undefined, newData: any) => {
    try {
      await axiosAuth.patch(`/api/product/${productId}`, newData);
      alert("Alterações salvas com sucesso!");
      reset();
      getInfo();
    } catch (error) {
      console.error("Erro ao atualizar o produto:", error);
      alert("Erro ao atualizar o produto.");
    }
  };

  const handleConfirmPatch: SubmitHandler<Product> = async (data) => {
    const newData = convertProductData(data);
    await updateProduct(selectedProduct?.id, newData);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      await axiosAuth.delete(`/api/product/${selectedProduct.id}`);
      alert("Produto deletado com sucesso!");
      reset();
      getInfo();
    } catch (deleteError) {
      console.error("Erro ao deletar o produto:", deleteError);
      alert(deleteError);
    }
  };

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

  const getInfo = async () => {
    try {
        const generalProductResponse = await axiosAuth.get("/api/product?perPage=1000");
        const generalProducts = generalProductResponse.data.data;

        const detailedProducts = await Promise.all(generalProducts.map(async (product: { id: any; }) => {
            const productDetailResponse = await axiosAuth.get(`/api/product/${product.id}`);
            const productDetails = productDetailResponse.data;

            const imageUrl = productDetails.productMedia?.[productDetails.productMedia.length - 1]?.media?.url;
            
            return {
                ...productDetails,
                imageUrl,
            };
        }));

        setProductData(generalProducts);
        setProductList(detailedProducts);

    } catch (error) {
        console.error("Error fetching product information:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userIsAdmin) {
        getInfo();
    }
  }, [session]);

  useEffect(() => {
    if (!selectedProduct) {
      reset();
    }
  }, [selectedProduct, reset]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div className="w-full max-w-5xl p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Cadastro de Itens</h1>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-8 w-full mx-auto">
        {selectedProduct ? (
          <div>
            <h1 className="text-xl font-bold  mb-4">{selectedProduct.name}</h1>
            <form onSubmit={handleSubmit(handleConfirmPatch)}>
              <div>
                <label>Nome da peça</label>
                <input
                  {...register("name", { required: false })}
                  type="text"
                  className="w-full border rounded p-2 mb-4"
                  placeholder={selectedProduct.name}
                />
              </div>
              <div>
                <label>Imagem da peça</label>
                <input
                  {...register("imageUrl", { required: false })}
                  type="text"
                  className="w-full border rounded p-2 mb-4"
                  placeholder={selectedProduct.imageUrl}
                />
              </div>
              <div>
                <label>Preço</label>
                <input
                  {...register("price", { required: false })}
                  type="text"
                  className="w-full border rounded p-2 mb-4"
                  placeholder={selectedProduct.price?.toFixed(2)}
                />
              </div>
              <div>
                <label>Estoque</label>
                <input
                  {...register("stock", { required: false })}
                  type="text"
                  className="w-full border rounded p-2 mb-4"
                  placeholder={String(selectedProduct.stock)}
                />
              </div>
              <div>
                <label>Categoria</label>
                <select
                  {...register("categoryId", { required: false })}
                  className="w-full border rounded p-2 mb-4"
                  defaultValue={String(selectedProduct?.categoryId) || ""}
                >
                  <option value="" disabled>{String(selectedProduct?.categoryId) ? categories.find((category) => String(category.id) === String(selectedProduct.categoryId))?.name : 'Selecione uma categoria'}</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Descrição</label>
                <textarea
                  {...register("description", { required: false })}
                  className="w-full border rounded p-2 mb-4"
                  placeholder={selectedProduct.description}
                />
              </div>
              <button className="bg-black text-white px-4 py-2 rounded" type="submit">
                Salvar alterações
              </button>
            </form>
            <div className="flex space-x-4">
              <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {handleConfirmDelete();
                }}
              >
                Deletar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleConfirmYes)}>
            <div>
              <label>Nome da peça</label>
              <input
                {...register("name", { required: true })}
                type="text"
                className="w-full border rounded p-2 mb-4"
                placeholder="Nome da peça"
              />
            </div>
            <div>
              <label>Imagem da peça</label>
              <input
                {...register("imageUrl", { required: true })}
                type="text"
                className="w-full border rounded p-2 mb-4"
                placeholder="Imagem da peça"
              />
            </div>
            <div>
              <label>Preço</label>
              <input
                {...register("price", { required: true })}
                type="text"
                className="w-full border rounded p-2 mb-4"
                placeholder="Preço"
              />
            </div>
            <div>
              <label>Estoque</label>
              <input
                {...register("stock", { required: true })}
                type="text"
                className="w-full border rounded p-2 mb-4"
                placeholder="Estoque"
              />
            </div>
            <div>
              <label>Categoria</label>
              <select
                {...register("categoryId", { required: true })}
                className="w-full border rounded p-2 mb-4"
                defaultValue={""}
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Descrição</label>
              <textarea
                {...register("description", { required: true })}
                className="w-full border rounded p-2 mb-4"
                placeholder="Descrição"
              />
            </div>
            <button className="bg-black text-white px-4 py-2 rounded" type="submit">
              Salvar
            </button>
          </form>
        )}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Todos os Produtos</h2>
        <div className="flex flex-wrap gap-4">
          {productList.map((product, index) => (
            <div
              key={product.id}
              className={`relative border p-4 rounded-lg flex flex-col items-center group justify-between w-64 h-80 ${
                selectedProduct?.id === product.id ? 'border-4 border-black' : 'border-gray-300'
              }`}
              onClick={() => setSelectedProduct(product)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-32 h-32 object-cover mb-4"
              />
              <p className="text-lg font-bold text-center"><strong>{product.name}</strong></p>
              <p className="text-center">R${product.price}</p>
              <p className="text-center">Estoque: {product.stock}</p>
              <button
                className="absolute bottom-4 px-4 py-2 bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                }}
              >
                Selecionar produto
              </button>
            </div>
          ))}
          <div
            className="border p-4 rounded-lg flex flex-col items-center justify-between cursor-pointer group border-gray-300 w-64 h-80"
            onClick={() => {
              setSelectedProduct(null);
            }}
          >
            <div className="w-32 h-32 flex items-center justify-center mb-4 bg-gray-200 rounded-full">
              <span className="text-3xl text-gray-600">+</span>
            </div>
            <p className="text-lg font-bold text-center">Adicionar produto</p>
            <button
              className="px-4 py-2 bg-black text-white rounded mt-4"
              onClick={() => {
                setSelectedProduct(null);
              }}
            >
              Clique aqui
            </button>
          </div>
        </div>
      </div>
    </div>
</main>
  );
}

function ProductPageWrapper() {
  return (
    <ProductPageContent/>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductPageWrapper />
    </Suspense>
  );
}
