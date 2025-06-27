# WebGL Fluid Simulation

[Play here](https://paveldogreat.github.io/WebGL-Fluid-Simulation/)

<img src="/screenshot.jpg?raw=true" width="880">

## References

https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu

https://github.com/mharrys/fluids-2d

https://github.com/haxiomic/GPU-Fluid-Experiments

## License

The code is available under the [MIT license](LICENSE)

## Tilda integration

When embedding the effect on a Tilda page, the canvas must receive mouse
events. Do **not** disable pointer events on it. Below is a minimal block
that can be inserted via the HTML widget. The scripts are loaded from
jsDelivr:

```html
<style>
  #fluid-canvas {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }
</style>

<canvas id="fluid-canvas"></canvas>

<script src="https://cdn.jsdelivr.net/gh/PavelDoGreat/WebGL-Fluid-Simulation/config.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PavelDoGreat/WebGL-Fluid-Simulation/init.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PavelDoGreat/WebGL-Fluid-Simulation/pointer.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PavelDoGreat/WebGL-Fluid-Simulation/script.js"></script>
```
