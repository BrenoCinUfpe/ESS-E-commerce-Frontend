"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import axios from "@/lib/axios";
import ProductCarousel from "@/components/product-carrousel";

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

function HomeContent() {
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
  const [addMessage, setAddMessage] = useState<string>("O produto já se encontra no seu carrinho");

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
    if (searchParam && searchParam?.length > 0) {
      setSearchFilter(searchParam);
    }
    if (categoriaParam && categoriaParam?.length > 0) {
      setCategoriaFilter(categoriaParam);
    }
    if (marcaParam && marcaParam?.length > 0) {
      setSearchFilter(marcaParam);
    }
    const getInfo = async () => {
      try {
        const generalProductResponse = await axiosAuth.get("/api/product");
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
  }, [session, searchSwitch]);

  const changeFilter = async (searchP: string) => {
    const info = await axiosAuth.get(`/api/product?${searchP ? `search=${searchP}` : ''}`);
    if (info.data) {
      console.log(info.data);
    }
    setProductList(info.data.data);
  };

  const addToCart = async (product: Product) => {
    const cartData = await axiosAuth.get("/api/cart");

    if (cartData.data.products.some((item: { productId: number | undefined; }) => item.productId == product.id)) {
      setAddMessage(`O produto "${product.name}" já se encontra no seu carrinho.`);
    } else {
      setAddMessage(`Produto "${product.name}" adicionado ao seu carrinho com sucesso!`);
      await axiosAuth.post("api/cart/add", {
        cartId: cartData.data.id,
        productId: product.id
      });
    }
  };

  const getRandomProducts = (products: Product[]) => {
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.ceil(products.length / 2));
  };

  const renderProducts = (products: Product[]) => {
    return (
      <ProductCarousel products={products} addToCart={addToCart} addMessage={addMessage} />
    );
  };

  return (
    <main className="flex flex-col items-center p-4 md:p-8">
      <section className="w-full max-w-7xl mb-12">
        <h2 className="text-3xl font-bold mb-2">Para você!</h2>
        <div>
          {renderProducts(getRandomProducts(productList))}
        </div>
      </section>

      <section className="w-full max-w-7xl mb-12">
        <div>
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
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-lg font-bold">SAPATOS.COM</h3>
            <p>© 2024 Todos os direitos reservados</p>
          </div>
          <div className="mt-4 md:mt-0">
            <a href="#" className="block">A EMPRESA</a>
            <a href="#" className="block">POLÍTICA DE PRIVACIDADE</a>
            <a href="#" className="block">CONTATO</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
