export const SaveStation = ({ position, rotation = 1, ref }) => {
    const yRotation = rotation === 2 ? Math.PI / 2 : 0;

    return (
        <mesh
            ref={ref}
            position={position}
            rotation={[0, yRotation, 0]}
            userData={{ type: "saveStation" }}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[0.5, 0.3, 0.9]} />
            <meshStandardMaterial color="purple" />
        </mesh>
    );
};
