//declarar las variables de nuestra app. 
var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var mesh1, mesh2;

var markerRoot1, markerRoot2, markerRoot3, markerRoot4;

var RhinoMesh, RhinoMesh2, RhinoMesh3, RhinoMesh4;

var raycaster; //permite apuntar o detectar objetos en nuestra aplicación

var mouse = THREE.Vector2();

var INTERSECTED; //guarda info sobre los objetos intersectados por mi raycast

var objects=[]; //guarda los bojectos que quiero detectar

var sprite1; // variable para label
var canvas1, context1, texture1; //variables para la creacion de label


init(); // llamado de la funcion principal que se encarga de hacer casi  todo en la app
animate();

function init() {
    ////////////////////////////////////////////////////////
    //THREE Setup
    ///////////////////////////////////////////////////////
    // crear nuestra escena -  OBJETO.
    scene = new THREE.Scene(); //  crea un objeto escena.

    //////////////////////////////////////////////////////
    //LUCES
    //////////////////////////////////////////////////////

    let light = new THREE.PointLight(0xffffff, 1, 100); //creo nueva luz 
    light.position.set(0, 4, 4); //indico la posicion de la luz 
    light.castShadow = true; //activo la capacidad de generar sombras.
    scene.add(light); //agrego la luz a mi escena 

    let lightSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        })
    );

    lightSphere.position.copy(light);
    scene.add(lightSphere);

    //creamos luces 
    let ambientLight = new THREE.AmbientLight(0xcccccc); //creo las luz
    scene.add(ambientLight); //agrego la luz a mi escena. 

    camera = new THREE.Camera(); //creo objeto camara 
    scene.add(camera); // agrego camara a la escena

    //permite mostrar las cosas en 3d en la pantalla
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement); // agregarlo a nuestra pagina web

    //tiempo
    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    ////////////////////////////////////////////////////////
    //AR Setup
    ///////////////////////////////////////////////////////

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

    //Setup ArKitContext
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

    ////Marcador 1//////////
    var markerRoot1 = new THREE.Group
	markerRoot1.name = 'marker1'
	scene.add(markerRoot1)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type : 'pattern',
        patternUrl : "data/pattern-marcador1.patt",
		
    })
    ////Marcador 2//////////
    var markerRoot2 = new THREE.Group
	markerRoot2.name = 'marker2'
	scene.add(markerRoot2)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot2, {
		type : 'pattern',
        patternUrl : "data/pattern-marcador2.patt",
		
    })
    ////Marcador 3//////////
    var markerRoot3 = new THREE.Group
	markerRoot3.name = 'marker3'
	scene.add(markerRoot3)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot3, {
		type : 'pattern',
        patternUrl : "data/pattern-marcador3.patt",
		
	})

    ////Marcador 4//////////
    var markerRoot4 = new THREE.Group
	markerRoot4.name = 'marker4'
	scene.add(markerRoot4)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot4, {
		type : 'pattern',
        patternUrl : "data/pattern-marcador4.patt",
		
	})





    // ////////////////////PISO////////////////
    // let floorGeometry = new THREE.PlaneGeometry(20, 20);
    // let floorMaterial = new THREE.ShadowMaterial();
    // floorMaterial.opacity = 0.25;

    // let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

    // floorMesh.rotation.x = -Math.PI / 2;
    // floorMesh.receiveShadow = true;
    // markerRoot1.add(floorMesh);
    // markerRoot2.add(floorMesh);


    /////// OBJ IMPORT/////////////////////
    function onProgress(xhr) { console.log((xhr.loaded / xhr.total * 100) + "% loaded"); }
    function onError(xhr) { console.log("ha ocurrido un error") };

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
                    RhinoMesh.position.set(0,0,0);

                    markerRoot1.add(RhinoMesh);
                }, onProgress, onError);
        });
    
     //////OBJETO RHINO 2///////////////
    new THREE.MTLLoader()
    .setPath('data/models/')
    .load('2.mtl', function (materials) {
        materials.preload();
        new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath('data/models/')
            .load('2.obj', function (group) {
                RhinoMesh2 = group.children[0];
                RhinoMesh2.material.side = THREE.DoubleSide;
                RhinoMesh2.scale.set(0.02, 0.02, 0.02);
                RhinoMesh2.castShadow = true;
                RhinoMesh2.receiveShadow = true;
                RhinoMesh2.position.set(0,0,0);

                markerRoot2.add(RhinoMesh2);
            }, onProgress, onError);
    });

     //////OBJETO RHINO 3///////////////
     new THREE.MTLLoader()
     .setPath('data/models/')
     .load('3.mtl', function (materials) {
         materials.preload();
         new THREE.OBJLoader()
             .setMaterials(materials)
             .setPath('data/models/')
             .load('3.obj', function (group) {
                 RhinoMesh3 = group.children[0];
                 RhinoMesh3.material.side = THREE.DoubleSide;
                 RhinoMesh3.scale.set(0.02, 0.02, 0.02);
                 RhinoMesh3.castShadow = true;
                 RhinoMesh3.receiveShadow = true;
                 RhinoMesh3.position.set(0,0,0);
 
                 markerRoot3.add(RhinoMesh3);
             }, onProgress, onError);
     });
     
      //////OBJETO RHINO 4///////////////
    new THREE.MTLLoader()
    .setPath('data/models/')
    .load('4.mtl', function (materials) {
        materials.preload();
        new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath('data/models/')
            .load('4.obj', function (group) {
                RhinoMesh4 = group.children[0];
                RhinoMesh4.material.side = THREE.DoubleSide;
                RhinoMesh4.scale.set(0.02, 0.02, 0.02);
                RhinoMesh4.castShadow = true;
                RhinoMesh4.receiveShadow = true;
                RhinoMesh4.position.set(0,0,0);

                markerRoot4.add(RhinoMesh4);
            }, onProgress, onError);
    });


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