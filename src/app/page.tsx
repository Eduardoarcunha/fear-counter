export default function Home() {
  return (
    <main className="container" style={{ display: "grid", gap: 16 }}>
      <h1>Daggerheart Fear Counter</h1>
      <p>Two screens:</p>
      <ol>
        <li><a href="/display">Display</a> — projector/stream overlay</li>
        <li><a href="/admin">Admin</a> — DM controls</li>
      </ol>
    </main>
  );
}
