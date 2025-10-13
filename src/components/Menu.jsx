export default function Menu({ settings, setSettings }) {
  return (
    <div className="flex gap-4 mb-4">
      <select
        className="bg-gray-800 p-2 rounded"
        value={settings.playerColor}
        onChange={(e) =>
          setSettings({ ...settings, playerColor: e.target.value })
        }
      >
        <option value="white">Blanc</option>
        <option value="black">Noir</option>
      </select>

      <select
        className="bg-gray-800 p-2 rounded"
        value={settings.difficulty}
        onChange={(e) =>
          setSettings({ ...settings, difficulty: parseInt(e.target.value) })
        }
      >
        {[1, 2, 3, 4, 5, 6].map((lvl) => (
          <option key={lvl} value={lvl}>
            Difficulté {lvl}
          </option>
        ))}
      </select>
    </div>
  );
}
