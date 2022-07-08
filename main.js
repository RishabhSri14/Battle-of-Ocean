import './style.css'


import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer;
let controls, water, sun;

const loader = new GLTFLoader();

function Display() {
  document.getElementById("Score").innerHTML = "Score: " + score
  document.getElementById("Chest-left").innerHTML = "Treasure Chest Left: " + chest
  document.getElementById("Player's Health").innerHTML = "Player's Health: " + health
  if(Ehealth[2]>=0)
  document.getElementById("Enemy-1 Health").innerHTML = "Enemy-1 Health: " + Ehealth[2]
  if(Ehealth[1]>=0)
  document.getElementById("Enemy-2 Health").innerHTML = "Enemy-2 Health: " + Ehealth[1]
  if(Ehealth[0]>=0)
  document.getElementById("Enemy-3 Health").innerHTML = "Enemy-3 Health: " + Ehealth[0]
  document.getElementById("Cannons").innerHTML = "Cannon-balls🔥: " + current_balls
  document.getElementById("time").innerHTML = "Time: " + timeSpend
}

document.getElementById("buyCanon").onclick = function () { BuyCanon() }
function BuyCanon() {
  if (score >= 50) {
    score -= 50;
    current_balls += 1
  }
}

var myfunc = setInterval(function () {
  timeSpend += 1
}, 1000)

async function loadModel(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene)
    })
  })
}

class Boat {
  constructor() {
    loader.load("textures/FriendlyShip/scene.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(2, 2, 2)
      gltf.scene.position.set(0, -15, 0)
      gltf.scene.rotation.y = 3.15

      this.boat = gltf.scene
      this.speed = {
        vel: 0,
        rot: 0
      }
    })
  }

  stop() {
    this.speed.vel = 0
    this.speed.rot = 0
  }

  update() {
    if (this.boat) {
      this.boat.rotation.y += this.speed.rot
      this.boat.translateZ(this.speed.vel)
    }
  }
}


class Treasure {
  constructor(_scene) {
    scene.add(_scene);
    this.treasure = _scene;
    _scene.scale.set(0.1, 0.1, 0.1);
    _scene.position.set((Math.random() * (2000)) - 1000, 0, (Math.random() * (2000)) - 1000);
  }
}

class Eship {
  constructor(_scene) {
    scene.add(_scene);
    this.eship = _scene;
    if (Eships.length == 0) {
      _scene.scale.set(10, 10, 10);
      _scene.position.set(800, 0, -1800);
      _scene.rotation.y = Math.PI / 2 - Math.atan(_scene.position.z / _scene.position.x)

    }
    if (Eships.length == 1) {
      _scene.scale.set(10, 10, 10);
      _scene.position.set(0, 0, -2000);
      _scene.rotation.y = 3.14
    }
    if (Eships.length == 2) {
      _scene.scale.set(10, 10, 10);
      _scene.position.set(-800, 0, -1800);
      _scene.rotation.y = Math.PI + Math.atan(_scene.position.x / _scene.position.z)
    }
    this.speed = 1
    this.rot = 0
  }
  stop() {
    this.speed = 0
    this.rot = 0
  }

  update() {
    if (this.eship) {
      this.eship.rotation.y = this.rot
      this.eship.translateZ(this.speed)
    }
  }
}

class CannonBall {
  constructor(_scene) {
    // scene.add(_scene);
    _scene.position.set(0, 1000, 0);
    _scene.scale.set(10, 10, 10)
    this.ball = _scene;
    this.speed = FRONT_CANNON_SPEED
    this.elev = (Math.PI * (45 / 180));
    this.type = 1;
    this.speed_x = (this.speed) * Math.cos(this.elev)
    this.speed_y = (this.speed) * Math.sin(this.elev)
  }

  update() {
    if (this.ball) {
      this.ball.rotation.y =boat.boat.rotation.y
      if (this.type == 1) {
        this.ball.translateZ(this.speed_x)
      }
      if (this.type == 2) {
        this.ball.translateX(-this.speed_x)
      }
      if (this.type == 3) {
        this.ball.translateX(this.speed_x)
      }
      this.ball.position.y += this.speed_y
      this.speed_y -= acceleration
      console.log(this.speed_y,this.ball.position.y)
    }
  }
  reset()
  {
    if(this.ball)
    {
      scene.remove(this.ball)
      this.ball.position.set(0,1000,0)
      this.type =1;
      this.elev45
    }
  }
}

async function createCannonBall() {
  if (!CannonBallScene) {
    CannonBallScene = await loadModel("textures/cannon_ball/scene.gltf")
  }
  return new CannonBall(CannonBallScene.clone())
}

async function createTreasure() {
  if (!TreasureScene) {
    TreasureScene = await loadModel("textures/treasure/scene.gltf")
  }
  return new Treasure(TreasureScene.clone())
}


//Functions to load models
async function createEnemyShip() {
  if (!EshipScene) {
    EshipScene = await loadModel("textures/EnemyShip/scene.gltf")
  }
  return new Eship(EshipScene.clone())
}



async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(2, 85, 180);
  // camera.lookAt.set(0,0,20)
  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('textures/ocean/waternormals.jpg', function (texture) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;

  }

  updateSun();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const waterUniforms = water.material.uniforms;

  for (let i = 0; i < TREASURE_COUNT; i++) {
    const treasure = await createTreasure();
    treasures.push(treasure)

  }
  for (let i = 0; i < ENEMY_SHIP_COUNT; i++) {
    const eship = await createEnemyShip();
    Eships.push(eship)
    Ehealth.push(200)
  }
  for (let i = 0; i < MAX_BALLS; i++) {
    const ball = await createCannonBall();
    Balls.push(ball)
    BallsExistence.push(0)
  }
  for (let i = 0; i < ENEMY_SHIP_COUNT; i++) {
    const ball = await createCannonBall();
    EBalls.push(ball)
    EBallsExistence.push(0)
  }

  window.addEventListener('resize', onWindowResize);

  window.addEventListener('keydown', function (e) {
    if (e.key == "ArrowUp") {
      boat.speed.vel = 2.5;
    }
    if (e.key == "ArrowDown") {
      boat.speed.vel = -2.5
    }
    if (e.key == "ArrowRight") {
      boat.speed.rot = -0.05
    }
    if (e.key == "ArrowLeft") {
      boat.speed.rot = 0.05
    }
  })
  window.addEventListener('keypress', function (e) {
    if (e.key == "c") {
      camera_posNo = (camera_posNo + 1) % 2;
      if (camera_posNo == 0) {
        camera.position.set(0, 500, 2000)
      }
    }
    if (e.key == "w" && current_balls > 0) {
      create_front_balls += 1
      current_balls -= 1;
    }
    if (e.key == "a" && current_balls > 0) {
      create_left_balls += 1
      current_balls -= 1;
    }
    if (e.key == "d" && current_balls > 0) {
      create_right_balls += 1
      current_balls -= 1;
    }
  })
  window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

  window.addEventListener('keyup', function (e) {
    boat.stop()
  })

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function isColliding(obj1, obj2) {
  return (
    Math.sqrt((obj1.position.x - obj2.position.x) * (obj1.position.x - obj2.position.x) + (obj1.position.z - obj2.position.z) * (obj1.position.z - obj2.position.z))
  )
}

function checkCollisions() {
  if (boat.boat) {
    var i = -1;
    treasures.forEach(treasure => {
      if (treasure.treasure) {
        i += 1;
        if (isColliding(boat.boat, treasure.treasure) < 30) {
          scene.remove(treasure.treasure)
          score += 50;
          treasures.splice(i, 1);
          chest-=1;
        }
      }
    })
    var c = -1;
    Eships.forEach(Eship => {
      if (Eship.eship) {
        c += 1;
        if (isColliding(Eship.eship, boat.boat) < 700) {
          Eship.speed = 0;
        }
        else
          Eship.speed = 1;

      }

    })
    c = -1;
    EBalls.forEach(EBall => {
      if (EBall.ball) {
        c += 1;
        if (isColliding(EBall.ball, boat.boat) < 50 && EBall.ball.position.y>0 && EBall.ball.position.y<50) {
          health-=50;
        }
      }

    })
    for(let i =0;i< MAX_BALLS ; i++)
    {
      if(BallsExistence[i]==1)
      {
        for(let j=0;j<ENEMY_SHIP_COUNT;j++)
        {
          if(isColliding(Eships[j].eship,Balls[i].ball)< 50 && Balls[i].ball.position.y < 50 && Balls[i].ball.position.y>0)
            Ehealth[j]-=100
        }
      }
    }
  }

}

function BringBallToLife()
{
  while(create_front_balls> 0 )
  {
    var index=0;
    for (let i=0;i< MAX_BALLS;i++)
    {
      if(BallsExistence[i]==0)
      {
        index=i;
        break;
      }
    }
    BallsExistence[index]=1;
    Balls[index].ball.position.set(boat.boat.position.x,0.1,boat.boat.position.z)
    Balls[index].elev = elevation
    Balls[index].type =1;
    Balls[index].speed=FRONT_CANNON_SPEED
    Balls[index].speed_x =50
    Balls[index].speed_y =(Balls[index].speed)*Math.sin((Math.PI*(Balls[index].elev / 180)))  
    scene.add(Balls[index].ball)
    create_front_balls-=1;
  }
  while(create_left_balls> 0 )
  {
    var index=0;
    for (let i=0;i< MAX_BALLS;i++)
    {
      if(BallsExistence[i]==0)
      {
        index=i;
        break;
      }
    }
    BallsExistence[index]=1;
    Balls[index].elev = elevation
    Balls[index].type =3;
    Balls[index].ball.position.set(boat.boat.position.x,0.1,boat.boat.position.z)
    Balls[index].speed=LEFT_CANNON_SPEED
    Balls[index].speed_x =50
    Balls[index].speed_y =(Balls[index].speed)*Math.sin((Math.PI*(Balls[index].elev / 180)))  
    scene.add(Balls[index].ball)
    create_left_balls-=1;
    
  }
  while(create_right_balls> 0 )
  {
    var index=0;
    for (let i=0;i< MAX_BALLS;i++)
    {
      if(BallsExistence[i]==0)
      {
        index=i;
        break;
      }
    }
    BallsExistence[index]=1;
    Balls[index].elev = elevation
    Balls[index].type =2;
    Balls[index].ball.position.set(boat.boat.position.x,0.1,boat.boat.position.z)
    Balls[index].speed=RIGHT_CANNON_SPEED
    Balls[index].speed_x =50
    Balls[index].speed_y =(Balls[index].speed)*Math.sin((Math.PI*(Balls[index].elev / 180)))  
    scene.add(Balls[index].ball)
    create_right_balls-=1;
  }
  for(let i=0;i<ENEMY_SHIP_COUNT;i++)
  {
    if(i==turn || death == 1){
    if(EBallsExistence[i]==0 && Ehealth[i]>0)
    {
      EBallsExistence[i]=1;
      if(i==1)
        EBalls[i].elev = 45
      else if(i==0)
        EBalls[i].elev = 30
      else if(i==2)
        EBalls[i].elev = 37
      EBalls[i].type =1;
      EBalls[i].ball.position.set(Eships[i].eship.position.x,0.1,Eships[i].eship.position.z)
      EBalls[i].speed=ENEMY_CANNON_SPEED
      EBalls[i].speed_y =(EBalls[i].speed)*Math.sin((Math.PI*(EBalls[i].elev / 180)))  
      EBalls[i].speed_x =30
      scene.add(EBalls[i].ball)
    }
  }

  }
  
}

function animate() {
  requestAnimationFrame(animate);
  water.material.uniforms['time'].value += 1.0 / 60.0;
  Display();
  boat.update()

  for (let i = 0; i < ENEMY_SHIP_COUNT; i++) {
    if (Eships[i].eship) {
      Eships[i].rot = Math.atan2(boat.boat.position.x - Eships[i].eship.position.x, boat.boat.position.z - Eships[i].eship.position.z)
      Eships[i].update()
    }
    else
      continue;
  }
  checkCollisions()
  BringBallToLife()
  
  
  var c = -1
  
  Balls.forEach(Ball => {
    if (Ball.ball) {
      c += 1
      if(BallsExistence[c]==1)
        Ball.update();
      if (Ball.ball.position.y < 0 && BallsExistence[c]==1) {
        Ball.reset()
        BallsExistence[c]=0;
      }
    }
  })
  c=-1
  EBalls.forEach(EBall => {
    if (EBall.ball) {
      c += 1
      if(EBallsExistence[c]==1)
      {
        EBall.ball.rotation.y =Eships[c].eship.rotation.y
        EBall.ball.translateZ(EBall.speed_x)
        EBall.ball.position.y += EBall.speed_y
        EBall.speed_y -= acceleration  
      }
      if (EBall.ball.position.y < -10 && EBallsExistence[c]==1) {
        EBall.reset()
        EBallsExistence[c]=0;
        turn=(turn+1)%3
        
      }
    }
  })
  for(let i=0;i<ENEMY_SHIP_COUNT;i++)
  {
    if(Ehealth[i]<=0)
    {
      scene.remove(Eships[i].eship);
      death =1
    }
  }
  if(EBalls[0].ball.position.y<50)
  console.log(EBalls[1].ball.position)
  if (boat.boat && camera_posNo == 1)
    camera.position.set(boat.boat.position.x + 2.0, boat.boat.position.y + 100.0, boat.boat.position.z + 180.0);
  renderer.render(scene, camera);
  console.log(health, Ehealth[0],Ehealth[1], Ehealth[2])
  // console.log(score)
}

const boat = new Boat()


//object to store loaded scene
let TreasureScene = null
let EshipScene = null
let CannonBallScene = null

let treasures = []
const TREASURE_COUNT = 50

let Eships = []
const ENEMY_SHIP_COUNT = 3
let Ehealth = []
let health = 1000
let camera_posNo = 0;
let elevation = 90;
var score = 0
let Balls = []
let BallsExistence = []
let current_balls = 10 // must be limited to 10
let create_front_balls = 0
let create_left_balls = 0
let create_right_balls = 0
let MAX_BALLS = 10
let EBalls= []
let EBallsExistence=[]
let FRONT_CANNON_SPEED = 25
let LEFT_CANNON_SPEED =30
let RIGHT_CANNON_SPEED = 40
let ENEMY_CANNON_SPEED = 50
let acceleration = 3
let turn =0
let death =0
let chest=50
let timeSpend=0
init();
setTimeout(() => {
  animate();
}, 1000);




