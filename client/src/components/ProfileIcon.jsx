export function ProfileIcon({ size = 40, ...props }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 40 40" 
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <defs>
                <clipPath id="avatar-clip">
                    <circle cx="20" cy="20" r="20" />
                </clipPath>
            </defs>

            <circle cx="20" cy="20" r="20" fill="#E4E2EA" />

            <g clip-path="url(#avatar-clip)" fill="#A9A6BA">
                <circle cx="20" cy="14.5" r="6.5" />
                <path d="M4 40 V36 C4 28.4 10.8 23.5 20 23.5 S36 28.4 36 36 V40 Z" />
            </g>
        </svg>
    );
}
