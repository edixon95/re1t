## This will be my todo list to keep it out of the code

- Start adding fail sounds
    - menu spam
    - bad combine
    - full inventory
    - empty gun

## To add
    - Storage
        - Add storage to save/load. This probably goes into inventory, it's just a second inventory
    - Update PlayerMenuUI to replace the left side headings with storage
        - Context menu and inventory should work together
    
    - Menu:
        - Map to become "Notes"
            - Notes will have two screens, "Documents" and "Maps"
    
    - Pickups
        - Document type
        - Map type
    
    - Map
        - Render 2d map based on door connections and geometry

 ## Added since last made
    - Stairs
        - Stair cutouts howto:
            Stairs going up, just add new floor, current wall building will work for it
            Stairs going down, skip: true, add a direction
    
    - Puzzles
        - First type added; item platforms
            - howto: create "other" in levelTable and join to puzzleTable
    - Buttons
        - First type added; single click
            - howto: create "other" in levelTable and give target: doorId
    - Door unlock criteria:
        - It's just arrays now

    - Cutscenes
        - howto: 
        if (door?.cutsceneId && !door.isSceneViewed && door.activeScene) {
            // set door to viewed
            setGameState((prev) => ({
                ...prev,
                mode: "cutscene",
                cutsceneId: door?.cutsceneId
            }))
            hasViewedScene(door.id)
            return;
        }

        Doors hold the cutscene ids, link them to cutsceneTable. geometry and scene instructions stored in levels -> cutscenes
        Skip transition means it won't use the endSceneDoor, which is used to designate where the player will spawn after the cutscene ends
        This means that skipTransition: true will just let the player continue with whatever they were doing after the cutscene ends 

        Puzzles can also trigger cutscenes via doors using the reward object.
        activatesCutSceneAwait will prime a specific cutscene to play when the door it belongs to is used
        activatesCutSceneImmediate will play the cutscene instantly
    
        