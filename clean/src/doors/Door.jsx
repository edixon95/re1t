export const Door = ({ door }) => {
    return (
        <mesh
            position={door.position}
            rotation={[0, door.direction === 2 ? (Math.PI / 2) : 0, 0]}
            userData={{
                type: "door",
                door,
            }}
        >
            <boxGeometry args={door.size} />
            <meshStandardMaterial color="yellow" />
        </mesh>
    );
};
