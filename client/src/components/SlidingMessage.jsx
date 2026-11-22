import { useEffect, useState } from "react";

const LINE_HEIGHT = 24;
const SLIDE_MS = 500;

const styles = {
    viewport: {
        position: "relative",
        width: "100%",
        height: LINE_HEIGHT,
        overflow: "hidden",
    },
    line: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: LINE_HEIGHT,
        lineHeight: `${LINE_HEIGHT}px`,
        margin: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: "#5b6370",
        willChange: "transform, opacity",
    },
};

export function SlidingMessage({ messages = PROGRESS_MESSAGES, interval = 1400 }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            // stops on the last message instead of looping
            setStep((s) => (s + 1) % messages.length);
        }, interval);
        return () => clearInterval(timer);
    }, [messages.length, interval]);

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    return (
        <div style={styles.viewport}>
            {messages.map((text, i) => {
                const n = messages.length;
                const offset = (i - step + n) % n; // 0 = current, 1 = next, n-1 = previous
                const translate = offset === 0 ? 0 : offset === n - 1 ? -LINE_HEIGHT : LINE_HEIGHT;
                const animates = offset === 0 || offset === n - 1;

                return (
                    <span
                        key={text}
                        aria-hidden={offset !== 0}
                        style={{
                            ...styles.line,
                            opacity: offset === 0 ? 1 : 0,
                            transform: `translateY(${translate}px)`,
                            transition: reduceMotion || !animates
                                ? "none"
                                : `transform ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1), opacity ${SLIDE_MS}ms ease`,
                        }}
                    >
                        {text}
                    </span>
                );
            })}
        </div>
    );
}