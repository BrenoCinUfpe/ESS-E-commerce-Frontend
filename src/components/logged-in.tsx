import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import OrderList from './orderList';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import UpdateProfileComponent from './update-profile';
import ChangePasswordComponent from './change-password';
import { AuthMe, useUserDataContext } from '@/app/contexts/UserData';
import OrderListAdmin from './orderListAdmin';
import { useRouter } from 'next/navigation';

export type TLoggedInCardComponentProps = {
  userData: AuthMe;
  handleSignOut: () => void;
};

const LoggedInCardComponent = ({ userData, handleSignOut }: TLoggedInCardComponentProps) => {
  const router = useRouter();
  const [isUpdateProfileOpen, setUpdateProfileOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleUpdateProfileClose = () => setUpdateProfileOpen(false);
  const handleChangePasswordClose = () => setChangePasswordOpen(false);
  const redirectToUser = () => router.push('/admin/user');
  const redirectToProduct = () => router.push('/admin/product');
  
  return (
    <Card className="p-4 max-w-full mx-auto my-4 bg-white rounded-lg shadow-md md:max-w-md">
      <CardHeader>
        <CardTitle id="loggedInMessage" className="text-xl font-bold mb-2">Bem-vindo, {userData?.name ? userData.name : 'Carregando...'}</CardTitle>
        <CardDescription id="loggedInEmail" className="text-gray-600">{userData?.email ? userData.email : ''}</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3 flex-col">
        <Dialog open={isUpdateProfileOpen} onOpenChange={setUpdateProfileOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setUpdateProfileOpen(true)} id="updatePersonalDataButton" className="w-full">Atualizar meus dados</Button>
          </DialogTrigger>
          <DialogContent id="loggedInCloseButton" className="p-4">
            <UpdateProfileComponent onClose={handleUpdateProfileClose} />
          </DialogContent>
        </Dialog>
        <Dialog open={isChangePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogTrigger asChild>
            <Button id="updatePersonalPasswordButton" onClick={() => setChangePasswordOpen(true)} className="w-full">Mudar minha senha</Button>
          </DialogTrigger>
          <DialogContent className="p-4">
            <ChangePasswordComponent onClose={handleChangePasswordClose} />
          </DialogContent>
        </Dialog>
        {userData.role === 'ADMIN' && (
          <>
            <Button onClick={redirectToUser} id="usersButton" className="w-full">Usuários</Button>
            <Button onClick={redirectToProduct} className="w-full">Produtos</Button>
            <OrderListAdmin />
          </>
        )}
        {userData.role !== 'ADMIN' && <OrderList />}
        <Button onClick={handleSignOut} id="navbarLogoutButton" className="w-full">Deslogar</Button>
      </CardContent>
    </Card>
  );
};

export default LoggedInCardComponent;
