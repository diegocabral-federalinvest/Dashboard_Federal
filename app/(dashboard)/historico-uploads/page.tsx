import { UploadHistoryClient } from './client';

export const metadata = {
  title: 'Histórico de Uploads | Federal Invest',
  description: 'Histórico completo de todos os arquivos importados para a plataforma',
};

export default function UploadHistoryPage() {
  return <UploadHistoryClient />;
} 