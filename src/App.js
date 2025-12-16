import { useEffect } from 'react';
import './dist/index.css';

function App() {

  class Particle {
    constructor(effect, x ,y, color) {
      this.effect = effect;
      this.x = Math.random() * this.effect.canvasWidth;
      this.y = 0;
      this.color = color;
      this.originX = x;
      this.originY = y;
      this.size = this.effect.gap - 1;
      this.dx = 0;
      this.dy = 0;
      this.vx = 0;
      this.vy = 0;
      this.force = 0;
      this.angle = 0;
      this.distance = 0;
      this.friction = Math.random() * 0.6 + 0.15;
      this.ease = Math.random() * 0.1 + 0.005;
    }

    draw() {
      this.effect.context.fillStyle = this.color;
      this.effect.context.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {

      this.dx = this.effect.mouse.x - this.x;
      this.dy = this.effect.mouse.y - this.y;
      this.distance = this.dx * this.dx + this.dy * this.dy;
      this.force = -this.effect.mouse.radius / this.distance;

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += this.force * Math.cos(this.angle);
        this.vy += this.force * Math.sin(this.angle);
      }

      this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
      this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
  }

  class Effect {
    constructor(context, canvasWidth, canvasHeight) {
      this.context = context;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.textX = canvasWidth / 2;
      this.textY = canvasHeight / 2
      this.fontSize = 150;
      this.maxTextWidth = canvasWidth * 0.5;
      this.lineHeight = this.fontSize * 0.9;
      this.textInput = document.querySelector('#textInput');
      this.textInput.addEventListener('keyup', (e) => {
        if (e.key !== ' ') {
          this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
          this.wrapText(e.target.value);
        }
      });

      this.particles = [];
      this.gap = 5;
      this.mouse = {
        radius: 20000,
        x: 0,
        y: 0
      }

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      });

    }

    wrapText(text) {
      const gradient = this.context.createLinearGradient(0, this.canvasHeight / 2, this.canvasWidth, this.canvasHeight / 2);
      gradient.addColorStop(0.3, 'red');
      gradient.addColorStop(0.7, 'blue');
      gradient.addColorStop(0.9, 'purple');
      this.context.fillStyle = gradient;
      this.context.font = this.fontSize + 'px sans-serif';
      this.context.textAlign = 'center';
      this.context.textBaseline = 'center';


      let linesArray = [];
      let lineCounter = 0;
      let line = '';
      
      let words = text.split(' ');

      for (let i = 0; i < words.length; i++) {
        let lineHolder = line + words[i] + ' ';

        if (this.context.measureText(lineHolder).width > this.maxTextWidth) {
          line = words[i] + ' ';
          lineCounter++;
        } else {
          line = lineHolder;
        }

        linesArray[lineCounter] = line;
      }

      let textHeight = this.lineHeight * lineCounter;
      let y = this.textY - textHeight / 2;

      linesArray.forEach((el, index) => {
        this.context.fillText(el, this.canvasWidth / 2, y + (index * this.lineHeight));
      });

      this.convertToParticle();
    }

    convertToParticle() {
      this.particles = [];
      const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      for (let y = 0; y < this.canvasHeight; y += this.gap) {
        for (let x = 0; x < this.canvasWidth; x += this.gap) {
          const index = (y * this.canvasWidth + x) * 4;
          const alpha = pixels[index + 3];

          if (alpha > 0) {
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const color = 'rgb(' + red + ',' + green + ',' + blue + ')';
            this.particles.push(new Particle(this, x, y, color));
          }
        }
      }
    }

    render() {
      this.particles.forEach((x) => {
        x.update();
        x.draw();
      });
    }

    resize(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.maxTextWidth = this.canvasWidth * 0.5;
    }
  }


  useEffect(() => {

    const canvas = document.querySelector('#canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const effect = new Effect(ctx, canvas.width, canvas.height);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      effect.render();
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      effect.resize(canvas.width, canvas.height);
      effect.wrapText(effect.textInput.value);
    });
  },[]);




  
  return (
    <div className="App">

      <input type="text" name="text" id="textInput" placeholder='Type something and hover over text'/>
      <canvas id='canvas1'></canvas>
      
    </div>
  );
}

export default App;
