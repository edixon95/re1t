## This will be my todo list to keep it out of the code
- Define puzzle types
    - Add test puzzle

- Map
    - Map population for screen by level not by region
        - All "Intro" levels should look like one map
        - Probably will require some building

- Load/Save now added
    - Add currency for saving
    - Start tracking player time, level etc for proper save names, its a bit confusing

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
    - Multi floor spawning
        - Sometimes able to see a lower floor/interact with an enemy
    - Expand unlock criteria for doors
        - Currently these take 0 or 1 items
        - Should take 0-N items and accept different trigger types
    - Buttons:
        - Trigger things, mostly doors to unlock or lock 
    - Puzzle types:
        ?
    
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