
//Get an Euler Rotation for a given x and y rotation
function rotateAndTilt(x, y) {
	return new THREE.Euler( x * Math.PI / 180, y * Math.PI / 180, 0, 'YXZ' );
}


//Recursively builds tree out of 'stickObject's for 'n' iterations
function getTree(n, stickObject, leafObject, branchScale) {

	//Parent will be the stick that other sticks stick out of
	var parent;

	if (n > 1) {

		 parent = stickObject.clone();

		//Getting child (branch) from next iteration, scaling down, and cloning twice
		for (var i = 0; i < 4; i++) {
			var child = getTree(n-1, stickObject, leafObject, branchScale);
			child.scale.set(branchScale, branchScale, branchScale);
			child.position.y += 1;
			parent.add(child);

			if (i !== 0) {
				child.quaternion.setFromEuler(rotateAndTilt(Math.random() * 25 + 25, Math.random() * 360));
			} else {
				child.quaternion.setFromEuler(rotateAndTilt(Math.random() * 10, Math.random() * 360));
			}
		}
	} else{
		parent = leafObject.clone();
	}

	return parent;
}


function Graphics() {
	//Setting up scene
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
	camera.position.set(0, 0, 5);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	var scene = new THREE.Scene();


	//Size of branch in relation to parent
	var branchScale = 0.7;

	//Creates a single 'stickObject' (cylinder) to build the tree out of
	var brown = new THREE.MeshLambertMaterial( {color: 0x49311C} );
	var geometry = new THREE.CylinderGeometry( branchScale * 0.1, 0.1, 1, 12, 1, false );
	geometry.translate(0, 0.5, 0);
	var cylinder = new THREE.Mesh( geometry, brown );

	var green = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	geometry = new THREE.BoxGeometry( 0.5, 1, 0.001 );
	geometry.translate(0, 0.5, 0);
	var leaf = new THREE.Mesh( geometry, green );



	//Building tree and adding it to the scene
	var tree = getTree(7, cylinder, leaf, branchScale);
	tree.position.y -= 1.5;
	scene.add( tree );
	console.log(count);

	//Setting up lighting
	var light = new THREE.AmbientLight( 0x606060, 0.01 );
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.01 );
	directionalLight.rotation.x -= 35;
	directionalLight.rotation.y += 35;
	scene.add( directionalLight );
	scene.add( light );

	var sunGeometry = new THREE.SphereGeometry( .2, 16, 16 );
	var sunLight = new THREE.PointLight( 0xffd800, 1, 100, 1.1 );
	var sunMaterial = new THREE.MeshStandardMaterial( {
		emissive: 0xffffee,
		emissiveIntensity: 1,
		color: 0x000000
	});

	sunLight.add( new THREE.Mesh( sunGeometry, sunMaterial ));
	sunLight.position.set( 2, 0, 0 );
	sunLight.translateY( 3 );
	//sunLight.castShadow = true;
	scene.add( sunLight );

	


	//add mouse control
	var controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', function() { renderer.render(scene, camera); } );

	//Animation Loop
	var count = 0;
	var self = this;
	var t = 0;
	Graphics.prototype.animate = function() {
		requestAnimationFrame( self.animate );
		renderer.render( scene, camera );
		//tree.rotation.y += 0.003;

		t += 0.01;
		light.intensity = Math.sin(t);
		sunLight.position.x = 3*Math.cos(t) + 0;
	  sunLight.position.y = 3*Math.sin(t) + 0

		// count++;
		// tree.scale.set(1 + count/10000.0, 1 + count/10000.0, 1 + count/10000.0);
	}
}
