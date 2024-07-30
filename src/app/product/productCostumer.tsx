"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

import { FaRegSquareCheck } from "react-icons/fa6";
import { LuSquareEqual } from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

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

export default function Home() {
  const param = useSearchParams();
  const searchParam = param.get("search");
  const categoriaParam = param.get("categoria");
  const marcaParam = param.get("marca");
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [productData, setProductData] = useState<Product[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [categoriaFilter, setCategoriaFilter] = useState<string>();
  const [searchFilter, setSearchFilter] = useState<string>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  const [errorDialogVisible, setErrorDialogVisible] = useState<boolean>(false); 
  const [searchSwitch, setSearchSwitch] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        if (response.status !== 200) {
          throw new Error('Falha ao buscar categorias');
        }
        const data: Category[] = response.data;
        setCategories(data);
        const categoryMap = data.reduce((map, category) => {
          map[category.name] = String(category.id);
          return map;
        }, {} as { [key: string]: string });
        setCategoryMap(categoryMap);
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
  if (searchParam && searchParam?.length > 0){
    setSearchFilter(searchParam);
  }
  if (categoriaParam && categoriaParam?.length > 0){
    setCategoriaFilter(categoriaParam);
  }
  if (marcaParam && marcaParam?.length > 0){  
    setSearchFilter(marcaParam);
  }
  if (session) {
      const getInfo = async () => {
          try {
              const generalProductResponse = await axiosAuth.get("/api/product?perPage=1000");
              const generalProducts = generalProductResponse.data.data;

              const detailedProducts = await Promise.all(generalProducts.map(async (product: { id: any; }) => {
                  const productDetailResponse = await axiosAuth.get(`/api/product/${product.id}`);
                  const productDetails = productDetailResponse.data;
                  
                  const imageUrl = productDetails.productMedia?.[productDetails.productMedia.length - 1]?.media?.url || '';
                  
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

      getInfo();
  }
}, [session]);

useEffect(() => {
  changeFilter(searchFilter || '');
}, [searchFilter, categoriaFilter]);

  const changeFilter = async(searchP:string) => {
    const getInfo = async () => {
      const info = await axiosAuth.get(`/api/product?perPage=1000${searchP?`search=${searchP}`:''}`)
      if (info.data){
        console.log(info.data);
      }
      setProductList(info.data.data);
    }
    getInfo();
  }

  const renderProducts = (products: Product[]) => {
    return (
      <div className="flex flex-wrap gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative border p-3 rounded-lg flex flex-col items-center justify-between w-64 h-60 group"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-32 h-32 object-cover mb-4"
            />
            <h3 className="text-lg font-bold text-center">{product.name}</h3>
            {product.stock === 0 ? (
              <p className="text-red-500">Produto Indisponível</p>
            ) : product.salePrice ? (
              <p className="text-center">
                <span className="line-through text-gray-500">
                  R${product.price?.toFixed(2)}
                </span>{" "}
                <span className="text-red-500">R${product.salePrice.toFixed(2)}</span>
              </p>
            ) : (
              <p className="text-center">R${product.price?.toFixed(2)}</p>
            )}
             {product.stock !== 0 && (
          <Dialog>
            <DialogTrigger id="addToCartButton" onClick={() => addToCart(product)} className={`absolute bottom-4 px-6 py-4 bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity`}>
              <button
                className="w-full h-full">
                Adicionar ao Carrinho
              </button>
            </DialogTrigger>
            <DialogContent>
              <p className={`w-full flex justify-center items-center`}>
                {
                  addMessage?.includes("sucesso")
                    ?
                    <FaRegSquareCheck size={26} className={`text-green-500`} />
                    :
                    <LuSquareEqual size={26} />
                }</p>
              <p className={`w-full flex justify-center items-center text-center`} id="addMessage">{addMessage}</p>
            </DialogContent>
          </Dialog>
        )}
          </div>
        ))}
      </div>
    );
  };

  const [addMessage, setAddMessage] = useState<string>("O produto já se encontra no seu carrinho");

  const addToCart = async (product: Product) => {
    const cartData = await axiosAuth.get("/api/cart")

    if(cartData.data.products.some((item: { productId: number | undefined; }) => item.productId == product.id)){
      setAddMessage(`O produto "${product.name}" já se encontra no seu carrinho.`);
    }
    else{
      setAddMessage(`Produto "${product.name}" adicionado ao seu carrinho com sucesso!`);
      const addData = await axiosAuth.post("api/cart/add", {
        cartId: cartData.data.id,
        productId: product.id
      })
    }
  }

  const getRandomProducts = (products: Product[]) => {
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.ceil(products.length / 3));
  };

  return (
    <main className="flex flex-col items-center p-8">
      <section className="w-full max-w-7xl mb-12">
        <h2 className="text-3xl font-bold mb-2">Para você!</h2>
        <div className="flex flex-wrap gap-4">
          {renderProducts(getRandomProducts(productList))}
        </div>
      </section>

      <section className="w-full max-w-7xl mb-12">
        <div className="grid grid-cols-1 gap-4">
          {categories.map((category) => {
            const choosedProducts = productList.filter(
              (product) => String(product.categoryId) === String(category.id)
            );

            if (choosedProducts.length === 0) {
              return null;
            }

            return (
              <div key={category.id} className="mb-6">
                <h3 className="text-3xl font-bold mb-2">{category.name}</h3>
                <div className="flex flex-wrap gap-4">
                  {renderProducts(choosedProducts)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="w-full max-w-7xl mt-12 border-t pt-8">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-bold">SAPATOS.COM</h3>
            <p>© 2024 Todos os direitos reservados</p>
          </div>
          <div>
            <a href="#" className="block">A EMPRESA</a>
            <a href="#" className="block">POLÍTICA DE PRIVACIDADE</a>
            <a href="#" className="block">CONTATO</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

