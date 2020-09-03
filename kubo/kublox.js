//declarar las variables de nuestra app. 
var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var mesh1, mesh2;

var markerRoot1, markerRoot2, markerRoot3, markerRoot4;

var RhinoMesh, RhinoMesh2, RhinoMesh3, RhinoMesh4;

var raycaster; //permite apuntar o detectar objetos en nuestra aplicación

var mouse = THREE.Vector2();

var INTERSECTED; //guarda info sobre los objetos intersectados por mi raycast

var objects = []; //guarda los bojectos que quiero detectar

var sprite1; // variable para label
var canvas1, context1, texture1; //variables para la creacion de label

//////////////////FUNCIONES///////////////////////////////////

//función principal//
function main() {
    init();
    animate();
}

//ejecutamos la app llamada main
main(); //llamado a la función main

function init() {

    //////Creación de una escena///////////
    scene = new THREE.Scene();
    // mouse = new TRHEE.Vector2();

    /////CREACIÓN DE CÁMARA//////////
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000); //creo objeto camara 
    //agrego la camara a mi escena
    scene.add(camera); // agrego camara a la escena

    /////CREACIÓN DE RAYCASTER//////
    raycaster = new THREE.Raycaster();



    ////////////CREACIÓN DE  LUCES//////////////
    let lightSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        })
    );

    //luz principal
    let light = new THREE.PointLight(0xffffff, 1, 100); //creo nueva luz 
    light.position.set(0, 4, 4); //indico la posicion de la luz 
    light.castShadow = true; //activo la capacidad de generar sombras.
    light.castShadow.mapSize.width = 4096; //resolucion de mapa de sombra
    light.castShadow.mapSize.height = 4096; //resolucion de mapa de sombra

    lightSphere.position.copy(light);

    ///Agrego luz a mi escena/////
    scene.add(light); //agrego la luz a mi escena 
    scene.add(lightSphere);

    ////Creación del renderer/////
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(1920, 1080);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement); // agregarlo a nuestra pagina web

    /////Creación de counter/////
    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    ////Setup ARToolKitsource
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });

    function onResize() {
        arToolkitSource.onResize()
        arToolkitSource.copySizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
        }
    }

    arToolkitSource.init(function onReady() {
        onResize();
    });

    //agregamos un event listener
    window.addEventListener('resize', function () {
        onResize()
    });

    //Setup ArToolKitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono'
    });

    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });


    /////////////////////////////////////////////////
    //Marker setup
    /////////////////////////////////////////////////

    ////Marcador 1////
    markerRoot1 = new THREE.Group
    markerRoot1.name = 'marker1'
    scene.add(markerRoot1)
    var markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'pattern',
        patternUrl: "data/pattern-marcador1.patt",
    })

    //////OBJETO RHINO 1///////////////
    new THREE.MTLLoader()
        .setPath('data/models/')
        .load('creeper.mtl', function (materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('data/models/')
                .load('creeper.obj', function (group) {
                    RhinoMesh = group.children[0];
                    RhinoMesh.material.side = THREE.DoubleSide;
                    RhinoMesh.scale.set(0.01, 0.01, 0.01);
                    RhinoMesh.castShadow = true;
                    RhinoMesh.receiveShadow = true;
                    RhinoMesh.position.set(0, 0, 0);
                    RhinoMesh.name = "Te voy a comer, graur"

                }, onProgress, onError);
        });

    /////CREACIÓN ELEMENTO TEXTO////////
    //Canvas
    canvas1 = document.createElement("canvas");
    context1 = canvas1.getContext("2d");
    context1.font = "Bold 20px Arial";
    context1.fillStyle = "rgba(0, 0, 0, 0.95";
    context1.fillText("Hello", 0, 1);

    //Los contenidos del canvas serán usados como textura
    texture1 = new TRHEE.Texture(canvas1);
    texture1.needsUpdate = true;


    //Creación del Sprite
    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture1
    })
    sprite1 = new THREE.Sprite(spriteMaterial);
    sprite1.scale.set(1, 0.5, 1);
    sprite1.position.set(50, 50, 0);

    ////////////AGREGAMOS OBJETOS A ESCENA Y ARRAY OBJECTS////////////

    //Agregamos objetos a detectar nuestro array objects
    objects.push(RhinoMesh);

    //Agregamos nuestros objetos a la escena miedante el objeto marker1
    markerRoot1.add(RhinoMesh);
    markerRoot1.add(sprite1);


    /////EVENT LISTENERS///////
    document.addEventListener("mousemove", onDocumentMouseMove, false); //detecta movimiento del mouse


}


///////////////FUNCIONES//////////////////////////

function onDocumentMouseMove(event) {
    event.preventDefault();
    sprite1.position.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0);
    sprite1.renderOrder = 999;
    sprite1.onBeforeRender = function(renderer){renderer.clearDepth();}


    mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1); //Mouse POS

    raycaster.setFromCamera(mouse, camera); //creo el rayo que va desde la cámara, pasa por el frustrum
    let intersects = raycaster.intersectObjects(objects, true); //Buscamos las intersecciones

    if (intersects.lenght > 0) {
        if (intersects[0].object != INTERSECTED) {
            if (INTERSECTED) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            }
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xfff00);

            if (INTERSECTED.name) {
                context1.clearRect(0, 0, 640, 480);
                let message = INTERSECTED.name;
                let metrics = context1.measureText(message);
                let width = metrics.width;
                context1.fillStyle = "rgba (0,0,0,0.95)"; // Borde negro
                context1.fillRect(0, 0, width + 8, 20 + 8);
                context1.fillStyle = "rgba (255,255,255,0.95)"; // Borde blanco
                context1.fillRect(2, 2, width + 4, 20 + 4);
                context1.fillStyle = "rgba (0,0,0,1)"; // Color de texto
                context1.fillText(message, 4, 20);
                texture1.needsUpdate = true;

            } else {
                context1.clearRect(0, 0, 300, 300); //Si no estamos intersectando nada, entonces que no se muestre nada
                texture1.needsUpdate = true;

            }

        }
    }

    // Si no encuentra intersecciones
    else {
        if (INTERSECTED) {
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex); //Devolviendo el color original al objeto
        }
        INTERSECTED = null;
        context1.clearRect(0, 0, 300, 300);
        texture1.needsUpdate = true;
    }
}


function update() {
    //actualiza contenido de nuestra app AR
    if (arToolkitSource.ready !== false) {
        arToolkitContext.update(arToolkitSource.domElement);
    }
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();
    totalTime += deltaTime; // totalTime =  totalTime + deltaTime 
    update();
    render();
}