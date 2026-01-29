// UI Controls for Theme Switcher, Audio Controls, and Paytable

// Theme Toggle
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themePanel = document.getElementById('theme-panel');

    if (themeToggle && themePanel) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themePanel.classList.toggle('active');

            if (typeof audioManager !== 'undefined') {
                audioManager.play('click');
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!themePanel.contains(e.target) && e.target !== themeToggle) {
                themePanel.classList.remove('active');
            }
        });
    }

    // Music Volume Control
    const musicVolumeSlider = document.getElementById('music-volume');
    if (musicVolumeSlider && typeof audioManager !== 'undefined') {
        musicVolumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audioManager.setMusicVolume(volume);
        });

        // Set initial value from audioManager
        musicVolumeSlider.value = audioManager.musicVolume * 100;
    }

    // SFX Volume Control
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    if (sfxVolumeSlider && typeof audioManager !== 'undefined') {
        sfxVolumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audioManager.setSfxVolume(volume);
        });

        // Set initial value from audioManager
        sfxVolumeSlider.value = audioManager.sfxVolume * 100;
    }

    // Music Toggle Button
    const musicToggleBtn = document.getElementById('music-toggle');
    if (musicToggleBtn && typeof audioManager !== 'undefined') {
        musicToggleBtn.addEventListener('click', () => {
            const isMuted = audioManager.toggleMusicMute();
            musicToggleBtn.classList.toggle('active', !isMuted);
            musicToggleBtn.textContent = isMuted ? '🔇' : '🎵';
        });

        // Set initial state
        musicToggleBtn.classList.toggle('active', !audioManager.isMusicMuted);
        musicToggleBtn.textContent = audioManager.isMusicMuted ? '🔇' : '🎵';
    }

    // SFX Toggle Button
    const sfxToggleBtn = document.getElementById('sfx-toggle');
    if (sfxToggleBtn && typeof audioManager !== 'undefined') {
        sfxToggleBtn.addEventListener('click', () => {
            const isMuted = audioManager.toggleSfxMute();
            sfxToggleBtn.classList.toggle('active', !isMuted);
            sfxToggleBtn.textContent = isMuted ? '🔇' : '🔊';
        });

        // Set initial state
        sfxToggleBtn.classList.toggle('active', !audioManager.isSfxMuted);
        sfxToggleBtn.textContent = audioManager.isSfxMuted ? '🔇' : '🔊';
    }

    // Paytable Modal
    const paytableBtn = document.getElementById('paytable-btn');
    const paytableModal = document.getElementById('paytable-modal');
    const paytableClose = document.getElementById('paytable-close');

    if (paytableBtn && paytableModal) {
        paytableBtn.addEventListener('click', () => {
            paytableModal.classList.add('active');

            if (typeof audioManager !== 'undefined') {
                audioManager.play('click');
            }
        });
    }

    if (paytableClose && paytableModal) {
        paytableClose.addEventListener('click', () => {
            paytableModal.classList.remove('active');

            if (typeof audioManager !== 'undefined') {
                audioManager.play('click');
            }
        });
    }

    // Close modal when clicking outside
    if (paytableModal) {
        paytableModal.addEventListener('click', (e) => {
            if (e.target === paytableModal) {
                paytableModal.classList.remove('active');

                if (typeof audioManager !== 'undefined') {
                    audioManager.play('click');
                }
            }
        });
    }

    // Add click sound to all buttons
    const allButtons = document.querySelectorAll('button:not(.audio-toggle-btn):not(.theme-toggle-btn)');
    allButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof audioManager !== 'undefined') {
                audioManager.play('click');
            }
        });
    });
});
