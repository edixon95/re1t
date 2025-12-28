import { useEffect, useState } from "react"

let triggerFn = null

export const triggerPickupText = (item) => {
    if (triggerFn && item) {
        triggerFn(`Picked up ${item.item}`)
    }
}

export const InformationalUI = () => {
    const [text, setText] = useState("")
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Register trigger
        triggerFn = (message) => {
            setText(message)
            setVisible(true)

            // Auto-hide after 2.5s
            setTimeout(() => {
                setVisible(false)
            }, 5500)
        }

        return () => {
            triggerFn = null
        }
    }, [])

    if (!text) return null

    return (
        <div
            style={{
                position: "absolute",
                bottom: "10%",
                left: "10%",
                textAlign: "center",
                pointerEvents: "none",
                opacity: visible ? 1 : 0,
                transition: "opacity 1s ease",
                fontSize: "28px",
                color: "white",
                textShadow: "2px 2px 6px black",
            }}
        >
            {text}
        </div>
    )
}
