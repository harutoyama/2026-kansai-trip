export function ScenicBackdrop() {
  return (
    <svg
      className="cinema-scenery"
      viewBox="0 0 430 390"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cinema-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#83bcc8" />
          <stop offset="0.46" stopColor="#d9b17a" />
          <stop offset="1" stopColor="#235158" />
        </linearGradient>
        <linearGradient id="cinema-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f9fa4" />
          <stop offset="1" stopColor="#173f45" />
        </linearGradient>
        <filter id="cinema-glow">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id="cinema-soft">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <rect width="430" height="390" fill="url(#cinema-sky)" />
      <circle
        cx="337"
        cy="78"
        r="48"
        fill="#ffe3ad"
        opacity="0.78"
        filter="url(#cinema-glow)"
      />
      <circle cx="337" cy="78" r="27" fill="#ffebc5" />
      <path
        d="M0 206 Q84 167 168 194 T329 178 T430 187 V390 H0Z"
        fill="#527568"
      />
      <path
        d="M0 243 Q90 208 180 229 T352 214 T430 222 V390 H0Z"
        fill="#254f4d"
      />
      <rect y="270" width="430" height="120" fill="url(#cinema-water)" />
      <path
        d="M-15 297 C78 272 146 278 239 295 S356 311 449 281"
        fill="none"
        stroke="#f5d9a8"
        strokeWidth="4"
        opacity="0.18"
        filter="url(#cinema-soft)"
      />
      <path
        d="M-15 319 C73 296 162 302 249 319 S356 335 449 307"
        fill="none"
        stroke="#fff3d8"
        strokeWidth="1.4"
        opacity="0.22"
      />
      <g fill="#203f43">
        <rect x="33" y="159" width="19" height="97" rx="2" />
        <rect x="56" y="181" width="31" height="75" rx="2" />
        <rect x="92" y="201" width="24" height="55" rx="2" />
        <rect x="294" y="149" width="20" height="108" rx="2" />
        <rect x="319" y="177" width="38" height="80" rx="2" />
        <rect x="362" y="194" width="27" height="63" rx="2" />
      </g>
      <g fill="#f5c985" opacity="0.68">
        <rect x="40" y="172" width="4" height="5" />
        <rect x="40" y="188" width="4" height="5" />
        <rect x="65" y="194" width="5" height="4" />
        <rect x="77" y="194" width="5" height="4" />
        <rect x="301" y="162" width="4" height="5" />
        <rect x="301" y="179" width="4" height="5" />
        <rect x="329" y="191" width="5" height="4" />
        <rect x="342" y="191" width="5" height="4" />
      </g>
      <path
        d="M0 255 C88 236 139 239 220 252 S348 268 430 244"
        fill="none"
        stroke="#d8bf94"
        strokeWidth="2"
        opacity="0.18"
      />
    </svg>
  );
}
