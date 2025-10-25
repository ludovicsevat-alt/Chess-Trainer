import LeftMenu from "./components/LeftMenu";
import CenterBoard from "./components/CenterBoard";
import RightMenu from "./components/RightMenu";

export default function MainLayout({ left, center, right, selectedMenu, onSelectMenu }) {
  return (
    <div className="layout">
      {left ?? <LeftMenu selected={selectedMenu} onSelect={onSelectMenu} />}
      {center ?? <CenterBoard />}
      {right ?? <RightMenu />}
    </div>
  );
}

