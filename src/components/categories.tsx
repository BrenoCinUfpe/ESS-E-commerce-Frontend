import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { CgSpinnerTwoAlt } from 'react-icons/cg';

interface Category {
  id: number;
  name: string;
}

const CategoriesComponent: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        if (response.status === 200) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Falha ao buscar categorias', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <Link href="/categorias">
          <div className="p-4 flex justify-center items-center cursor-pointer">
            <div className="font-abeezee text-[14px]">CATEGORIAS</div>
          </div>
        </Link>
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[390px] h-fit mb-2">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center p-8">
              <CgSpinnerTwoAlt size={16} className="animate-spin opacity-50" />
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="w-full h-full p-4">
              {categories.map(item => (
                <div key={item.id} className="w-full hover:text-projRed transition-colors">
                  <Link href={`/product?categoria=${item.id}`} className="block w-full">
                    <p className="font-abeezee">{item.name}</p>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex justify-center items-center p-8">
              <p className="font-abeezee">Nenhuma categoria disponível</p>
            </div>
          )}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

export default CategoriesComponent;
