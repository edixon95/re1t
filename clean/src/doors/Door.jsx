export const Door = ({ door }) => {
    return (
        <mesh
            position={door.position}
            rotation-y={door.rotationY}
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
