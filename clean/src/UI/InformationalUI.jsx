import { useEffect, useState, useRef } from "react"

let triggerFn = null

export const triggerPickupText = (item) => {
    if (triggerFn && item) {
        triggerFn(`Picked up ${item.item}`)
    }
}

export const interactionAttempt = (isAnonymous, item) => {
    if (triggerFn) {
        if (isAnonymous) {
            triggerFn(`Requires item`)
        } else {
            triggerFn(`Requires ${item}`)
        }
    }
}

export const interactionSuccess = (item) => {
    if (triggerFn) {
        triggerFn(`Used ${item}`)
    }
}

export const InformationalUI = () => {
    const [text, setText] = useState("")
    const [visible, setVisible] = useState(false)
    const timeoutRef = useRef(null)

    useEffect(() => {
        triggerFn = (message) => {
            setText(message)
            setVisible(true)

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                setVisible(false)
                timeoutRef.current = null
            }, 5500)
        }

        return () => {
            triggerFn = null
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
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
