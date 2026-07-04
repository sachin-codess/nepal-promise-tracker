// The signature element: a pennant-shaped status badge, echoing Nepal's
// double-pennant flag (the only non-rectangular national flag on Earth).

const STATUS = {
  kept: { label: "Kept", color: "#2E7D4F" },
  broken: { label: "Broken", color: "#C0392B" },
  in_progress: { label: "In progress", color: "#C9862B" },
};

export default function StatusPennant({ status }) {
  const s = STATUS[status] ?? STATUS.in_progress;
  return (
    <span className="pennant" style={{ "--pennant-color": s.color }}>
      <svg width="14" height="20" viewBox="0 0 14 20" aria-hidden="true">
        {/* Two stacked triangles — the Nepal flag silhouette */}
        <path d="M1 0 L13 5 L1 10 Z" fill={s.color} />
        <path d="M1 9 L13 14.5 L1 20 Z" fill={s.color} opacity="0.75" />
      </svg>
      {s.label}
    </span>
  );
}

export { STATUS };
