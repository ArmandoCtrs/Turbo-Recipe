export function AppIcon({ size = 64, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 128 128"
            width={size}
            height={size}
            role="img"
            {...props}
        >
            <rect x="4" y="4" width="120" height="120" rx="28" fill="#1F1B2E" />
            <g transform="translate(0 8)">
                <circle cx="44" cy="52" r="18" fill="#fff" />
                <circle cx="84" cy="52" r="18" fill="#fff" />
                <circle cx="64" cy="40" r="24" fill="#fff" />
                <rect x="42" y="52" width="44" height="36" fill="#fff" />
                <rect x="40" y="82" width="48" height="16" rx="4" fill="#FF6B2C" />
                <path
                    d="M70 26 L54 47 H63 L59 60 L75 39 H66 Z"
                    fill="#FF6B2C"
                    stroke="#FF6B2C"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
}