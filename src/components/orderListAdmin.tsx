'use client';
import React, {useState, useEffect} from 'react'

import { useUserDataContext } from '@/app/contexts/UserData';

import useAxiosAuth from '@/lib/hooks/useAxiosAuth';

import { Button } from './ui/button';

import { floatToMoney } from '@/app/utils/floatToMoney';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useProductDataContext } from '@/app/contexts/ProductData';
import { Input } from './ui/input';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";



const IsoToString = (isoString: string) => {
    const date = new Date(isoString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;    
}

interface Order{
    id: number
    code: string
    price: number
    userId: number
    estimatedDelivery?: string
    status: string
    develiryAddressld?:string
    createdAt?: string
    updatedAt?: string
}

interface ProductOrder{
    id: number
    orderId: number
    productId: number
    quantity: number
}

interface UserInfo{
    id: number
    email: string
    name: string
    status: string
    updatedAt: string
    createdAt: string
}


const OrderList = () => {
    const {userData, setUserData} = useUserDataContext();
    const {productData, setProductData} = useProductDataContext();


    const [fetched, setFetched] = useState<Order[]>();

    // Not ideal
    const [fetchedAux, setFetchedAux] = useState<ProductOrder[]>([]);

    const axiosAuth = useAxiosAuth();

    const getOrderList = async (chosenEmail: string) => {
        const data = await axiosAuth.get(`/api/user/orders?targetEmail=${chosenEmail}`)
        if(data.status==200){
            setFetched(data.data);

            let itemsInOrder: ProductOrder[] = [];

            // Not ideal
            for(const item of data.data){
                const dataProducts = await axiosAuth.get(`api/orders/${item.id}/products`);
                dataProducts.data.forEach((e: ProductOrder) => {
                    if(fetchedAux.length==0){
                        setFetchedAux(prev => [...prev, e])
                        itemsInOrder.push(e);
                    }
                })
            }

            for (const item of itemsInOrder) {

                const foundItem = itemsInOrder.find(itemExistente => itemExistente.id == item.productId);
                if (foundItem) {
                  const productInfo = await axiosAuth.get(`/api/Product/${item.productId}`);
                  setProductData((prev) => [...prev, productInfo.data])
                }
            }

        }

    }

    // Looking for users
    const [searchString, setSearchString] = useState<string>();

    const [searchSwitch, setSearchSwitch] = useState<boolean>(false);

    const [userList, setUserList] = useState<UserInfo[]>([]);

    useEffect(() => {

        setUserList([]);

        const getUsers = async () => {
            const users = await axiosAuth.get(`/api/user?search=${searchString}`)

            console.log(users.data.data);

            if(users.status==200){
                setUserList(users.data.data);
            }
        }

        getUsers();

    }, [searchSwitch])


    //
    const [viewBool, setViewBool] = useState<boolean>(false);
    const [userID, setUserID] = useState<number>(0);

    const cancelOrder = async (orderId:number) => {
        if(window.confirm(`Tem certeza que deseja cancelar o pedido de código "N#${orderId}" ?`)){
            const data = await axiosAuth.delete(`/api/orders/${orderId}`);
        }
        else{}
    }

  return (
    <>
    <Dialog onOpenChange={()=>{
        setViewBool(false);
        setUserID(0);
        setSearchString("");
        setUserList([]);
    }}>
        <DialogTrigger onClick={()=>{}}>
            <Button className='w-full' id="pedidosAdminButton">Lista de Pedidos de Usuários</Button>
        </DialogTrigger>
        <DialogContent className={``}>
        <div className={`size-[460px] overflow-y-scroll p-3 font-abel text-lg`}>
            {
            !viewBool
                ?
                <div className={`w-full h-full`}>
                    
                    <div className={`w-full flex gap-2`}>
                    <Input className={`bg-slate-100`} onChange={(e)=>{setSearchString(e.target.value)}}
                        onKeyDown={(e)=>{
                            if(e.key=='Enter'){
                                setSearchSwitch(!searchSwitch)
                            }
                        }}
                    id="historicoPedidosUsuarioInput">
                    </Input>

                    <Button className={`rounded-full`} onClick={()=>{setSearchSwitch(!searchSwitch)}} id="historicoPedidosSearchButton">
                        <FaMagnifyingGlass size={12} color={'white'}></FaMagnifyingGlass>
                    </Button>
                    </div>

                    <div className={`w-full h-full overflow-y-scroll`} id="historicoPedidosUserContainer">
                    {
                                userList && userList.length>0
                                ?
                                userList.map(item => (
                                    <>
                                        <div className={`w-full min-h-12 bg-slate-100 bg-opacity-75 mt-4 rounded-md flex p-3`} key={item.id}>
                                            <FaUserCircle size={64} className={`h-[98px] ml-2 mr-2`} />
                                            <div className={`w-full h-[98px] p-2 text-sm flex justify-center items-center font-abeezee`}>
                                                <div>
                                                    <p>{item.name}</p>
                                                    <p className={`text-[12px]`}>{item.email}</p>
                                                    <p>{`ID: ${item.id}`}</p>
                                                    <p>{`Conta criada em: ${item.createdAt}`}</p>
                                                </div>
                                            </div>

                                            <div className={`p-1 flex justify-center items-center`}>
                                                <Button className={`bg-orange-600 w-[110px] h-[80px] rounded-full font-abeezee`}
                                                    onClick={()=>{setViewBool(true);setUserID(item.id);getOrderList(item.email)}}
                                                id="openHistoricoButton" > 
                                                    Abrir Histórico
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ))
                            :
                            <div className={`w-full h-full flex justify-center items-center opacity-50`}>
                                Nenhum usuário encontrado
                            </div> 
                    }
                    </div>
                </div>
                :
            <div className={`w-full h-full`}>
                <div className={`w-full flex justify-center items-center gap-2`}>
                <FaUserCircle size={64} className={`h-[98px] ml-2 mr-2`} />
                    <div className={`flex-1`}>
                        <p className={`w-full flex justify-center items-center text-2xl`}>{userList.find(item => item.id==userID)?.name}</p>
                        <p className={`w-full flex justify-center items-center text-sm`}>{userList.find(item => item.id==userID)?.email}</p>
                        <p className={`w-full flex justify-center items-center`}>{`ID: ${userList.find(item => item.id==userID)?.id}`}</p>
                        <p className={`w-full flex justify-center items-center`}>{`Conta criada em: ${userList.find(item => item.id==userID)?.createdAt}`}</p>
                    </div>
                </div>

                <div className={`w-full h-[350px] rounded-lg`} id="pedidosContainerAdmin">
                    {
                        fetched && fetched.length>0
                            ?
                            fetched.map(item => (
                            <div key={item.id}>
                                <div className={`w-full flex justify-center items-center bg-projGray rounded-lg mt-3 p-2 ${item.status=='CANCELED'?'opacity-50':''}`}>
                                    <div className={`w-full`}>
                                        <p className={`w-full flex justify-center font-semibold`}>{`Pedido N#`+item.id}</p>
                                        <p className={`w-full flex justify-center`}>{item.createdAt?IsoToString(item.createdAt):""}</p>
                                        <div className={`w-full flex h-28`}>
                                            <div className={`flex-1 overflow-y-scroll flex justify-center items-center`}>
                                                <div>
                                                {
                                                    fetchedAux.length>0
                                                        ?
                                                        fetchedAux.filter(detalhe => detalhe.orderId===item.id).map(detalhesProduto =>(
                                                            <div key={`${detalhesProduto.orderId}/${detalhesProduto.productId}`} className={`text-[16px]`}>   
                                                                <p>{`${productData.find(prodData => prodData.id==detalhesProduto.productId)?.name} (${detalhesProduto.quantity}x) - R$ ${
                                                                    floatToMoney((productData.find(prodData => prodData.id==detalhesProduto.productId)?.price ?? 15)*detalhesProduto.quantity)}
                                                                    `}</p>
                                                            </div>

                                                            
                                                        ))
                                                        :
                                                        <></>
                                                }
                                                </div>
                                            </div>
                                            <div className={`flex-1 flex justify-center items-center`}>
                                                <div className={`w-fit flex-column justify-center items-center`}>
                                                    <p className={`w-full flex justify-center`}>{`Valor Total:`}</p>
                                                    <p className={`w-full flex justify-center text-2xl font-bold`}>{`R$ ${floatToMoney(item.price)}`}</p>
                                                </div>
                                            </div>

                                        </div>
                                        <p className={`w-full flex justify-center`}>{`Entrega: `}{item.estimatedDelivery?IsoToString(item.estimatedDelivery):"Indefinido"}</p>
                                        <p className={`w-full flex justify-center`} >{`Status: `+item.status}</p>
                                        
                                        {
                                            item.status=='PROCESSING'
                                                ?
                                                <div className={`w-full flex justify-center mt-1 mb-1`}>
                                                    <p className={` bg-red-300 bg-opacity-25 p-2 rounded-md text-sm cursor-pointer`} onClick={()=>{cancelOrder(item.id);window.location.reload()}}>Cancelar Pedido</p>
                                                </div>           
                                                :
                                                <></>
                                        }
                                    </div>
                                </div>    
                            </div>
                            ))
                            :
                            <div className={`w-full flex justify-center items-center bg-projGray rounded-lg p-4`}>
                                    <p>Nenhum pedido encontrado</p>
                            </div>
                    }
                </div>
            </div>
            }
        </div>
        </DialogContent>
    </Dialog>
  </>
  )
}

export default OrderList