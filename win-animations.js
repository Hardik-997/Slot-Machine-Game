// Win Animation System for Neon Slots
// Handles confetti, screen shake, symbol glow, and coin cascade effects

class WinAnimationManager {
    constructor() {
        this.isAnimating = false;
        this.confettiCanvas = null;
        this.confettiCtx = null;
        this.confettiParticles = [];
        this.animationFrame = null;
    }

    // Initialize confetti canvas
    initConfetti() {
        if (this.confettiCanvas) return;

        this.confettiCanvas = document.createElement('canvas');
        this.confettiCanvas.id = 'confetti-canvas';
        this.confettiCanvas.style.position = 'fixed';
        this.confettiCanvas.style.top = '0';
        this.confettiCanvas.style.left = '0';
        this.confettiCanvas.style.width = '100%';
        this.confettiCanvas.style.height = '100%';
        this.confettiCanvas.style.pointerEvents = 'none';
        this.confettiCanvas.style.zIndex = '9999';
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;

        document.body.appendChild(this.confettiCanvas);
        this.confettiCtx = this.confettiCanvas.getContext('2d');

        // Handle resize
        window.addEventListener('resize', () => {
            this.confettiCanvas.width = window.innerWidth;
            this.confettiCanvas.height = window.innerHeight;
        });
    }

    // Determine win tier based on multiplier
    getWinTier(winnings, bet) {
        const multiplier = winnings / bet;

        if (multiplier >= 10) return 'jackpot';
        if (multiplier >= 6) return 'big';
        if (multiplier >= 3) return 'medium';
        return 'small';
    }

    // Main win animation trigger
    async triggerWinAnimation(winnings, bet, winningSymbols = []) {
        const tier = this.getWinTier(winnings, bet);

        console.log(`Win tier: ${tier}, Winnings: $${winnings}`);

        // Play appropriate sound
        if (typeof audioManager !== 'undefined') {
            switch (tier) {
                case 'jackpot':
                    audioManager.play('jackpot');
                    break;
                case 'big':
                    audioManager.play('bigWin');
                    break;
                case 'medium':
                case 'small':
                    audioManager.play('win');
                    break;
            }
        }

        // Trigger Three.js celebration
        if (typeof triggerWinCelebration === 'function') {
            triggerWinCelebration();
        }

        // Execute animations based on tier
        switch (tier) {
            case 'jackpot':
                await this.playJackpotAnimation(winningSymbols);
                break;
            case 'big':
                await this.playBigWinAnimation(winningSymbols);
                break;
            case 'medium':
                await this.playMediumWinAnimation(winningSymbols);
                break;
            case 'small':
                await this.playSmallWinAnimation(winningSymbols);
                break;
        }
    }

    // Small win - subtle glow
    async playSmallWinAnimation(symbols) {
        this.glowSymbols(symbols, 'small');
        await this.delay(800);
        this.removeGlow();
    }

    // Medium win - glow + light confetti
    async playMediumWinAnimation(symbols) {
        this.glowSymbols(symbols, 'medium');
        this.createConfetti(50, 'medium');
        await this.delay(1500);
        this.removeGlow();
    }

    // Big win - full confetti + screen shake + glow
    async playBigWinAnimation(symbols) {
        this.glowSymbols(symbols, 'big');
        this.screenShake('medium');
        this.createConfetti(150, 'big');
        await this.delay(2000);
        this.removeGlow();
    }

    // Jackpot - maximum effects
    async playJackpotAnimation(symbols) {
        this.glowSymbols(symbols, 'jackpot');
        this.screenShake('intense');
        this.createConfetti(300, 'jackpot');
        this.showJackpotText();
        await this.delay(3000);
        this.removeGlow();
        this.hideJackpotText();
    }

    // Add glow effect to winning symbols
    glowSymbols(symbols, intensity) {
        const reels = document.querySelectorAll('.reel');

        reels.forEach((reel, index) => {
            // Add glow class based on intensity
            reel.classList.add('win-glow', `win-glow-${intensity}`);
        });
    }

    // Remove glow effect
    removeGlow() {
        const reels = document.querySelectorAll('.reel');
        reels.forEach(reel => {
            reel.classList.remove('win-glow', 'win-glow-small', 'win-glow-medium', 'win-glow-big', 'win-glow-jackpot');
        });
    }

    // Screen shake effect
    screenShake(intensity) {
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;

        const shakeClass = intensity === 'intense' ? 'screen-shake-intense' : 'screen-shake';
        appContainer.classList.add(shakeClass);

        setTimeout(() => {
            appContainer.classList.remove(shakeClass);
        }, 500);
    }

    // Create confetti particles
    createConfetti(count, tier) {
        this.initConfetti();

        const colors = this.getConfettiColors(tier);

        for (let i = 0; i < count; i++) {
            this.confettiParticles.push({
                x: Math.random() * window.innerWidth,
                y: -20,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                shape: Math.random() > 0.5 ? 'rect' : 'circle',
                gravity: 0.15,
                life: 1
            });
        }

        this.animateConfetti();
    }

    // Get confetti colors based on tier
    getConfettiColors(tier) {
        switch (tier) {
            case 'jackpot':
                return ['#facc15', '#fbbf24', '#f59e0b', '#FFD700', '#FFA500'];
            case 'big':
                return ['#d946ef', '#8b5cf6', '#facc15', '#ec4899'];
            case 'medium':
                return ['#8b5cf6', '#a78bfa', '#c084fc'];
            default:
                return ['#8b5cf6', '#c084fc'];
        }
    }

    // Animate confetti
    animateConfetti() {
        if (this.confettiParticles.length === 0) {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            return;
        }

        this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

        // Update and draw particles
        this.confettiParticles = this.confettiParticles.filter(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.rotation += particle.rotationSpeed;
            particle.life -= 0.005;

            // Draw particle
            this.confettiCtx.save();
            this.confettiCtx.translate(particle.x, particle.y);
            this.confettiCtx.rotate((particle.rotation * Math.PI) / 180);
            this.confettiCtx.globalAlpha = particle.life;
            this.confettiCtx.fillStyle = particle.color;

            if (particle.shape === 'circle') {
                this.confettiCtx.beginPath();
                this.confettiCtx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                this.confettiCtx.fill();
            } else {
                this.confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            }

            this.confettiCtx.restore();

            // Keep particle if still on screen and alive
            return particle.y < window.innerHeight + 50 && particle.life > 0;
        });

        this.animationFrame = requestAnimationFrame(() => this.animateConfetti());
    }

    // Show jackpot text
    showJackpotText() {
        let jackpotEl = document.getElementById('jackpot-text');

        if (!jackpotEl) {
            jackpotEl = document.createElement('div');
            jackpotEl.id = 'jackpot-text';
            jackpotEl.className = 'jackpot-text';
            jackpotEl.textContent = '🎰 JACKPOT! 🎰';
            document.body.appendChild(jackpotEl);
        }

        jackpotEl.style.display = 'block';
        jackpotEl.classList.add('jackpot-animate');
    }

    // Hide jackpot text
    hideJackpotText() {
        const jackpotEl = document.getElementById('jackpot-text');
        if (jackpotEl) {
            jackpotEl.style.display = 'none';
            jackpotEl.classList.remove('jackpot-animate');
        }
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Clean up
    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.confettiParticles = [];
        if (this.confettiCtx) {
            this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
        }
    }
}

// Create global instance
const winAnimationManager = new WinAnimationManager();
