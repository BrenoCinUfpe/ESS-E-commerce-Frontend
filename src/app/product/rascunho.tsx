"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "@/lib/axios";

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

export default function ProductPage() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [productData, setProductData] = useState<Product[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  const [errorDialogVisible, setErrorDialogVisible] = useState<boolean>(false); 
  const { register, handleSubmit, formState: { errors } } = useForm<Product>();

  const handleConfirmYes: SubmitHandler<Product> = async (data) => {
    const priceAsFloat = parseFloat(String(data.price));
    const stockAsFloat = parseFloat(String(data.stock));
    const categoryIdAsNumber = Number(data.categoryId);
    if (isNaN(priceAsFloat) || isNaN(stockAsFloat)) {
      console.error("Invalid price or stock value:", data.price, data.stock);
      return;
    }
    const newData = { ...data, price: priceAsFloat, stock: stockAsFloat, categoryId: categoryIdAsNumber };
    console.log(newData);

    try {
      const response = await axiosAuth.post("/api/product", newData);
      console.log(response);
      alert("Item cadastrado com sucesso!");
      window.location.reload();
    } catch (refreshError) {
      console.error("Erro ao enviar informações para o backend:", refreshError);
      alert(refreshError);
    }
  };

  const handleConfirmPatch: SubmitHandler<Product> = async (data) => {
    const priceAsFloat = data.price !== undefined ? parseFloat(String(data.price)) : undefined;
    const stockAsFloat = data.stock !== undefined ? parseFloat(String(data.stock)) : undefined;
    const categoryIdAsNumber = Number(data.categoryId);

    const newData: Partial<Product> = {};
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== "") {
        if (key === 'price' && priceAsFloat !== undefined) {
          newData[key] = priceAsFloat;
        } else if (key === 'stock' && stockAsFloat !== undefined) {
          newData[key] = stockAsFloat;
        } else if (key === 'categoryId') {
          newData[key] = categoryIdAsNumber;
        } else {
          newData[key] = value;
        }
      }
    });
    console.log({productData, updatedData: newData});
    console.log(newData);
    
    try {
      const response = await axiosAuth.patch(`/api/product/${selectedProduct?.id}`, newData);
      console.log(response);
      alert("Alterações salvas com sucesso!");
      window.location.reload();
    } catch (refreshError) {
      console.error("Erro ao enviar informações para o backend:", refreshError);
      alert("Erro");
    }
  };

  const handleConfirmDelete = async () => {
    console.log(selectedProduct);
    if (!selectedProduct) {
      return;
    }

    try {
      await axiosAuth.delete(`/api/product/${selectedProduct.id}`);
      alert("Produto deletado com sucesso!");
      window.location.reload();
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

  useEffect(() => {
    if (session) {
      const getInfo = async () => {
        try {
          // Obtenção dos produtos gerais
          console.log('Fetching general products...');
          const generalProductResponse = await axiosAuth.get("/api/product");
          const generalProducts = generalProductResponse.data.data;
          console.log('General products:', generalProducts);

          // Obtenção dos detalhes dos produtos
          console.log('Fetching product details...');
          const detailedProducts = await Promise.all(generalProducts.map(async (product: { id: any; }) => {
            const productDetailResponse = await axiosAuth.get(`/api/product/${product.id}`);
            console.log(`Product details for ID ${product.id}:`, productDetailResponse.data);
            const productDetails = productDetailResponse.data;

            // Extrair a última URL da mídia do produto
            const imageUrl = productDetails.productMedia?.[productDetails.productMedia.length - 1]?.media?.url || '';

            return {
              ...productDetails,
              imageUrl,
            };
          }));

          setProductData(generalProducts);
          setProductList(detailedProducts);

          console.log('Detailed products:', detailedProducts);
          console.log('General products:', generalProducts);

        } catch (error) {
          console.error("Error fetching product information:", error);
        }
      };

      getInfo();
    }
  }, [session]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Adicionar Itens</h1>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-8 w-full">
          {selectedProduct ? (
            <div>
              <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
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
                    defaultValue={selectedProduct?.categoryId}
                  > 
                    <option value="" disabled>{selectedProduct.categoryId}</option>
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
                <button className="bg-black text-white px-4 py-2 rounded" type="submit">Alterar Peça</button>
              </form>
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
                  placeholder="URL da imagem"
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
              <button className="bg-black text-white px-4 py-2 rounded" type="submit">Adicionar Peça</button>
            </form>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Produtos</h2>
          <table className="w-full bg-white rounded-lg">
            <thead>
              <tr>
                <th className="border p-2">Nome</th>
                <th className="border p-2">Imagem</th>
                <th className="border p-2">Preço</th>
                <th className="border p-2">Estoque</th>
                <th className="border p-2">Categoria</th>
                <th className="border p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => (
                <tr key={product.id}>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2"><img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover" /></td>
                  <td className="border p-2">{product.price?.toFixed(2)}</td>
                  <td className="border p-2">{product.stock}</td>
                  <td className="border p-2">{categories.find(cat => cat.id === product.categoryId)?.name}</td>
                  <td className="border p-2">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2" onClick={() => setSelectedProduct(product)}>Editar</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={handleConfirmDelete}>Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}