import { Door } from "../doors/Door";

export const DoorManager = ({ doors }) => {
    if (!doors) return null;
    console.log("has doors")
    return (
        <>
            {doors.map((door) => (
                <Door key={door.id} door={door} />
            ))}
        </>
    );
};
