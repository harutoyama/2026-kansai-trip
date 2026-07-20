const cards = [
  {
    title: "Haru・往路",
    type: "RAIL JOURNEY",
    route: "東京 → 岡山",
    date: "2026年8月20日",
    note: "購入後に列車時刻を確定",
    query: "岡山駅",
    status: "時刻調整中",
  },
  {
    title: "沖縄組・往路",
    type: "AIR & RAIL",
    route: "沖縄 → 関西空港 → 岡山",
    date: "2026年8月20日",
    note: "航空便・接続列車は候補",
    query: "関西国際空港",
    status: "接続確認中",
  },
  {
    title: "宿泊 1",
    type: "STAY",
    route: "淀屋橋周辺",
    date: "8月20日〜23日（3泊）",
    note: "相鉄フレッサイン",
    query: "相鉄フレッサイン 淀屋橋",
    status: "確定",
  },
  {
    title: "宿泊 2",
    type: "STAY",
    route: "USJ周辺",
    date: "8月23日〜25日（2泊）",
    note: "オリエンタルホテル",
    query: "オリエンタルホテル ユニバーサル・シティ",
    status: "確定",
  },
  {
    title: "家族・復路",
    type: "RETURN FLIGHT",
    route: "関西 → 沖縄",
    date: "2026年8月25日",
    note: "便名・時刻は確定後に更新",
    query: "関西国際空港",
    status: "時刻調整中",
  },
] as const;

export function TransportPage() {
  return (
    <div className="cinema-page">
      <header className="cinema-page-header">
        <p className="cinema-page-kicker">ROUTES & STAYS</p>
        <h1>交通・宿泊</h1>
        <p>移動区間、日付、予約状態を一つの画面に集約します。</p>
      </header>

      <div className="cinema-transport-list">
        {cards.map((card, index) => {
          const stops = card.route.split("→").map((part) => part.trim());
          return (
            <article className="cinema-transport-card" key={card.title}>
              <div className="cinema-transport-meta">
                <span>
                  {String(index + 1).padStart(2, "0")} / {card.type}
                </span>
                <b>{card.status}</b>
              </div>
              <h2>{card.title}</h2>
              {stops.length >= 2 ? (
                <div className="cinema-transport-route">
                  <strong>{stops[0]}</strong>
                  <i aria-hidden="true" />
                  <strong>{stops.at(-1)}</strong>
                </div>
              ) : (
                <p className="cinema-stay-place">{card.route}</p>
              )}
              <div className="cinema-transport-details">
                <p>
                  <small>DATE</small>
                  {card.date}
                </p>
                <p>
                  <small>DETAIL</small>
                  {card.note}
                </p>
              </div>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.query)}`}
              >
                場所をGoogle Mapsで確認 <span aria-hidden="true">↗</span>
              </a>
            </article>
          );
        })}
      </div>
      <p className="cinema-security-note">
        予約番号、QRコード、電話番号などの機微情報は掲載しません。
      </p>
    </div>
  );
}
