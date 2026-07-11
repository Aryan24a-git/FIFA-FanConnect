'use strict';

// 1. Tailwind Config Initialization
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "surface-dim": "#131315",
        "tertiary-fixed-dim": "#e9c400",
        "secondary-container": "#00e3fd",
        "tertiary": "#e9c400",
        "surface-container-lowest": "#0e0e10",
        "on-tertiary-fixed": "#221b00",
        "on-secondary-fixed": "#001f24",
        "surface-tint": "#bfc5e4",
        "surface-container-high": "#2a2a2c",
        "on-surface": "#e5e2e4",
        "surface-bright": "#39393b",
        "on-error": "#690005",
        "on-tertiary": "#3a3000",
        "surface-container": "#1f1f21",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "primary-fixed-dim": "#bfc5e4",
        "on-secondary-container": "#00616d",
        "inverse-primary": "#575d78",
        "inverse-on-surface": "#303032",
        "on-background": "#e5e2e4",
        "background": "#131315",
        "on-primary-container": "#767c99",
        "on-tertiary-fixed-variant": "#544600",
        "on-secondary": "#00363d",
        "surface-variant": "#353436",
        "surface": "#131315",
        "on-secondary-fixed-variant": "#004f58",
        "surface-container-highest": "#353436",
        "secondary-fixed": "#9cf0ff",
        "on-primary-fixed": "#141a32",
        "on-primary-fixed-variant": "#3f465f",
        "inverse-surface": "#e5e2e4",
        "tertiary-fixed": "#ffe16d",
        "outline-variant": "#46464d",
        "surface-container-low": "#1b1b1d",
        "primary": "#bfc5e4",
        "secondary-fixed-dim": "#00daf3",
        "secondary": "#bdf4ff",
        "outline": "#909098",
        "on-primary": "#292f48",
        "on-tertiary-container": "#4c3f00",
        "on-surface-variant": "#c6c6ce",
        "primary-fixed": "#dce1ff",
        "primary-container": "#0a1128",
        "tertiary-container": "#c9a900",
        "on-error-container": "#ffdad6"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "lg": "24px",
        "md": "16px",
        "margin-mobile": "16px",
        "unit": "4px",
        "margin-desktop": "48px",
        "xxl": "64px",
        "gutter": "20px",
        "xs": "4px",
        "sm": "8px",
        "xl": "40px"
      },
      "fontFamily": {
        "display-md": ["Outfit"],
        "headline-lg-mobile": ["Outfit"],
        "label-md": ["Inter"],
        "display-lg": ["Outfit"],
        "caption": ["Inter"],
        "headline-md": ["Outfit"],
        "body-md": ["Inter"],
        "headline-lg": ["Outfit"],
        "body-lg": ["Inter"]
      },
      "fontSize": {
        "display-md": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "caption": ["12px", { "lineHeight": "16px", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }]
      }
    }
  }
};

// 2. ThreeJS Backdrop and Shader Animations
(function () {
  // THREE JS FOOTBALL
  const container = document.getElementById('threejs-container-ANIMATION_3');
  if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    // Football Geometry (Subdivided Icosahedron)
    const radius = 2;
    let geometry = new THREE.IcosahedronGeometry(radius, 2).toNonIndexed();
    const positionAttribute = geometry.getAttribute('position');
    const colors = [];

    const t = (1 + Math.sqrt(5)) / 2;
    const pentagonCenters = [
      new THREE.Vector3(-1, t, 0).normalize(), new THREE.Vector3(1, t, 0).normalize(),
      new THREE.Vector3(-1, -t, 0).normalize(), new THREE.Vector3(1, -t, 0).normalize(),
      new THREE.Vector3(0, -1, t).normalize(), new THREE.Vector3(0, 1, t).normalize(),
      new THREE.Vector3(0, -1, -t).normalize(), new THREE.Vector3(0, 1, -t).normalize(),
      new THREE.Vector3(-t, 0, -1).normalize(), new THREE.Vector3(-t, 0, 1).normalize(),
      new THREE.Vector3(t, 0, -1).normalize(), new THREE.Vector3(t, 0, 1).normalize()
    ];

    const origIco = new THREE.IcosahedronGeometry(radius, 0);
    const origPos = origIco.getAttribute('position');
    const hexagonCenters = [];
    for (let i = 0; i < origPos.count; i += 3) {
      const v1 = new THREE.Vector3().fromBufferAttribute(origPos, i);
      const v2 = new THREE.Vector3().fromBufferAttribute(origPos, i + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(origPos, i + 2);
      hexagonCenters.push(new THREE.Vector3().addVectors(v1, v2).add(v3).divideScalar(3).normalize());
    }

    const colorWhite = new THREE.Color(0xffffff);
    const palette = [
      new THREE.Color(0xffdd00), new THREE.Color(0x00d4ff),
      new THREE.Color(0xff5e00), new THREE.Color(0x88929b),
      new THREE.Color(0x1a1a1a), colorWhite, colorWhite
    ];

    for (let i = 0; i < positionAttribute.count; i += 3) {
      const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
      const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2);

      const center = new THREE.Vector3().addVectors(v1, v2).add(v3).divideScalar(3).normalize();

      let isPentagon = false;
      let panelCenter = null;

      for (let j = 0; j < pentagonCenters.length; j++) {
        if (v1.clone().normalize().distanceTo(pentagonCenters[j]) < 0.01 ||
          v2.clone().normalize().distanceTo(pentagonCenters[j]) < 0.01 ||
          v3.clone().normalize().distanceTo(pentagonCenters[j]) < 0.01) {
          isPentagon = true;
          panelCenter = pentagonCenters[j].clone().multiplyScalar(radius);
          break;
        }
      }

      if (!isPentagon) {
        let minDist = Infinity;
        for (let j = 0; j < hexagonCenters.length; j++) {
          const d = center.distanceTo(hexagonCenters[j]);
          if (d < minDist) {
            minDist = d;
            panelCenter = hexagonCenters[j].clone().multiplyScalar(radius);
          }
        }
      }

      const shrinkFactor = 0.95;
      v1.lerp(panelCenter, 1 - shrinkFactor).normalize().multiplyScalar(radius);
      v2.lerp(panelCenter, 1 - shrinkFactor).normalize().multiplyScalar(radius);
      v3.lerp(panelCenter, 1 - shrinkFactor).normalize().multiplyScalar(radius);

      positionAttribute.setXYZ(i, v1.x, v1.y, v1.z);
      positionAttribute.setXYZ(i + 1, v2.x, v2.y, v2.z);
      positionAttribute.setXYZ(i + 2, v3.x, v3.y, v3.z);

      const pHash = Math.abs(Math.sin(panelCenter.x * 12.9898 + panelCenter.y * 78.233 + panelCenter.z * 37.719)) * 43758.5453;
      const isPatterned = (pHash - Math.floor(pHash)) > 0.55;

      let faceColor = colorWhite;
      if (isPatterned) {
        const tHash = Math.abs(Math.sin(center.x * 12.9898 + center.y * 78.233 + center.z * 37.719)) * 43758.5453;
        const colorIdx = Math.floor((tHash - Math.floor(tHash)) * palette.length);
        faceColor = palette[colorIdx];
      }

      colors.push(faceColor.r, faceColor.g, faceColor.b);
      colors.push(faceColor.r, faceColor.g, faceColor.b);
      colors.push(faceColor.r, faceColor.g, faceColor.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.7,
      metalness: 0.1
    });

    const footballGroup = new THREE.Group();
    footballGroup.position.x = 0; // Centered in the right-half container
    scene.add(footballGroup);

    const ball = new THREE.Mesh(geometry, material);
    footballGroup.add(ball);

    const innerGeom = new THREE.IcosahedronGeometry(1.95, 2);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const innerSphere = new THREE.Mesh(innerGeom, innerMat);
    footballGroup.add(innerSphere);

    // Draw Curved "FIFA" Text on Canvas
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 256;
    const ctx = textCanvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);

    // Draw curved text path
    ctx.font = 'bold 110px "Outfit", "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const str = 'FIFA';
    const arcRadius = 190;
    const charSpacingAngle = 0.24; // rotation angle spacing
    const startAngle = -charSpacingAngle * (str.length - 1) / 2;

    // Move center of arc down off-screen to bend text upwards
    ctx.translate(256, 320);
    for (let i = 0; i < str.length; i++) {
      const charAngle = startAngle + i * charSpacingAngle;
      ctx.rotate(charAngle);

      // Outer thick black shadow outline
      ctx.strokeStyle = '#11131e';
      ctx.lineWidth = 14;
      ctx.strokeText(str[i], 0, -arcRadius);

      // Inner neon cyan outline
      ctx.strokeStyle = '#00daf3';
      ctx.lineWidth = 6;
      ctx.strokeText(str[i], 0, -arcRadius);

      // Solid white text fill
      ctx.fillText(str[i], 0, -arcRadius);

      ctx.rotate(-charAngle);
    }

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.anisotropy = 4;

    // Create a curved segment on the sphere surface
    const patchGeom = new THREE.SphereGeometry(
      2.01,             // radius slightly larger than 2.0 to prevent Z-fighting
      32,               // width segments
      16,               // height segments
      Math.PI / 2 - 0.5,  // phiStart (centered around front camera axis)
      1.0,              // phiLength
      Math.PI / 2 - 0.4,  // thetaStart (equator region)
      0.8               // thetaLength
    );

    const patchMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const patch = new THREE.Mesh(patchGeom, patchMat);
    footballGroup.add(patch);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pl = new THREE.PointLight(0x00E5FF, 1.5, 50); pl.position.set(5, -5, 5); scene.add(pl);
    const bl = new THREE.PointLight(0xFFD700, 1.5, 50); bl.position.set(-5, 5, -5); scene.add(bl);

    camera.position.z = 8;

    // Interactive Rotation Variables
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;
    const baseSpeed = 0.005;

    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
    });

    const animate = () => {
      requestAnimationFrame(animate);

      // Auto rotation
      footballGroup.rotation.y += baseSpeed;
      footballGroup.rotation.x += baseSpeed * 0.5;

      // Mouse influence
      targetRotationY = mouseX * 2.5;
      targetRotationX = mouseY * 2.5;

      footballGroup.rotation.y += (targetRotationY - footballGroup.rotation.y) * 0.05;
      footballGroup.rotation.x += (targetRotationX - footballGroup.rotation.x) * 0.05;

      // Float effect
      footballGroup.position.y = Math.sin(Date.now() * 0.002) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // SHADER
  const canvas = document.getElementById('shader-canvas-ANIMATION_4');
  if (canvas) {
    const gl = canvas.getContext('webgl');
    if (gl) {
      const vs = `attribute vec2 a_position; varying vec2 v_texCoord; void main() { v_texCoord = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
      const fs = `precision highp float; uniform float u_time; varying vec2 v_texCoord;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
void main() {
    vec2 uv = v_texCoord; vec3 color = vec3(0.04, 0.06, 0.15);
    for(float i = 0.0; i < 40.0; i++) {
        vec2 pos = vec2(hash(vec2(i, 1.0)), hash(vec2(i, 2.0)));
        pos.y = fract(pos.y + u_time * 0.02 * (0.5 + hash(vec2(i, 3.0))));
        float size = 0.001 + 0.002 * hash(vec2(i, 4.0));
        float dist = length(uv - pos);
        float glow = smoothstep(size * 4.0, 0.0, dist);
        color += vec3(0.0, 0.9, 1.0) * glow * 0.3;
    }
    vec2 flarePos = vec2(0.2, 0.8) + vec2(sin(u_time * 0.5), cos(u_time * 0.3)) * 0.05;
    float flare = smoothstep(0.4, 0.0, length(uv - flarePos));
    color += vec3(1.0, 0.84, 0.0) * flare * 0.15;
    gl_FragColor = vec4(color, 0.4);
}`;
      const prog = gl.createProgram();
      const s1 = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(s1, vs); gl.compileShader(s1); gl.attachShader(prog, s1);
      const s2 = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(s2, fs); gl.compileShader(s2); gl.attachShader(prog, s2);
      gl.linkProgram(prog); gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const pos = gl.getAttribLocation(prog, 'a_position'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      const uTime = gl.getUniformLocation(prog, 'u_time');
      const render = (t) => {
        canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(uTime, t * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
      };
      render(0);
    }
  }
})();
