# Avortx shapes available as STL files in the 'shape' sub-directory

### Conventions for directions, dimensions and axes
We're working in Three.js so:
	+X is 'front'
	-X is 'rear'
	+Y is 'top'
	-Y is 'bottom'
	+Z is 'right'
	-Z is 'left'

We'll call an extent along the X axis "length", along the Y axis "height" and along the Z axis "width".

#### Square 'U' bracket with rounded legs
Filename: axleBracket1.stl
Essentially a sheet metal bracket. Three components: a rectangle base and two legs with fully rounded corners.
No holes in the legs because rendered axles will cover those but a real version of this part would have
holes through which an axle or bearing would pass.
The axle will be parallel to the Z axis.
The top (base) rectangle will be 5 mm in length and 10 mm in width.
The legs will match the base in length (5 mm) and extend down 10 mm to the center of the axle.
The legs will taper to about 3 mm in length with a 3 mm diameter circle centered on the axle.
The positioning point will be the center of the top surface of the base rectangle.
