export const TestIntroCutsceneWorld = ({ p1Mesh, p2Mesh }) => {
    return (
        <>
            {/* Lights */}
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#222" />
            </mesh>

            {/* Player meshes passed from parent */}
            {p1Mesh}
            {p2Mesh}
        </>
    )
}
