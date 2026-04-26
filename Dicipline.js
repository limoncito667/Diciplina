class Flor {
    constructor(canvas) {
        this.canvas = canvas;

        this.paletas = [
            ['#ff8fa3', '#ff4d6d'],
            ['#c77dff', '#9d4edd'],
            ['#f7b2bd', '#e63980'],
            ['#ffd6e7', '#ffb3c6'],
            ['#bf0603', '#d62839'],
        ];

        this.glows = [
            'rgba(255,100,140,0.35)',
            'rgba(180,80,255,0.35)',
            'rgba(255,80,160,0.35)',
            'rgba(255,160,200,0.35)',
            'rgba(200,40,80,0.35)',
        ];

        this.reset();
    }

    reset() {
        const c = this.canvas;
        this.x           = Math.random() * c.width;
        this.y           = -20 - Math.random() * 120;
        this.size        = 5 + Math.random() * 9;
        this.speed       = 0.6 + Math.random() * 1.2;
        this.swing       = 0.4 + Math.random() * 0.8;
        this.swingSpeed  = 0.01 + Math.random() * 0.02;
        this.swingOffset = Math.random() * Math.PI * 2;
        this.rot         = Math.random() * Math.PI * 2;
        this.rotSpeed    = (Math.random() - 0.5) * 0.04;
        this.opacity     = 0.5 + Math.random() * 0.5;
        this.t           = 0;
        this.tipo        = Math.floor(Math.random() * this.paletas.length);
        this.color       = this.paletas[this.tipo];
        this.glow        = this.glows[this.tipo];
    }

    update() {
        this.t += this.swingSpeed;
        this.x += Math.sin(this.t + this.swingOffset) * this.swing;
        this.y += this.speed;
        this.rot += this.rotSpeed;
        if (this.y > this.canvas.height + 30) this.reset();
    }

    dibujar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.opacity;
        ctx.shadowColor = this.glow;
        ctx.shadowBlur  = 10;
        this._dibujarPetalos(ctx);
        ctx.restore();
    }

    _dibujarPetalos(ctx) {
        const s = this.size;
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / 5) * i);
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.55, s * 0.28, s * 0.55, 0, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(0, -s * 0.3, 0, 0, -s * 0.5, s * 0.6);
            grad.addColorStop(0, this.color[0]);
            grad.addColorStop(1, this.color[1]);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = '#fff8e0';
        ctx.fill();
    }
}

class LluviaFlores {
    constructor(canvas, cantidad) {
        this.canvas = canvas;
        this.ctx    = canvas.getContext('2d');
        this.flores = Array.from({ length: cantidad }, () => new Flor(canvas));
        this.activo = false;
    }

    iniciar() {
        this.activo = true;
        this._loop();
    }

    detener() {
        this.activo = false;
    }

    _loop() {
        if (!this.activo) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.flores.forEach(f => { f.update(); f.dibujar(this.ctx); });
        requestAnimationFrame(() => this._loop());
    }
}

class Musica {
    constructor(src, btnId, lblId, ctrlId) {
        this.audio    = new Audio(src);
        this.audio.loop   = true;   // repetir automáticamente
        this.audio.volume = 0.55;
        this.reproduciendo = false;

        this.btn  = document.getElementById(btnId);
        this.lbl  = document.getElementById(lblId);
        this.ctrl = document.getElementById(ctrlId);

        if (this.btn) {
            this.btn.addEventListener('click', () => this.togglePausa());
        }
    }

    // Inicia la música (llamado al presionar "Camina")
    iniciar() {
        const promesa = this.audio.play();
        if (promesa !== undefined) {
            promesa
                .then(() => {
                    this.reproduciendo = true;
                    this._mostrarControl();
                    this._actualizarBoton();
                })
                .catch(() => {
                    // Autoplay bloqueado → mostrar control igualmente
                    this.reproduciendo = false;
                    this._mostrarControl();
                    this._actualizarBoton();
                });
        }
    }

    togglePausa() {
        if (this.reproduciendo) {
            this.audio.pause();
            this.reproduciendo = false;
        } else {
            this.audio.play();
            this.reproduciendo = true;
        }
        this._actualizarBoton();
    }

    _mostrarControl() {
        if (this.ctrl) {
            this.ctrl.style.display = 'flex';
            // pequeño delay para que la transición CSS sea visible
            setTimeout(() => this.ctrl.classList.add('visible'), 50);
        }
    }

    _actualizarBoton() {
        if (!this.btn || !this.lbl) return;
        if (this.reproduciendo) {
            this.btn.textContent = '⏸';
            this.lbl.textContent = 'Música';
        } else {
            this.btn.textContent = '▶';
            this.lbl.textContent = 'Música';
        }
    }
}
class SecuenciaFrases {
    constructor(frases, elTexto, elIndicador, elGlow) {
        this.frases      = frases;
        this.elTexto     = elTexto;
        this.elIndicador = elIndicador;
        this.elGlow      = elGlow;
        this.indice      = 0;
        this._crearPuntos();
    }

    _crearPuntos() {
        this.elIndicador.innerHTML = '';
        this.frases.forEach((_, i) => {
            const d = document.createElement('div');
            d.className = 'punto';
            d.id        = 'punto-' + i;
            this.elIndicador.appendChild(d);
        });
    }

    _actualizarPuntos() {
        this.frases.forEach((_, i) => {
            const p = document.getElementById('punto-' + i);
            if (p) p.className = 'punto' + (i === this.indice ? ' activo' : '');
        });
    }

    iniciar() {
        this.elGlow.classList.add('visible');
        this.elIndicador.classList.add('visible');
        this._mostrarFrase();
    }

    _mostrarFrase() {
        const el    = this.elTexto;
        const frase = this.frases[this.indice];

        // Quitar clases anteriores y forzar reflow para reiniciar transición
        el.classList.remove('visible', 'es-titulo');
        void el.offsetWidth;

        el.textContent = frase.texto;
        if (frase.esTitulo) el.classList.add('es-titulo');

        requestAnimationFrame(() => el.classList.add('visible'));
        this._actualizarPuntos();

        // El título dura 2 s, el resto 2.5 s
        const duracion = frase.esTitulo ? 2000 : 2500;

        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => {
                this.indice = (this.indice + 1) % this.frases.length;
                this._mostrarFrase();
            }, 700);
        }, duracion);
    }
}

class Disciplina {
    constructor(config) {
        this.canvas   = config.canvas;
        this.btn      = document.getElementById(config.btnId || 'btn-camina');
        this.elTexto  = document.getElementById(config.textoId  || 'frase-texto');
        this.elInd    = document.getElementById(config.indId    || 'indicador');
        this.elGlow   = document.getElementById(config.glowId   || 'glow-ring');
        this.iniciado = false;

        this.lluvia    = new LluviaFlores(this.canvas, config.cantidad || 65);

        this.secuencia = new SecuenciaFrases(
            config.frases,
            this.elTexto,
            this.elInd,
            this.elGlow
        );

        // Música: src configurable, con loop y control visible
        this.musica = new Musica(
            config.musicaSrc,
            config.musicaBtnId  || 'btn-musica',
            config.musicaLblId  || 'lbl-musica',
            config.musicaCtrlId || 'ctrl-musica'
        );

        this._ajustarCanvas();
        window.addEventListener('resize', () => this._ajustarCanvas());
    }

    // Inicia todo al presionar el botón "Camina"
    caminar() {
        if (this.iniciado) return;
        this.iniciado = true;

        // Ocultar botón con fade
        if (this.btn) {
            this.btn.style.transition = 'opacity 0.8s ease';
            this.btn.style.opacity    = '0';
            setTimeout(() => this.btn.style.display = 'none', 800);
        }

        // Iniciar lluvia + música al mismo tiempo
        this.lluvia.iniciar();
        this.musica.iniciar();

        // Frases arrancan 500 ms después para dar tiempo al fade del botón
        setTimeout(() => this.secuencia.iniciar(), 500);
    }

    _ajustarCanvas() {
        const app          = this.canvas.parentElement;
        this.canvas.width  = app.offsetWidth;
        this.canvas.height = app.offsetHeight;
    }
}

const disciplina = new Disciplina({
    canvas      : document.getElementById('canvas'),
    btnId       : 'btn-camina',
    textoId     : 'frase-texto',
    indId       : 'indicador',
    glowId      : 'glow-ring',
    cantidad    : 65,

    musicaSrc   : 'songq.mp3', 
    musicaBtnId : 'btn-musica',
    musicaLblId : 'lbl-musica',
    musicaCtrlId: 'ctrl-musica',

    frases: [
        { texto: '✦  Disciplina  ✦',                                           esTitulo: true  },
        { texto: 'Sé que es difícil.',                                           esTitulo: false },
        { texto: 'Más aún cuando estás solo.',                                   esTitulo: false },
        { texto: 'Pero no te pierdas a ti mismo en esa oscuridad.',              esTitulo: false },
        { texto: 'Que tu brillo no desaparezca por un mal momento.',             esTitulo: false },
        { texto: 'Tú eres más fuerte de lo que crees.',                          esTitulo: false },
        { texto: 'Y si aún así crees que no lo eres...',                         esTitulo: false },
        { texto: 'No te quedes ahí. Comienza a caminar.',                        esTitulo: false },
        { texto: 'El fuerte no es fuerte por nacer fuerte.',                     esTitulo: false },
        { texto: 'Es fuerte porque fue débil y siguió caminando.',               esTitulo: false },
        { texto: 'Camina aunque estés cansado, aunque estés triste.',            esTitulo: false },
        { texto: 'Camina para que mañana no haya remordimientos.',               esTitulo: false },
    ],
});