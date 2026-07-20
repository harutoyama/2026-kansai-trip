export function ChatPage() {
  return (
    <div className="cinema-page">
      <header className="cinema-page-header">
        <p className="cinema-page-kicker">TRAVEL CONCIERGE</p>
        <h1>チャット</h1>
        <p>旅行資料を根拠に回答する、家族向けコンシェルジュ機能です。</p>
      </header>
      <section className="cinema-coming-card">
        <div className="cinema-coming-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p>PHASE 02</p>
        <h2>準備中</h2>
        <span>
          旅行資料だけを参照し、引用元を表示するRAGチャットを後続フェーズで追加します。AI
          APIキーはブラウザには配置しません。
        </span>
      </section>
    </div>
  );
}
