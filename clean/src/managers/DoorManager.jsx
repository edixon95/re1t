import { Door } from "../doors/Door";

export const DoorManager = ({ doors }) => {
    if (!doors) return null;
    return (
        <>
            {doors.map((door) => (
                <Door key={door.id} door={door} />
            ))}
        </>
    );
};
