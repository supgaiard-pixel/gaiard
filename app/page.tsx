import { redirect } from 'next/navigation';

export default function Home() {
  // Redirection vers la page d'accueil publique
  redirect('/home');
}