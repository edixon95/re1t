export const Door = ({ door, ref }) => {
    return (
        <mesh
            ref={ref}
            position={door.position}
            rotation={[0, door.direction === 2 ? (Math.PI / 2) : 0, 0]}
            userData={{
                type: "door",
                door,
                isStair: false
            }}
        >
            <boxGeometry args={door.size} />
            <meshStandardMaterial color="yellow" />
        </mesh>
    );
};
