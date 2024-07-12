import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/navbar";

import Provider from "./Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
          <div className={`w-full bg-black text-white text-[13px] flex justify-center items-center p-1`}>
            Aproveite as nossas promoções! Todos os produtos até 50% OFF
          </div>

          <Navbar/>

          {children}
          
          </body>
      </Provider>
    </html>
  );
}
