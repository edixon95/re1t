import { useEffect, useState } from "react"

let triggerFn = null
let idCounter = 0
const LINE_HEIGHT = 34

export const triggerUIText = (string) => {
    if (!triggerFn || !string)
        return
    triggerFn(string)
}

export const InformationalUI = () => {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        triggerFn = (text) => {
            const id = idCounter++

            setMessages((prev) => [
                ...prev,
                { id, text, visible: true }
            ])

            // Fade out
            setTimeout(() => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === id ? { ...m, visible: false } : m
                    )
                )
            }, 4500)

            // Remove
            setTimeout(() => {
                setMessages((prev) => prev.filter((m) => m.id !== id))
            }, 5500)
        }

        return () => {
            triggerFn = null
        }
    }, [])

    return (
        <div
            style={{
                position: "absolute",
                bottom: "10%",
                left: "10%",
                pointerEvents: "none",
                width: "500px",
                height: "300px",
            }}
        >
            {messages.map((msg, index) => {
                const offsetFromBottom =
                    (messages.length - 1 - index) * LINE_HEIGHT

                return (
                    <div
                        key={msg.id}
                        style={{
                            position: "absolute",
                            bottom: offsetFromBottom,
                            opacity: msg.visible ? 1 : 0,
                            transition: "opacity 1s ease",
                            fontSize: "28px",
                            color: "white",
                            textShadow: "2px 2px 6px black",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {msg.text}
                    </div>
                )
            })}
        </div>
    )
}
