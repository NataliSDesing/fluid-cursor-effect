'use strict';

class Pointer {
  constructor() {
    this.id = -1;
    this.down = false;
    this.moved = false;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.color = [30, 0, 300];
  }

  update(x, y) {
    this.prevTexcoordX = this.texcoordX;
    this.prevTexcoordY = this.texcoordY;
    this.texcoordX = x;
    this.texcoordY = y;
    this.deltaX = (this.texcoordX - this.prevTexcoordX);
    this.deltaY = (this.texcoordY - this.prevTexcoordY);
    this.moved = true;
  }
}

const pointers = [ new Pointer() ];
