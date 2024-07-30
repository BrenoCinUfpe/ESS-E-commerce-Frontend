"use client";

import React, { Suspense } from 'react';
import ProductPage from '@/app/admin/product/page';
import HomePage from '@/app/product/productCostumer';
import { useUserDataContext } from '../contexts/UserData';

const Page = () => {
  const { userData } = useUserDataContext();

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        {userData?.role === 'ADMIN' ? (
          <ProductPage />
        ) : (
          <HomePage />
        )}
      </Suspense>
    </div>
  );
};

export default Page;

