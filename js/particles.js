// D:\maze\js\particles.js

class Particle {
    constructor(x, y, color, size, velocityX, velocityY, lifetime) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.lifetime = lifetime; // in frames
        this.age = 0;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.age++;
        return this.age >= this.lifetime;
    }

    draw(ctx) {
        const opacity = 1 - (this.age / this.lifetime);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * opacity, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addParticles(x, y, count, color, minSize, maxSize, minVelocity, maxVelocity, minLifetime, maxLifetime) {
        for (let i = 0; i < count; i++) {
            const size = Math.random() * (maxSize - minSize) + minSize;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * (maxVelocity - minVelocity) + minVelocity;
            const velocityX = Math.cos(angle) * velocity;
            const velocityY = Math.sin(angle) * velocity;
            const lifetime = Math.random() * (maxLifetime - minLifetime) + minLifetime;

            this.particles.push(new Particle(x, y, color, size, velocityX, velocityY, lifetime));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

console.log('particles.js loaded.');