import axios from 'axios';

const serverUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const pages: string[] = [
  '/',
  '/carrinho',
  '/product',
  '/categorias',
];

const waitForServer = async (url: string, timeout: number = 30000, interval: number = 500): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await axios.get(url);
      console.log('Server UP');
      return;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  throw new Error(`[ERRO] Timout: Server não iniciado em ${timeout}ms`);
};

const preCompilePages = async (): Promise<void> => {
  try {
    await waitForServer(serverUrl);
    const promises = pages.map(page => axios.get(`${serverUrl}${page}`));
    await Promise.all(promises);
    console.log('Todas as páginas foram pré-compiladas');
  } catch (err) {
    console.error('Erro compilando as páginas:', err);
  }
};

preCompilePages();
