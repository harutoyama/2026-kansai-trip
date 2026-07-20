import { NavLink } from "react-router-dom";

const items = [
  ["/", "01", "ホーム"],
  ["/itinerary", "02", "旅程"],
  ["/transport", "03", "交通・宿泊"],
  ["/documents", "04", "資料"],
  ["/chat", "05", "チャット"],
] as const;

export function BottomNav() {
  return (
    <nav aria-label="メインナビゲーション" className="cinema-nav">
      <div className="cinema-nav-inner">
        {items.map(([to, code, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `cinema-nav-link ${isActive ? "is-active" : ""}`
            }
          >
            <span className="cinema-nav-code" aria-hidden="true">
              {code}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
