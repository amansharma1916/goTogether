import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";



const ParticleTheme = () => {
    const particlesInit = useCallback(async (engine: any) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: {
                    enable: true,
                    zIndex: -1,
                },
                background: {
                    color: "#000000",
                },
                particles: {

                    number: { value: 150 },
                    size: { value: 1.5 },
                    move: {
                        enable: true,      // <-- required!
                        speed: 0.5,
                        direction: "none",
                        outModes: "out",

                    },
                    shape: { type: "star" },
                    twinkle: {
                        particles: {
                            enable: true,
                            frequency: 0.1,
                            opacity: 1,
                        }
                    },

                    opacity: { value: 1 },
                },
            }}
        />
    )
}

export default ParticleTheme    