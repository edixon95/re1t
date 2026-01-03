import { Door } from "../doors/Door";
import { Stair } from "../doors/Stair";
import { useRef } from "react";

export const doorMeshes = [];

export const DoorManager = ({ doors }) => {
    if (!doors) return null;

    doorMeshes.length = 0;

    return (
        <>
            {doors.map((door, i) => {
                const ref = useRef();
                doorMeshes.push(ref);

                if (door.type === "stair") {
                    return <Stair key={door.id} stair={door} ref={ref} />;
                }

                return <Door key={door.id} door={door} ref={ref} />;
            })}
        </>
    );
};
