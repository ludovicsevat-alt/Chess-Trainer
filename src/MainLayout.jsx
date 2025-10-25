import LeftMenu from "./components/LeftMenu";
import CenterBoard from "./components/CenterBoard";
import RightMenu from "./components/RightMenu";

export default function MainLayout({ left, center, right, selectedView, onSelectView }) {
  return (
    <div className="layout">
      {left ?? <LeftMenu selected={selectedView} onSelect={onSelectView} />}
      {center ?? <CenterBoard />}
      {right ?? <RightMenu />}
    </div>
  );
}
