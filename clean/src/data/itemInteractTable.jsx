export const ITEM_INTERACT_TABLE = {
    Gun: {
        Options: [
            {
                label: "Equip",
                action: ({ closeContext }) => {
                    console.log("Equipped Gun")
                    closeContext()
                }
            },
            {
                label: "Reload",
                action: ({ closeContext }) => {
                    console.log("Reloaded Gun")
                    closeContext()
                }
            },
            {
                label: "Examine",
                action: ({ openExamine }) => {
                    openExamine("A basic weapon")
                }
            }
        ]
    },
    KeyCard: {
        Options: [
            {
                label: "Examine",
                action: ({ openExamine }) => {
                    openExamine("A keycard")
                }
            }
        ]
    }
}
