'use client';
import React, {useState, useEffect} from 'react'

import { IoMdClose } from "react-icons/io";


const OfertasTopBar = () => {
    const [closed, setClosed] = useState<boolean>(false);

  return (
    <div className={`${closed?`h-0 overflow-hidden`:`h-fit`}transition-all bg-black text-white flex justify-center items-center`}>
        <p className={`flex-1 flex justify-center ml-10 p-1`}>Aproveite as nossas promoções! Todos os produtos até 50% OFF</p>

        <div className={`mr-8 p-1`}>
            <IoMdClose size={16} onClick={()=>{setClosed(true)}}/>
        </div>
    </div>
  )
}

export default OfertasTopBar