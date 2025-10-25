import LeftMenu from './components/LeftMenu';
import RightMenu from './components/RightMenu';
import StaticBoard from './components/StaticBoard';
import PlayVsAI from './components/PlayVsAI';
import PlayLocal from './components/PlayLocal';
import Training from './components/Training';
import Puzzles from './components/Puzzles';
import Stats from './components/Stats';
import Settings from './components/Settings';

function renderCenter(menu) {
  switch (menu) {
    case 'ai':
      return <PlayVsAI />;
    case 'local':
      return <PlayLocal />;
    case 'training':
      return <Training />;
    case 'puzzle':
      return <Puzzles />;
    case 'stats':
      return <Stats />;
    case 'settings':
      return <Settings />;
    case 'overview':
    default:
      return <StaticBoard />;
  }
}

export default function MainLayout({ left, center, right, selectedMenu = 'overview', onSelectMenu }) {
  return (
    <div className="layout">
      {left ?? <LeftMenu selected={selectedMenu} onSelect={onSelectMenu} />}
      {center ?? renderCenter(selectedMenu)}
      {right ?? <RightMenu selectedMenu={selectedMenu} />}
    </div>
  );
}
