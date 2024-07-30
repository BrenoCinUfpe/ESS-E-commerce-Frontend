'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useUserDataContext } from '@/app/contexts/UserData';
import { FaRegUserCircle } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BiShoppingBag } from "react-icons/bi";
import { IoIosLogIn } from "react-icons/io";
import { CgSpinner, CgSpinnerTwoAlt } from "react-icons/cg";
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import CategoriesComponent from './categories';
import { useProductDataContext } from '@/app/contexts/ProductData';
import RegisterComponent from './register';
import LoggedInCardComponent from './logged-in';
import ForgotPasswordComponent from './forgot-password';
import { useRouter } from 'next/navigation';

interface Categoria {
  id: string
  nome: string
};

interface Product {
  cartId: number
  productId: number
  quantity: number
  userId: number
}

interface Cart {
  id?: number
  userId?: number
  locked?: boolean
  products: Product[]
}

const Navbar = () => {
  let { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const route = useRouter();
  const { userData, setUserData } = useUserDataContext();
  const [searchString, setSearchString] = useState<string>("");
  const [categorias, setCategorias] = useState<Categoria[]>();
  const marcas = ["Adidas", "Nike"];
  const [cart, setCart] = useState<Cart>();
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);
  const [messageLogin, setMessageLogin] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const { productData, setProductData } = useProductDataContext();
  const [userIsAdmin, setUserIsAdmin] = useState(userData.role === 'ADMIN');

  useEffect(() => {
    if (session && session.user) {
      const getInfo = async () => {
        const info = await axiosAuth.get("/api/auth/me");
        setUserData(info.data);
        const cart = await axiosAuth.get("/api/cart");
        setCart(cart.data);
        const categories = await axiosAuth.get("/api/categories");
        setCategorias(
          categories.data.map((item: { id: any; name: any; }) => ({ id: item.id, nome: item.name }))
        );
      };
      getInfo();
    }
  }, [session]);

  useEffect(() => {
    setUserIsAdmin(userData && userData.role === 'ADMIN');
  }, [userData.role]);

  const handleSignIn = async () => {
    setLoadingLogin(true);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (result?.ok) {
      setMessageLogin("authorized");
    } else {
      if (result?.error) {
        setMessageLogin('Email ou senha incorretos');
      }
    }
    setLoadingLogin(false);
  };

  const handleSignOut = async () => {
    if (!(session == null)) {
      signOut();
    }
  };

  const LogInCardComponent = (
    <Card>
      {loadingLogin ? (
        <div className={`w-full h-[150px] flex justify-center items-center`}>
          <CgSpinner size={30} className={`animate-spin`} />
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription className={`${!messageLogin ? (messageLogin == "authorized" ? "text-green-700" : "") : "text-red-800"}`}>
              {!messageLogin
                ? `Insira abaixo seu e-mail e senha`
                : messageLogin == "authorized"
                  ? `Login realizado com sucesso`
                  : `Erro: ${messageLogin}. Tente novamente.`}
            </CardDescription>
          </CardHeader>
          <CardContent className={`flex gap-3 flex-col`}>
            <Input placeholder={`E-mail`} onChange={(event) => setEmail(event.target.value)} id="emailInput" />
            <Input placeholder={`Senha`} type='password' onChange={(event) => setPassword(event.target.value)} id="senhaInput" />
            <div className='gap-3 flex'>
              <Button className='flex-1' onClick={() => { handleSignIn() }} id="loginButton">Entrar</Button>
              <Dialog>
                <DialogTrigger>
                  <Button className='w-full' id="forgetPasswordButton">Esqueci minha senha</Button>
                </DialogTrigger>
                <DialogContent className={`p-0 bg-transparent`}>
                  <ForgotPasswordComponent />
                </DialogContent>
              </Dialog>
            </div>
            <Dialog>
              <DialogTrigger>
                <Button className='flex-1' id="createAccountButton">Registrar-se</Button>
              </DialogTrigger>
              <DialogContent className={`p-0 bg-transparent`} id="dialogRegisterComponent">
                <RegisterComponent />
              </DialogContent>
            </Dialog>
          </CardContent>
        </>
      )}
    </Card>
  );

  const getCarrinho = () => {
    if (session && session.user) {
      const getInfo = async () => {
        setCartLoading(true);
        const info = await axiosAuth.get("/api/cart")


        // Guardando no contexto de ProductData informações sobre os produtos presentes no carrinho
        for (const item of info.data.products) {
          if (!productData.some(itemExistente => itemExistente.id === item.productId)) {
            const productInfo = await axiosAuth.get("/api/Product/" + item.productId);
            setProductData((prev) => [...prev, productInfo.data])
          }
        }

        //
        setCart(info.data);
        setCartLoading(false);
      }

      getInfo();
    }
  } 
  
  const LogInComponent = session ? (session.user ? <LoggedInCardComponent userData={userData} handleSignOut={handleSignOut} /> : LogInCardComponent) : LogInCardComponent;

  const handleLogoClick = () => {
    route.push("/");
  };

  return (
    <div className={`w-full h-fit p-2 sticky top-0 z-50 bg-white`}>
      <div className={`bg-white rounded-md h-12 sticky flex ml-4 mr-4 md:ml-[30px] md:mr-[30px] gap-3 items-center`}>
        <div className={`p-2 md:p-4 flex justify-center items-center`}>
          <a className={`font-abel text-[20px] md:text-[25px] hover:cursor-pointer`} onClick={handleLogoClick}>ESSapatos</a>
        </div>
        <NavigationMenu className={`transition-all hidden md:block`}>
          <NavigationMenuList>
            <div className={`p-2 md:p-4 flex justify-center items-center cursor-pointer`}>
              <div className={`font-abeezee text-[14px]`}><CategoriesComponent /></div>
            </div>
            <NavigationMenuItem>
              <div className={`p-2 md:p-4 flex justify-center items-center cursor-pointer hover:bg-accent/80 transition-all hover:text-accent-foreground h-10 rounded-md`}>
                <Link href={'/product'}>
                  <div className={`font-abeezee text-[14px] text-projRed`}>OFERTAS</div>
                </Link>
              </div>
              <NavigationMenuContent>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <div className={`p-2 md:p-4 flex justify-center items-center cursor-pointer`}>
                  <div className={`font-abeezee text-[14px]`}>MARCAS</div>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className={`w-[390px] h-fit mb-2`}>
                  <div className={`w-full h-full p-4`}>
                    {marcas.map(marca => (
                      <div key={marca} className={`w-fit hover:text-projRed transition-colors`}>
                        <Link href={`/product?search=${marca}`}>
                          <p className={`font-abeezee`}>{marca}</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className={`p-2 md:p-4 flex justify-center items-center flex-1`}>
          <div className={`font-abeezee text-[14px] rounded-full bg-projGray flex-1 flex`}>
            <div className={`min-h-full min-w-[50px] flex items-center justify-center`}>
              <Link href={`${searchString.length > 0 ? `/product?searchString=${searchString}` : `/`}`}>
                <FaMagnifyingGlass size={20} className={`text-black transition-opacity opacity-40 hover:opacity-60 cursor-pointer`} />
              </Link>
            </div>
            <Input onChange={(e) => { setSearchString(e.target.value) }} placeholder="Pesquise" className={`font-abeezee bg-transparent border-transparent focus-visible:ring-0 focus-visible:ring-offset-0`} />
          </div>
        </div>
        <Dialog onOpenChange={() => { setMessageLogin("") }}>
          <DialogTrigger>
            <div className={`p-2 md:p-4 flex justify-center items-center cursor-pointer`} id="navbarLoginButton">
              <FaRegUserCircle size={20} />
            </div>
          </DialogTrigger>
          <DialogContent className={`p-0 bg-transparent`}>
            {LogInComponent}
          </DialogContent>
        </Dialog>
        <Drawer>
          <DrawerTrigger onClick={() => { getCarrinho() }}>
            <div className={`p-2 md:p-4 flex justify-center items-center cursor-pointer`}>
              <FiShoppingCart size={20} id="navbarCartButton" />
            </div>
          </DrawerTrigger>
          <DrawerContent className={`min-w-[300px]`}>
            <DrawerHeader>
              <DrawerTitle>Carrinho</DrawerTitle>
              <DrawerDescription>{userData.name ? userData.name : ""}</DrawerDescription>
            </DrawerHeader>
            <div className={`w-full h-full`}>
              <div className={`w-full h-full flex justify-center items-center`}>
                {userData.email ? (
                  <>
                    {cart?.products && cart.products.length > 0 ? (
                      <div className={`ml-2 mr-5`} id="sideCartContainer">
                        {cart.products.map(item => (
                          <div className={`m-2 w-full h-[80px] rounded-md border border-slate-300 flex`} key={`${item.cartId}/${item.productId}`}>
                            <img
                              className={`m-2 bg-projGray border border-slate-300 rounded-md h-[62px] w-[62px]`}
                              src={
                                productData.find(product => product.id === item.productId)?.productMedia?.slice(-1)[0]?.media?.url ||
                                'https://media.istockphoto.com/id/1055079680/vector/black-linear-photo-camera-like-no-image-available.jpg?s=612x612&w=0&k=20&c=P1DebpeMIAtXj_ZbVsKVvg-duuL0v9DlrOZUvPG6UJk='
                              }
                            />
                            <div className={`h-full p-2 flex-column justify-center`}>
                              <p className={`font-abeezee`} id="productName">{` ${productData.find(product => product.id === item.productId)?.name}`}</p>
                              <p className={`font-abeezee`}>{`${item.quantity} unidade${String(item.quantity) == '1' ? '' : 's'}`}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <p className={`text-slate-600 flex-column`}>Carrinho vazio</p>
                        <div className={`p-4 w-full flex justify-center items-center`}>
                          <BiShoppingBag size={26} className={`text-slate-600`} />
                        </div>
                      </div>
                    )}
                  </>
                ) : cartLoading ? (
                  <CgSpinnerTwoAlt size={20} className={`animate-spin opacity-50`} />
                ) : (
                  <div className={`flex-column`}>
                    <p className={`text-slate-600 w-full flex justify-center items-center`}>Você está desconectado</p>
                    <div className={`p-4 w-full flex justify-center items-center`}>
                      <Dialog onOpenChange={() => { setMessageLogin("") }}>
                        <DialogTrigger>
                          <IoIosLogIn size={50} className={`text-slate-900`} />
                        </DialogTrigger>
                        <DialogContent className={`p-0 bg-transparent`}>
                          {LogInComponent}
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className={`text-slate-600`}>Clique no ícone acima para entrar</p>
                  </div>
                )}
              </div>
            </div>
            <DrawerFooter>
              {userData.email ? (
                <Link href="/carrinho" className={`w-full`}>
                  <Button className={`w-full`} id="goToCartButton">Ir para o carrinho</Button>
                </Link>
              ) : (
                <Button disabled={true}>Ir para o carrinho</Button>
              )}
              <DrawerClose>
                <p className={`w-full border rounded-md p-[6px] text-sm`} id="closeCartButton">Voltar</p>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default Navbar;
