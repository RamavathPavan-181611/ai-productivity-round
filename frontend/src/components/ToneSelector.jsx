export default function ToneSelector({ tone, onChange }) {
  return (
    <div className="tone-selector" aria-label="Response tone">
      {['Professional', 'Casual', 'Concise'].map((option) => (
        <button
          key={option}
          type="button"
          className={tone === option ? 'tone-button active' : 'tone-button'}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
