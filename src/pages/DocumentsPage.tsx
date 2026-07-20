const docs = [
  [
    "01",
    "旅行概要",
    "旅行期間・宿泊先・主要移動をまとめた資料",
    "./docs/trip-overview.md",
  ],
  [
    "02",
    "Supabase設定",
    "家族間同期を有効化するための手順",
    "https://github.com/harutoyama/2026-kansai-trip#supabase設定",
  ],
] as const;

export function DocumentsPage() {
  return (
    <div className="cinema-page">
      <header className="cinema-page-header">
        <p className="cinema-page-kicker">TRAVEL LIBRARY</p>
        <h1>資料</h1>
        <p>旅行中に必要な案内を、通信状態に左右されにくい形でまとめます。</p>
      </header>
      <div className="cinema-document-list">
        {docs.map(([number, title, description, href]) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="cinema-document-card"
          >
            <span>{number}</span>
            <div>
              <small>TRAVEL DOCUMENT</small>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
      </div>
    </div>
  );
}
