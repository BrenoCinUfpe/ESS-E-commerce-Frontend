import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import Navbar from "@/components/navbar";
import OfertasTopBar from "@/components/ofertasTopBar";

import Provider from "./Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ESSapatos",
  description: "Projeto da disciplina de Engenharia de Software (CIn - UFPE)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      
      <Provider>
        <body className={inter.className}>
          
          <OfertasTopBar/>
          <Navbar/>

          {children}
          
          </body>
      </Provider>
    </html>
  );
}