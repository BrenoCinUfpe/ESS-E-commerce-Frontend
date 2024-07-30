import Link from 'next/link';
import { TbError404Off } from "react-icons/tb";

export default function Custom404() {
    return (
      <div className={`w-full h-screen flex justify-center items-center`}>
        <div>
          <TbError404Off size={80} className={`w-full flex justify-center`}/>
          <p className={`w-full flex justify-center font-abel mb-6 text-2xl font-semibold`}>Página não encontrada</p>
          <Link href="/">
          <p className={`w-full flex justify-center font-abeezee p-2 border rounded-md hover:bg-slate-100 transition-all`}>Voltar para a página principal</p>
          </Link>
          
        </div>
      </div>
    );
  }