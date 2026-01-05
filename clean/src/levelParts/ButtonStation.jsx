export const ButtonStation = ({ position, ref, item }) => {

    return (
        <mesh
            ref={ref}
            position={position}
            userData={{ type: "buttonStation", button: item }}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[0.4, 1, 0.4]} />
            <meshStandardMaterial color="purple" />
        </mesh>
    );
};
