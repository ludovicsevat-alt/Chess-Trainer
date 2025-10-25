import { useState } from 'react';
import MainLayout from './MainLayout';

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState('overview');

  return (
    <MainLayout
      selectedMenu={selectedMenu}
      onSelectMenu={setSelectedMenu}
    />
  );
}
