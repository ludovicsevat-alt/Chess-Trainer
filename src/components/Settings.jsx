import { useSettings } from "../contexts/SettingsContext";
import { BOARD_THEMES } from "../constants/boardThemes";

function Select({ label, value, onChange, children }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <select value={value} onChange={onChange}>
        {children}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="form-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  formatValue,
}) {
  const displayValue = formatValue ? formatValue(value) : value;
  return (
    <div className="form-field">
      <label>
        {label} {unit ? `(${displayValue}${unit})` : `(${displayValue})`}
      </label>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </div>
  );
}

export default function Settings() {
  const { settings, messages, updateSetting, resetSettings } = useSettings();

  const handleThemeChange = (event) =>
    updateSetting("theme", event.target.value);

  const handleLanguageChange = (event) =>
    updateSetting("language", event.target.value);

  const handleHighlightToggle = (event) =>
    updateSetting("highlightLastMove", event.target.checked);

  const handleAnimationToggle = (event) =>
    updateSetting("animationEnabled", event.target.checked);

  const handleAnimationSpeed = (event) =>
    updateSetting("animationDuration", Number(event.target.value));

  const handleBoardThemeChange = (event) =>
    updateSetting("boardTheme", event.target.value);

  const handleMuteToggle = (event) =>
    updateSetting("soundMuted", event.target.checked);

  const handleVolumeChange = (event) =>
    updateSetting("soundVolume", Number(event.target.value));

  const handleReset = () => {
    if (window.confirm(messages.settings.resetConfirm)) {
      resetSettings();
    }
  };

  return (
    <div className="content settings-page">
      <h1 className="panel-title">{messages.settings.pageTitle}</h1>

      <section className="panel">
        <div className="section-label">{messages.settings.generalTitle}</div>
        <Select
          label={messages.settings.themeLabel}
          value={settings.theme}
          onChange={handleThemeChange}
        >
          <option value="dark">{messages.settings.themeDark}</option>
          <option value="light">{messages.settings.themeLight}</option>
        </Select>

        <Select
          label={messages.settings.languageLabel}
          value={settings.language}
          onChange={handleLanguageChange}
        >
          <option value="fr">Fr</option>
          <option value="en">En</option>
        </Select>
      </section>

      <section className="panel">
        <div className="section-label">{messages.settings.boardTitle}</div>
        <Select
          label={messages.settings.boardThemeLabel}
          value={settings.boardTheme}
          onChange={handleBoardThemeChange}
        >
          {Object.keys(BOARD_THEMES).map((key) => (
            <option key={key} value={key}>
              {messages.settings.boardThemes?.[key] ?? key}
            </option>
          ))}
        </Select>
        <Checkbox
          label={messages.settings.highlightLastMove}
          checked={settings.highlightLastMove}
          onChange={handleHighlightToggle}
        />
        <Checkbox
          label={messages.settings.animationEnabled}
          checked={settings.animationEnabled}
          onChange={handleAnimationToggle}
        />
        <Slider
          label={messages.settings.animationDuration}
          value={settings.animationDuration}
          min={0}
          max={600}
          step={50}
          onChange={handleAnimationSpeed}
          unit="ms"
        />
      </section>

      <section className="panel">
        <div className="section-label">{messages.settings.soundsTitle}</div>
        <Checkbox
          label={messages.settings.muteLabel}
          checked={settings.soundMuted}
          onChange={handleMuteToggle}
        />
        <Slider
          label={messages.settings.volumeLabel}
          value={settings.soundVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={handleVolumeChange}
          unit="%"
          formatValue={(v) => Math.round(v * 100)}
        />
      </section>

      <section className="panel">
        <div className="section-label">{messages.settings.dataTitle}</div>
        <button className="btn-danger" onClick={handleReset}>
          {messages.settings.resetButton}
        </button>
      </section>
    </div>
  );
}
