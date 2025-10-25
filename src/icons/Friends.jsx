export default function FriendsIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3"/>
      <circle cx="16" cy="8" r="3"/>
      <path d="M4 18c0-2 2-4 4-4h0c2 0 4 2 4 4"/>
      <path d="M12 18c0-2 2-4 4-4h0c2 0 4 2 4 4"/>
    </svg>
  );
}

