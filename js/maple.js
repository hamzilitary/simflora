function rotateAndTilt(x, y) {
	return new THREE.Euler(x * Math.PI / 180, y * Math.PI / 180, 0, 'YXZ');
};

function MaplePart(parentPart) {
	this.childParts = [];
	this.timestamp = Date.now();
	this.group = new THREE.Group();
	this.mesh;

	this.terminalAge = 2;
	this.straight = true;
	this.lengthFactor = 1;
	this.widthFactor = 0.65;
	
	this.type = "";

	if (parentPart === undefined) {
		this.level = 1;
	} else {
		this.level = parentPart.level + 1;
		parentPart.group.add(this.group);
		var minAngle = parentPart.minAngle;
		var maxAngle = parentPart.maxAngle;
		this.group.quaternion.setFromEuler(rotateAndTilt(Math.random() * (maxAngle-minAngle) + minAngle, Math.random() * 360));
	};

	var material;
	var geometry;
	if (this.level === 1) {
		material = new THREE.MeshLambertMaterial( {color: 0xc4b99a} );
		geometry = new THREE.CylinderGeometry(.07, .1, 1, 3, 1, true );
		this.terminalAge = 5;
		this.numChildren = 5;
		this.minAngle = 25;
		this.maxAngle = 50;
		this.lengthFactor = 0.8;
		this.type = "trunk";

	} else if (this.level < 5) {

		material = new THREE.MeshLambertMaterial( {color: 0xc4b99a} );
		geometry = new THREE.CylinderGeometry(.07, .1, 1, 3, 1, true );
		this.numChildren = 3
		this.minAngle = 25;
		this.maxAngle = 65;
		this.type = "branch";

	} else if (this.level === 5) {

		material = new THREE.MeshLambertMaterial( {color: 0xc4b99a} );
		geometry = new THREE.CylinderGeometry(.07, .1, 1, 3, 1, true );
		this.numChildren = 3;
		this.straight = true;
		this.minAngle = 90;
		this.maxAngle = 90;
		this.widthFactor = 0.5;
		this.type = "twig";

	} else {
		material = new THREE.MeshLambertMaterial( {color: 0x992600} );
		geometry = new THREE.CylinderGeometry(.014, .04, 0.5, 3, 1, true );
		geometry.translate(0, 0.25, 0);
		this.stem = new THREE.Mesh(geometry, material);
		

		material = new THREE.MeshStandardMaterial( {color: 0x00ff00} );
		material.side = THREE.DoubleSide;
		
		geometry = new THREE.Geometry();
		
		geometry.vertices.push( new THREE.Vector3( 0, 24, 0 ) ); // 0
		geometry.vertices.push( new THREE.Vector3( 3, 18, 0 ) ); // 1
		geometry.vertices.push( new THREE.Vector3( 8, 20, 0 ) ); // 2
		geometry.vertices.push( new THREE.Vector3( 5, 14, 0 ) ); // 3
		geometry.vertices.push( new THREE.Vector3( 7, 10, 0 ) ); // 4
		geometry.vertices.push( new THREE.Vector3( 0, 11, 0 ) ); // 5
		
		geometry.vertices.push( new THREE.Vector3( -3, 18, 0 ) ); // 6
		geometry.vertices.push( new THREE.Vector3( -8, 20, 0 ) ); // 7
		geometry.vertices.push( new THREE.Vector3( -5, 14, 0 ) ); // 8
		geometry.vertices.push( new THREE.Vector3( -7, 10, 0 ) ); // 9

		geometry.faces.push( new THREE.Face3( 0, 4, 5 ) );
		geometry.faces.push( new THREE.Face3( 0, 5, 9 ) );
		geometry.faces.push( new THREE.Face3( 1, 2, 3 ) );
		geometry.faces.push( new THREE.Face3( 6, 8, 7 ) );
		
		geometry.scale(1.0 / 12.0, 1.0 / 18.0, 1.0 / 12.0);
		geometry.translate(0, -0.6, 0);

		// geometry = new THREE.Geometry();
		// geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		// geometry.vertices.push( new THREE.Vector3( -0.4, 0.2, 0.15 ) );
		// geometry.vertices.push( new THREE.Vector3( 0, 1, 0 ) );
		// geometry.vertices.push( new THREE.Vector3( 0.4, 0.2, 0.15 ) );

		// geometry.faces.push( new THREE.Face3( 0, 1, 2 ) ); // counter-clockwise winding order
		// geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );
		// geometry.translate(0, -0.5, 0);

		this.numChildren = 0;
		this.straight = false;
		this.type = "leaf";
		this.leafState = "grow";

	};
	geometry.translate(0, .5, 0);
	this.mesh = new THREE.Mesh(geometry, material);
	if (this.type === "leaf")
		this.mesh.add(this.stem);
	this.group.add(this.mesh);
};

MaplePart.prototype.update = function(time) {
	var age = (Date.now() - this.timestamp + 1)/1000;
	var growthFactor = Math.log(age / this.terminalAge + 1) / this.level;
	
	var heightFactor = this.lengthFactor;
	if (this.type === "leaf") {
		if (time.seasonRad > 5 * Math.PI / 4 && this.leafState === "grow") {
			this.leafState = "fall";
		} else if (time.seasonRad < (7 * Math.PI / 4) && time.leafState === "fall") {
			this.timestamp = Date.now();
			this.leafState = "grow"
		}
	}
		
	
	this.mesh.scale.set(growthFactor * this.widthFactor, growthFactor * heightFactor, growthFactor * this.widthFactor);
	

	if (this.straight) {
		this.childParts.push(new MaplePart(this));
		this.straight = false;
	};

	while (age > this.terminalAge && this.childParts.length < this.numChildren && this.level <= 7) {
		this.childParts.push(new MaplePart(this));
	};

	var self = this;
	self.childParts.forEach(function(childPart) {
		childPart.update(time);
		if (childPart.type === "leaf") {
			if (childPart.leafState === "grow" || true) {
				childPart.group.position.y = growthFactor * heightFactor;
			} else {
				
				childPart.group.position += childPart.group.localToWorld( new THREE.Vector3( 0, -1, 0 ) );
			}
		} else {
			childPart.group.position.y = growthFactor * heightFactor;
		}
	});
};