// Theme Management System for Neon Slots

class ThemeManager {
    constructor() {
        this.themes = {
            cyberPurple: {
                name: 'Cyber Purple',
                colors: {
                    'bg-dark': '#120d1d',
                    'card-bg': 'rgba(30, 25, 45, 0.7)',
                    'primary': '#d946ef',
                    'secondary': '#8b5cf6',
                    'accent': '#facc15',
                    'text-main': '#ffffff',
                    'text-muted': '#9ca3af',
                    'glass-border': 'rgba(255, 255, 255, 0.1)'
                },
                threeJsColors: {
                    background: 0x0a0612,
                    fog: 0x120d1d,
                    light1: 0xd946ef,
                    light2: 0x8b5cf6,
                    particles: [0xd946ef, 0x8b5cf6, 0xfacc15, 0xffffff]
                }
            },
            vegasRed: {
                name: 'Vegas Red',
                colors: {
                    'bg-dark': '#1a0505',
                    'card-bg': 'rgba(45, 10, 10, 0.7)',
                    'primary': '#dc2626',
                    'secondary': '#b91c1c',
                    'accent': '#fbbf24',
                    'text-main': '#ffffff',
                    'text-muted': '#d1d5db',
                    'glass-border': 'rgba(255, 255, 255, 0.15)'
                },
                threeJsColors: {
                    background: 0x1a0000,
                    fog: 0x2a0505,
                    light1: 0xdc2626,
                    light2: 0xfbbf24,
                    particles: [0xdc2626, 0xef4444, 0xfbbf24, 0xffffff]
                }
            },
            oceanBlue: {
                name: 'Ocean Blue',
                colors: {
                    'bg-dark': '#021526',
                    'card-bg': 'rgba(3, 32, 61, 0.7)',
                    'primary': '#0ea5e9',
                    'secondary': '#0284c7',
                    'accent': '#f97316',
                    'text-main': '#ffffff',
                    'text-muted': '#94a3b8',
                    'glass-border': 'rgba(255, 255, 255, 0.12)'
                },
                threeJsColors: {
                    background: 0x021526,
                    fog: 0x03203d,
                    light1: 0x0ea5e9,
                    light2: 0x06b6d4,
                    particles: [0x0ea5e9, 0x06b6d4, 0xf97316, 0xffffff]
                }
            }
        };

        this.currentTheme = 'cyberPurple';
        this.loadThemePreference();
    }

    // Apply theme to the page
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.error(`Theme ${themeName} not found`);
            return;
        }

        const theme = this.themes[themeName];
        const root = document.documentElement;

        // Apply CSS custom properties
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(`--${property}`, value);
        });

        // Apply Three.js theme if available
        if (typeof updateThreeJsTheme === 'function') {
            updateThreeJsTheme(theme.threeJsColors);
        }

        // Update current theme
        this.currentTheme = themeName;
        this.saveThemePreference();

        // Update UI to show active theme
        this.updateThemeUI();

        console.log(`Applied theme: ${theme.name}`);
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Get all available themes
    getThemes() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name
        }));
    }

    // Save theme preference to localStorage
    saveThemePreference() {
        localStorage.setItem('selectedTheme', this.currentTheme);
    }

    // Load theme preference from localStorage
    loadThemePreference() {
        const saved = localStorage.getItem('selectedTheme');
        if (saved && this.themes[saved]) {
            this.currentTheme = saved;
        }
    }

    // Update theme UI to show active state
    updateThemeUI() {
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === this.currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Initialize theme system
    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);

        // Set up event listeners for theme switcher
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const themeName = btn.dataset.theme;
                this.applyTheme(themeName);

                // Play click sound
                if (typeof audioManager !== 'undefined') {
                    audioManager.play('click');
                }
            });
        });

        console.log('Theme Manager initialized');
    }
}

// Update Three.js scene colors based on theme
function updateThreeJsTheme(colors) {
    if (!scene) return;

    // Update background and fog
    scene.background = new THREE.Color(colors.background);
    scene.fog.color = new THREE.Color(colors.fog);

    // Update lights
    const lights = scene.children.filter(child => child instanceof THREE.PointLight);
    if (lights.length >= 2) {
        lights[0].color = new THREE.Color(colors.light1);
        lights[1].color = new THREE.Color(colors.light2);
    }

    // Update particle colors
    particles.forEach(particleSystem => {
        const colorAttribute = particleSystem.geometry.attributes.color;
        if (colorAttribute) {
            const colorArray = colorAttribute.array;
            const particleCount = colorArray.length / 3;

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const color = new THREE.Color(colors.particles[Math.floor(Math.random() * colors.particles.length)]);
                colorArray[i3] = color.r;
                colorArray[i3 + 1] = color.g;
                colorArray[i3 + 2] = color.b;
            }

            colorAttribute.needsUpdate = true;
        }
    });

    console.log('Three.js theme updated');
}

// Create global instance
const themeManager = new ThemeManager();

// Initialize on page load
window.addEventListener('load', () => {
    // Wait a bit for Three.js to initialize
    setTimeout(() => {
        themeManager.init();
    }, 500);
});
