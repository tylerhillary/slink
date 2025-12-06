document.addEventListener('DOMContentLoaded', () => {
    tsParticles.load('particles-js', {
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: {
                    enable: false,
                    mode: 'repulse',
                },
                onClick: {
                    enable: false,
                    mode: 'push',
                },
                resize: true,
            },
            modes: {
                push: {
                    quantity: 4,
                },
                repulse: {
                    distance: 150,
                    duration: 0.4,
                },
            },
        },
        particles: {
            color: {
                value: '#cccccc',
            },
            links: {
                color: '#cccccc',
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1,
            },
            collisions: {
                enable: true,
            },
            move: {
                direction: 'none',
                enable: true,
                outModes: {
                    default: 'bounce',
                },
                random: false,
                speed: 1,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 80,
            },
            opacity: {
                value: 0.4,
            },
            shape: {
                type: 'circle',
            },
            size: {
                value: { min: 1, max: 5 },
            },
        },
        detectRetina: true,
    });
});
