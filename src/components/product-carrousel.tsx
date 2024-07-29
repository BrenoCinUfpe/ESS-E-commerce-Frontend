import React from 'react';
import Slider from "react-slick";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FaRegSquareCheck } from "react-icons/fa6";
import { LuSquareEqual } from "react-icons/lu";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

export interface Product {
  id?: number;
  name?: string;
  description: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  stock?: number;
  salePrice?: number;
  productMedia?: {
    id: number;
    media: {
      id: number;
      url: string;
    };
    mediaId: number;
    productId: number;
  }[];
}

type TProductCarouselComponent = {
  products: Product[];
  addToCart: (product: Product) => void;
  addMessage: string;
};

const ProductCarousel = ({ products, addToCart, addMessage }: TProductCarouselComponent) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 2000,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      }
    ]
  };

  return (
    <div className="relative w-full">
      <Slider {...settings}>
        {products.map((product, index) => (
          <div key={index} className="p-4">
            <div className="relative border p-3 rounded-lg flex flex-col items-center justify-between w-full h-96 group">
              <img
                src={product?.productMedia[0]?.media?.url ? product?.productMedia[0]?.media?.url : "https://media.istockphoto.com/id/1055079680/vector/black-linear-photo-camera-like-no-image-available.jpg?s=612x612&w=0&k=20&c=P1DebpeMIAtXj_ZbVsKVvg-duuL0v9DlrOZUvPG6UJk="
                }
                alt={product.name}
                className="w-full h-48 object-cover mb-4"
              />
              <h3 className="text-lg font-bold text-center">{product.name}</h3>
              {product.stock === 0 ? (
                <p className="text-red-500">Produto Indisponível</p>
              ) : product.salePrice ? (
                <>
                  <p className="text-center">
                    <span className="line-through text-gray-500">
                      R${product.price?.toFixed(2)}
                    </span>{" "}
                    <span className="text-red-500">R${product.salePrice.toFixed(2)}</span>
                  </p>
                  <Dialog>
                    <DialogTrigger onClick={() => addToCart(product)} className="px-2 py-1 mt-2 bg-black text-white rounded">
                      Adicionar ao Carrinho
                    </DialogTrigger>
                    <DialogContent>
                      <p className="w-full flex justify-center items-center">
                        {addMessage?.includes("sucesso")
                          ? <FaRegSquareCheck size={26} className="text-green-500" />
                          : <LuSquareEqual size={26} />}
                      </p>
                      <p className="w-full flex justify-center items-center text-center" id="addMessage">{addMessage}</p>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <>
                  <p className="text-center">R${product.price?.toFixed(2)}</p>
                  <Dialog>
                    <DialogTrigger onClick={() => addToCart(product)} className="px-2 py-1 mt-2 bg-black text-white rounded">
                      Adicionar ao Carrinho
                    </DialogTrigger>
                    <DialogContent>
                      <p className="w-full flex justify-center items-center">
                        {addMessage?.includes("sucesso")
                          ? <FaRegSquareCheck size={26} className="text-green-500" />
                          : <LuSquareEqual size={26} />}
                      </p>
                      <p className="w-full flex justify-center items-center text-center" id="addMessage">{addMessage}</p>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductCarousel;
