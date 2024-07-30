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


const OrderList = () => {
    const {userData, setUserData} = useUserDataContext();
    const {productData, setProductData} = useProductDataContext();


    const [fetched, setFetched] = useState<Order[]>();

    // Not ideal
    const [fetchedAux, setFetchedAux] = useState<ProductOrder[]>([]);

    const axiosAuth = useAxiosAuth();

    const getOrderList = async () => {
        const data = await axiosAuth.get(`/api/user/orders?targetEmail=${userData.email}`)
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


    const cancelOrder = async (orderId:number) => {
        if(window.confirm(`Tem certeza que deseja cancelar o pedido de código "N#${orderId}" ?`)){
            const data = await axiosAuth.delete(`/api/orders/${orderId}`);
        }
        else{}
    }

  return (
    <>
    <Dialog>
        <DialogTrigger onClick={()=>{getOrderList()}}>
            <Button className='w-full' id="pedidosCustomerButton">Lista de pedidos</Button>
        </DialogTrigger>
        <DialogContent className={``}>
        <div className={`size-[460px] overflow-y-scroll p-3 font-abel text-lg`} id="pedidosUserContainer">
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
                                            <p className={` bg-red-300 bg-opacity-25 p-2 rounded-md text-sm cursor-pointer transition-all hover:scale-105 hover:saturate-150`} onClick={()=>{cancelOrder(item.id)}} >Cancelar Pedido</p>
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
        </DialogContent>
    </Dialog>
  </>
  )
}

export default OrderList