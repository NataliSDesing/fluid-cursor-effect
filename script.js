/*
MIT License

Copyright (c) 2017 Pavel Dobryakov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

let canvas = document.querySelector('canvas');
resizeCanvas();

let config = new Config();
let pointers = [new pointerPrototype()];
let splatStack = [];

let lastColorChangeTime = Date.now();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

function update() {
    resizeCanvas();

    // Обновляем цвет, если включен автоцвет
    if (config.COLORFUL && Date.now() - lastColorChangeTime > 1000) {
        lastColorChangeTime = Date.now();
        config.DYE_COLOR = [Math.random(), Math.random(), Math.random()];
    }

    // Генерация всплесков
    while (splatStack.length > 0)
        multipleSplats(parseInt(splatStack.pop()));

    // Обновление fluid-логики
    applyInputs();
    step();
    render(null);

    requestAnimationFrame(update);
}

function applyInputs() {
    for (let i = 0; i < pointers.length; i++) {
        const p = pointers[i];
        if (p.moved) {
            p.moved = false;
            splat(p.x, p.y, p.dx, p.dy, p.color);
        }
    }
}

// Инициализация
initFramebuffers();
update();

canvas.addEventListener('mousedown', e => {
    const posX = e.offsetX / canvas.width;
    const posY = 1.0 - e.offsetY / canvas.height;
    const color = generateColor();
    splatStack.push(1);
    updatePointerDownData(pointers[0], posX, posY, color);
});

canvas.addEventListener('mousemove', e => {
    updatePointerMoveData(pointers[0], e.offsetX / canvas.width, 1.0 - e.offsetY / canvas.height);
});

canvas.addEventListener('mouseup', () => {
    pointers[0].down = false;
});

function generateColor() {
    const c = HSVtoRGB(Math.random(), 1.0, 1.0);
    return [c.r, c.g, c.b];
}
