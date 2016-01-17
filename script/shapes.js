/* shapes.js
	helpers for processing shapes
*/

function cylinderMeshUvForEndCapImages( mesh, numberOfImages ) {
	// adjust the faces and face uv's of a cylinder mesh to use two image files in a material made from a MeshFaceMaterial array:
	//	[0] is for the cylinder wall
	//	[1] is for the top cap
	//	[2] is for the bottom cap

	// For a normal cylinder, the first half of the faces array are the sidewall of the cylinder while the next quarter are the
	//	top cap and the final quarter the bottom cap.
	// After construction of a new cylinder geometry by THREE.JS, all of the faces are set to material index 0.
	// After construction of a new cylinder geometry by THREE.JS, the FaceUv's for the top and bottom cap are set
	//	to share the same image in a saw-tooth way - top cap triangles hanging down from the top and bottom cap
	//	triangles jutting up from the bottom.
	// This routine leaves the first half alone but traverses the last two quarters of the faces array and
	//	does two things for each face:
	//		1) sets the material index for the face (both to [1] for two-image and [1] and [2] for three-image)
	//		2) sets the Vector2 objects of the UVs to map a circle set in the end cap image

	// Thanks, Mr. Doob, for an easy routine to figure the UV values needed for the circles!

	// the numberOfImages parameter must be either 2 or 3
	numberOfImages = (numberOfImages == 2 ) ? 2 : 3;
	var numberOfFaces = mesh.geometry.faces.length;
	var halfNumberOfFaces = numberOfFaces / 2;
	var quarterNumberOfFaces = numberOfFaces / 4;
	// The first vertex will have x = 0, y = we don't care and z = the cylinderDiameter of the cylinder
	var cylinderRadius = mesh.geometry.vertices[0].z;
	var cylinderDiameter = 2 * cylinderRadius;
	for( var faceArrayIndex = halfNumberOfFaces; faceArrayIndex < ( halfNumberOfFaces + quarterNumberOfFaces ); faceArrayIndex++ ) {
		// we've now got an index starting in the second half of the faces array and running through a quarter of the array ( = top end cap )
		var topCapFaceIndex = faceArrayIndex;
		var bottomCapFaceIndex = topCapFaceIndex + quarterNumberOfFaces;
		// first set the face material index to the index of the desired image in the MeshFaceMaterial array
		mesh.geometry.faces[ topCapFaceIndex ].materialIndex = 1;
		if( numberOfImages == 2 ) {
			mesh.geometry.faces[ bottomCapFaceIndex ].materialIndex = 1;
		} else {
			mesh.geometry.faces[ bottomCapFaceIndex ].materialIndex = 2;
		}
		// then calculate the UV coordinates ('u' in mapping <=> 'x' in Vector2, 'v' <=> 'y')
		//	( the two-dimensional circular geometries for the two end caps are the same )
		var au = ( mesh.geometry.vertices[ mesh.geometry.faces[ topCapFaceIndex ].a ].x + cylinderRadius ) / cylinderDiameter;
		var av = ( mesh.geometry.vertices[ mesh.geometry.faces[ topCapFaceIndex ].a ].z + cylinderRadius ) / cylinderDiameter;
		var bu = ( mesh.geometry.vertices[ mesh.geometry.faces[ topCapFaceIndex ].b ].x + cylinderRadius ) / cylinderDiameter;
		var bv = ( mesh.geometry.vertices[ mesh.geometry.faces[ topCapFaceIndex ].b ].z + cylinderRadius ) / cylinderDiameter;
		var cu = ( mesh.geometry.vertices[ mesh.geometry.faces[ topCapFaceIndex ].c ].x + cylinderRadius ) / cylinderDiameter;
		var cv = ( mesh.geometry.vertices[ mesh.geometry.faces[ topCapFaceIndex ].c ].z + cylinderRadius ) / cylinderDiameter;
		// the "handed-ness" or "clockwise-ness" of the bottom cap is opposite to that of the top cap so
		//	we note that the 'c' vertex of both top and bottom cap faces corresponds to the center of their circles thus
		//	we reverse the 'a' and 'b' vertices for the bottom cap.
		//	(another way to look at it is that "out" means "up" for the top cap but "down" for the bottom cap)

		mesh.geometry.faceVertexUvs[ 0 ][ topCapFaceIndex ][ 0 ].x = au;
		mesh.geometry.faceVertexUvs[ 0 ][ bottomCapFaceIndex ][ 0 ].x = bu;
		mesh.geometry.faceVertexUvs[ 0 ][ topCapFaceIndex ][ 0 ].y = av;
		mesh.geometry.faceVertexUvs[ 0 ][ bottomCapFaceIndex ][ 0 ].y = bv;
		mesh.geometry.faceVertexUvs[ 0 ][ topCapFaceIndex ][ 1 ].x = bu;
		mesh.geometry.faceVertexUvs[ 0 ][ bottomCapFaceIndex ][ 1 ].x = au;
		mesh.geometry.faceVertexUvs[ 0 ][ topCapFaceIndex ][ 1 ].y = bv;
		mesh.geometry.faceVertexUvs[ 0 ][ bottomCapFaceIndex ][ 1 ].y = av;
		mesh.geometry.faceVertexUvs[ 0 ][ topCapFaceIndex ][ 2 ].x = cu;
		mesh.geometry.faceVertexUvs[ 0 ][ bottomCapFaceIndex ][ 2 ].x = cu;
		mesh.geometry.faceVertexUvs[ 0 ][ topCapFaceIndex ][ 2 ].y = cv;
		mesh.geometry.faceVertexUvs[ 0 ][ bottomCapFaceIndex ][ 2 ].y = cv;
	}
}

