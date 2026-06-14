class ParticleNetwork {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration
        this.particleColor = options.particleColor || 'rgba(237, 29, 36, 0.6)'; // Marvel red
        this.lineColor = options.lineColor || 'rgba(237, 29, 36, 0.2)';
        this.maxVelocity = options.maxVelocity || 0.5;

        // Responsive properties
        this.particleCount = 0;
        this.connectionDistance = 0;
        this.mouseInteractionDistance = 0;

        this.particles = [];
        this.mouse = { x: null, y: null };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            this.resetParticles();
        });
        
        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Touch support for mobile
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });

        window.addEventListener('touchend', () => {
            // Release the repulsion point when user stops touching
            this.mouse.x = null;
            this.mouse.y = null;
        });

        this.resetParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Optimize for mobile vs desktop
        const isMobile = window.innerWidth < 600;
        
        // Ensure enough particles on small screens
        this.particleCount = isMobile ? 45 : Math.floor(window.innerWidth / 15);
        
        // Scale connection distances down for mobile
        this.connectionDistance = isMobile ? 80 : 120;
        this.mouseInteractionDistance = isMobile ? 100 : 150;
    }

    resetParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * this.maxVelocity,
            vy: (Math.random() - 0.5) * this.maxVelocity,
            radius: Math.random() * 2 + 1 // Simple dots
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges smoothly
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            // Keep strictly inside bounds
            p.x = Math.max(0, Math.min(this.canvas.width, p.x));
            p.y = Math.max(0, Math.min(this.canvas.height, p.y));

            // Mouse/Touch repulsion
            if (this.mouse.x !== null) {
                let dx = this.mouse.x - p.x;
                let dy = this.mouse.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouseInteractionDistance) {
                    const force = (this.mouseInteractionDistance - dist) / this.mouseInteractionDistance;
                    p.x -= (dx / dist) * force * 1.5;
                    p.y -= (dy / dist) * force * 1.5;
                }
            }

            // Draw particle as a glowing red dot
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.particleColor;
            this.ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    
                    let opacity = 1 - (dist / this.connectionDistance);
                    this.ctx.strokeStyle = this.lineColor.replace('0.2)', `${opacity * 0.3})`);
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }

            // Connect to mouse/touch
            if (this.mouse.x !== null) {
                let dx = this.mouse.x - p.x;
                let dy = this.mouse.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    
                    let opacity = 1 - (dist / this.connectionDistance);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        new ParticleNetwork(canvas);
    }
});
