# AVORTX: A Virtual Online Robot Template eXerciser

## Version 0 is:
### Basic php user login functions taken from a YouTube video tutorial by Alex Garrett, "PHP OOP Login/Register System" in 23 tutorial videos.

His method gives us a simple MySQL database allowing reasonably secure user registration and login with no graphics - just simple text, entry boxes and functional classes and typical base pages (login, register, view profile, ...).
The database schema is named "avortx_db". The tables supporting user registration and login are "users", "users_session" and "user_groups".

We've incorporated those tables into the avortx database as:
### users:
1. **"db_id"** - auto-increment integer primary key for a happy database
2. **"login_name"** - (vchar20) the ID a with which a user logs in
3. **"password"** - (vchar64) a hash of the user's password and salt
4. **"salt"** - (vchar32) an additional safeguard for the password
5. **"full_name"** (vchar50) the user's full name
6. **"email_address"** (vchar255) an optional email for forgotten username and password recovery
7. **"register_date"** (datetime) when the user registered
8. **"user_group"** (int) the user's group type for permissions

### users_session:
1. **"db_id"** - auto-increment integer primary key for a happy database
2. **"user_id"** (int) a "remember me" logged in user's id integer from the "users" table
3. **"hash"** - varchar(64) a unique hash for the duration of this session

### user_groups:
1. **"db_id"** - auto-increment integer primary key for a happy database
2. **"group_name"** - (vchar20) the name of this group of users
3. **"permissions"** - (text) the jason string of an array of permissions for this group of users
 - at present, there are two groups defined:
 - "Standard user" with no permissions (id = 1)
 - "Administrator" with permissions: {"admin":1,"moderator",1}
and all new registrants are assigned a 1 and we're not using that value anywhere...
(Note - Version 3 adds the group "Author" allowing creation and editing)

## Version 1 will be:
We'll expand the database by adding tables to support a track design/save/browse/select functionality using track definitions and rendering methods developed in the "rr" project.

### Track layout overview
The track is the basic "arena" for the robot template exerciser. It is conceptually similar to a child's toy race track or model train track in that it is made up of sections connected one after another. In this exerciser the track has sections that are either straight, curving to the right or curving to the left. Each section can also rise or fall vertically over its length. The track has no lateral slope so there's no "banking" in the curves (at least at this stage of development). Once a particular track layout - as a starting point and direction followed by a sequence of straight and curved sections - is established, a **"path"** is calculated that is a series of points along the middle of the top surface of the track. The first method of motive power for robots on this track is to be pulled along by a "drag point" that is animated to move from one of these path points to the next and is connected by an invisible spring to the robot.
To provide a visible "world" in which this track exists, there is a graphic background made up of a large cube or cylinder with graphic images or colors on its walls. The size of this background is large enough that the user will usually be inside it and see it as a surrounding "ground", "sky" and "horizon".
The starting location and direction for any given section of track is determined by the ending location and direction of the previous section.
A simple iterative alogorithm is used to gently "bend" sections of track as needed so that there won't be an overly abrupt change in slope from one section to the next.
There's no forced closure of the track layout. The expected usage is to have track layouts actually close - i.e. the end of the track will wind up at the same location and in the same direction as the origin point. This is not required to there may be some fooling around with open layouts on the part of adventurous users.

### A note on orientations
The rendering and physics engines (Three.js and Cannon.js) operate with the three traditional orthogonal axes x, y & z. We're sticking with the Three.js usage of these so that the "X" axis indicates left-right, the "Y" axis indicates up-down and the "Z" axis indicates closer-further as "seen" from the rendering camera in its typical starting position of "closer to the user than the center of things and slightly up from ground level". As a humane gesture toward the user, we'll also take +X as "west", -X as "east", +Y as "up", -Y as "down", +Z as "north" and -Z as "south". Because we're using the Three.js "orbit" method to allow the user to change his/her point of view, the horizontal compass directions tend to get spun this way and that but the up and down tend to remain fixed.

### A note on units
Users may be comfortable in English units (inches, feet, miles) or Metric units (millimeters, centimeters, meters, kilometers). Three.js doesn't place any interpretation on geometric length units. Cannon.js assumes the use of the MKS system (meters, kilograms, seconds). Robot kits and components tend to have sizes in millimeters and/or inches. Most people working in either English or Metric systems probably prefer angles in degrees rather than radians. As a humane gesture toward the programmer(s) of this facility, we'll keep all internal calculations and database items in millimeters and radians and then be as user-friendly as possible in allowing a choice of units from the user's point of view.

### Database details for background and tracks
#### The three new tables to define tracks and backgrounds are:
1. **"backgrounds"** to define ground, sky and distant graphics as an enclosure for the track.
2. **"track_types"** to define attributes of the track that apply to the entire track.
3. **"track_layouts"** to define the layout of the track as a starting point/direction plus an arbitrary number of sections of track.

#### Background definitions include:
1. **"db_id"** - auto-increment integer primary key for a happy database
2. **"background_name"** - (vchar50) a user-friendly name by which the background can be known
3. **"author_name"** - (vchar50) the full_name of the user who created this background
4. **"shape_type"** - (vchar10) the shape of the background ( "cube" or "cylinder" )
5. **"shape_parameter_1, 2, 3, 4, 5, 6"** - (float) parameters defining the shape:

| type          | cube                              | cylinder                   |
|:-------------:|:---------------------------------:|:--------------------------:|
| parameter 1   |  width (x, east/west extent)      |  radius                    |
| parameter 2   |  height (y, up/down extent)       |  height                    |
| parameter 3   |  depth (z, north/south extent)    |  number of radial segments |
| parameter 4   |  x, east/west offset              |  x, east/west offset       |
| parameter 5   |  y, up/down offset                |  y, up/down offset         |
| parameter 6   |  z, north/south offset            |  z, north/south offset     |

The "offset" parameters above allow the cube or cylinder to be placed anywhere using the Three.js x, y, z coordinates which is the same coordinate system as that used for the track origin point's location and starting direction. The offset values provided for a cube or cylinder place the center of that shape at the given x, y and z coordinates.

6. **"auto_locate_flag"** - (boolean) if this flag is true then the offset parameters are ignored and the background is centered horizontally at x = 0, z = 0 and placed vertically such that its bottom surface one track thickness below y = 0 (which is normally the bottom of the track).
7. **"image_filename_1, 2, 3, 4, 5, 6"** - (vchar100) image file names to be applied as textures to the background shape surfaces. These may be simply file names ( e.g. "flowers.jpg" ) or a string beginning with an exclamation point followed by a 6-digit hex rgb color specification ( e.g. "!ff0000" for red ). In the case of an image file, that file will be loaded as a texture for the Three.js material of the background. In the case of a color specification, that color will be specified for a MeshLambertMaterial for the background.

| type       | cube        | cylinder                |
|:----------:|:-----------:|:-----------------------:|
| filename 1 | west wall   | panoramic cylinder wall |
| filename 2 | east wall   | top of cylinder         |
| filename 3 | top wall    | bottom of cylinder      |
| filename 4 | bottom wall | (not used)              |
| filename 5 | north wall  | (not used)              |
| filename 6 | south wall  | (not used)              |

The UV mapping of the cylinder in Three.js takes the image file for the cylinder wall and rolls it nicely around the entire cylinder. The mapping for the top and bottom of the cylinder is not so tidy so we'll insert horizontal planes just under the top and just above the bottom of the cylinder and map the top and bottom images onto those. The planes will be square and just large enough to extend to the cylinder wall so the images on them will be seen from inside the cylinder as a circle cut from the center of the square image.

#### Track_type definitions include:
1. **"db_id"** - auto-increment integer primary key for a happy database
2. **"track_type_name"** - (vchar50) a user-friendly name by which the track type can be known
3. **"author_name"** - (vchar50) the full_name of the user who creates the track type
4. **"thickness"** - (float) distance from the top surface to the bottom surface of the track.
5. **"width"** - (float) distance between the left and right edges of the track.
6. **"small_piece_length"** - (float) every section of track (see track layouts below) has a given length. In order to render the track layout more smoothly, each section of track is divided into a number of "small pieces" which are then used to create the rendering meshes to display the track and the Cannon.js physics bodies to give the track substance. This parameter is made configurable as part of the track type definition because there comes a tradoff between smooth-looking track and rendering speed. The track designer may opt for a more complex track layout and still have a decent animation rate if the number of small pieces is decreased to balance a large number of track sections in the layout.
7. **"slope_match_angle"** - (float) the incremental angle used from one small piece to the next when smoothing the slope change from one track section to the next.
8. **"track_color"** - (vchar10) a string with 6 hex digits which will be passed to the Three.js material object to specify the color used to render the track pieces.
9. **"drag_point_radius"** - (float) the radius of a visible ball to show the motion of the drag point as its animated along the track.
10. **"drag_point_color"** - (vchar10) a string in the same format as "track_color" above but used as the color of the visible drag point ball.

#### Track_layout definitions include:
1. **"db_id"** - auto-increment integer primary key for a happy database
2. **"track_layout_name"** - (vchar50) a user-friendly name by which the track layout can be known
3. **"author_name"** - (vchar50) the full_name of the user who creates the track layout
4. **"track_layout_id"** - (int) each track layout will have multiple parts each of which will have an entry in this table. A given track layout will have a single track_layout_id and name shared among the various parts that make up the track.
5. **"section_sequence_number"** - (int) each part of a track layout will have a sequence number indicating where that part lies in the sequence of parts making up the layout.
6. **"section__type"** - (float) the type of this track part (**origin** location, starting **direction**, **straight** section, **right** curve section, **left** curve section )
7. **"section__parameter_1, 2, 3"** - (float) parameters defining the track part:

| type        | origin | direction | straight   | right  | left   |
|:-----------:|:------:|:---------:|:----------:|:------:|:------:|
| parameter 1 | X      | X         | rise       | rise   | rise   |
| parameter 2 | Y      | Y         | length     | radius | radius |
| parameter 3 | Z      | Z         | (not used) | angle  | angle  |

## User interface
Let's try to operate as a single page website where an initial background, track type and track layout are rendered and visible and then changes resulting from editing, choosing, creating simply happen immediately.

### Login / Register / Visit
When our page first loads into the browser and the user isn't already logged in via the "remember me" feature, we want to allow:

1. log in for those already registered
2. register for those who want to
3. visit for those who just want to look around without registering or logging in

We'll create a user group with no privileges (say, "guest") for those who are just visiting. Then things can operate in a more or less normal way to allow a guest to actually get a decent look at things. Just where we draw the line for privileges with guests we'll leave for a later time. To get started, we'll allow a guest to navigate around the track and background and maybe have a series of different backgrounds and tracks cycling slowly.

#### Registration and Log in
Registration and log in should operate pretty much the same as they do in the Garrett tutorial we started with except the labels and fields should be a bit more attractive and should be seen as items on the user's screen with the background, track and robot graphics behind them in full animation.

After successful registration, a user should be notified that it went OK and should be invited to now log in.

After a successful log in, a user should have nothing showing but the background/track/robot plus whatever clickable/touchable buttons there might be to allow changing anything. Just what buttons might be there to allow "changing anything" will be an ongoing design discussion. For starts, we'll just have:

1. "Logout" (maybe with an exit door graphic)
2. "configure" (maybe with a gear sprocket graphic)

A user who has logged in with the "remember me" box checked (and hasn't been away for longer than the expiration time that's set for being remembered) will immediately be at the same place as a user who has justed logged in.

### Background and track configuration

#### What should a user be able to do?
1. choose an existing background, track type, layout
2. create a new background, track type, layout
3. edit one of the user's own backgrounds, track types, layouts
4. fork/copy someone else's background, track type, layout and edit it
5. delete one of the user's own backgrounds, track types, layouts

---(temporal discontinuity as keys clack and mouses click)---

#### ..... OK, time to draw a line - we now have the ability to create, choose, edit and delete backgrounds, track types and track layouts. We've also got partial functionality that will eventually become administrator login allowing such editing and guest operation allowing choosing existing items and playing with things.

## Version 2 will be:
Now that we've got the background images and the track design in an operational - if primitive - condition, the goal is to introduce more about the robots.

Presently the "robot" is a sphere connected by a physics spring element to a moving drag point that animates along the track and pulls the sphere.

We have two main areas of development to do now:

1. make a console that allows operator control over how things are happening
2. make a more general robot entity

The console should look something like a typical remote control for a robot toy and be movable around the browser screen and maybe have selectable "skins" to allow some customization. It will need a set of classes that can implement controls which represent slide switches, joysticks, slide potentiometers - whatever such controller gadgets might want to have. As a particular robot is designed, the appropriate controls for the console will be part of that design.

The robot entities are the challenge here. Let's start with something not-too-challenging and see how things develop.

---(clicking, clacking, ...)---
## ( side note about THREE.JS and using images as 'textures' on mesh faces... )
OK, a deep dive into why image files on spheres and cubes look good but on cylinders look awful - if I don't write this down I won't remember it all and it will likely be useful again down the road.

Working on animating a cylinder to represent a robot wheel led to the point where REAL images were wanted for treads (the round wall - 'sidewall' - of the cylinder) and, well, call it hub caps and spokes (the flat circles - 'end caps' - of the cylinder).

The sidewall mapped nicely to the entire image file but the end caps were repeats of the same image distorted to fit into a circle.

Three.js makes renderable meshes out of triangular faces. The vertices of the triangles are the vertices of the mesh and are stored an array of Vector3 objects: Mesh.geometry.vertices[]. The face definitions are stored in a sibling array: Mesh.geometry.faces[]. These face definitions are an object THREE.Face3 which has nine members, four of which interest us here. The members 'a', 'b' and 'c' are integer indexes into the array of vertices to indicate the three particular vertices which make up the triangle of the face. The other item of interest to us here is 'materialIndex' and for now, we'll just tuck that name away and come back to it soon.

A third sibling array of interest is Mesh.geometry.faceVertexUvs[]. I don't yet know why this is an array - it only has a single member in my stuff so far - but that single member is also an array of the same size as the array of faces, i.e. there's an entry for each face of the mesh. Each item in THIS array is in turn an array of 3 items and each of those is a THREE.Vector2 object. Hang in there - this DOES actually make sense very soon.

If you stitch all this together the dots connect as so: For each vertex of each face of a mesh, there is a THREE.Vector2 object. The values of the 'x' and 'y' components of the Vector2 objects range from 0.0 to 1.0. If you take your image file and lay it flat on the desk, the lower left hand corner is x = 0, y = 0 and the upper left corner of the image is x = 0, y = 1 and the lower right corner is x = 1, y = 0 and the upper right corner is x = 1, y = 1.

Soooooo, the rendering engine takes each triangular face in the mesh and looks up the three Vector2 objects that correspond to the vertices of that triangle and locates those three points in the image file rectangle and maps THAT triangle of image file onto THAT triangle of mesh face.

Now, the tricky part about the cylinder..... The standard cylinder maps the faces of the cylinder wall very nicely to a rectangular image BUT it also maps the two end cap circles to that SAME rectangular image in an un-useful way. SO, we've added a script file ('shapes.js') that has a routine ('cylinderMeshUvForEndCapImages()') which accepts as arguments a cylinder mesh and an integer that can be set to 2 or 3. If the integer is 2 it means we've got two images being mapped to the cylinder and the two end caps share a single image. If the integer is 3, then we've got three images: one for the cylinder wall, one for the top end cap and one for the bottom end cap.

The routine traverses the array of face3 objects in the mesh and adjusts the "meshIndex" parameter to have the end cap faces specify the proper images. It also traverses the array of UV coordinates and adjusts them so that the end cap faces are mapped to the circle (if the image is square) or ellipse (if the image is rectangular) circumscribed in the image.
## ( side note about THREE.JS and the motion of a group of meshes... )
It turns out that Three.js does a wonderful thing with multiple meshes once you get the hang of the "right" way to use it!
Our application wants to have a robot scooting around a track or over a terrain and turn and twist appropriately. We also want to be able to make a robot up from any number of parts and have them all moving around in a realistic looking fashion.
This was beginning to look very grim as a collection of pieces and a lot of arbitrary rotation, translation, Eulers, quaternions, etc.
But there's a very neat and straightforward way to handle it all in Three.js. You create a sort of "root" mesh that will be manipulated in terms of translation and rotation.... this could be the 'chassis' of the robot, say. Then, for wheels and everything else, the meshes for those sub-parts are created and then ADDED TO THE ROOT MESH instead of individually added to the scene (rootMesh.add(subMesh) and then scene.add(rootMesh) rather than scene.add(rootMesh) and scene.add(subMesh)). Using this procedure, any future manipulations of the position and rotation of the root mesh carry the sub meshes along because the positions and rotations of the sub meshes set that sub mesh's position and rotation WITH RESPECT TO THE ROOT MESH! Not only that, but you can make future manipulations to the sub mesh position and rotation and that will continue to apply only to the relative position and rotation of the sub mesh with respect to the root mesh (which can be doing all kinds of    unrelated motion around the scene and carries the sub meshes along).
The beauty of it is that the rendering engine is doing all the heavy math and we programmers can concentrate on a position and rotation of the overall robot as things animate and, optionally, changes in relative positions and rotations of the sub meshes (such as wings flapping, wheels turning, ...).
Delightful!!!!!
### Here we pull the plug and declare an end to Version 2
We've got a not-too-bad set up for backgrounds, track layouts and track types. We've also got the ability to select among some very simple robots and motive power (drag point tracking or spring connection to drag point). We need to do some serious planning to get data structures for robots, meshes, bodies, physics relationships, etc.
### Version 3 will be about developing appropriate data structures

## Robot data structure
We'll want to be able to list and select robots just as we do with backgrounds and tracks. A robot object must be sufficiently complex to handle:

1. a variable number of parts making up the robot
2. all pertinent mechanical relationships between parts
  1. a part firmly attached to another part
  2. a wheel free to turn but on an axle fixed to another part
  3. two parts connected by a hinge
  4. universal joint between axle sections
  5. threaded rod turning in captured nut
  6. ..... doubtless many others .....
3. all pertinent energy flows between parts
  1. electrical from battery to motor, solenoid, led
  2. work done by force, torque
  3. exchanging kinetic and potential energy (this might better apply to the entire robot...)
4. all pertinent information flows between parts
  1. a datacomm link between the robot and the robot controller
  2. status information flowing from sensors
  3. control information flowing to actuators

Hhhmmmmmmm, this is a very ambitious list but lets give it a shot and see where we wind up.....

Lets try for a single table in the database to store robots - along the lines of track layouts where a given layout has multiple parts which are tied together by a common id number and ordered by a sequence number. Well, it might be better to have TWO tables: one for parts and another for the active relationships between them. Come to think of it, lets start off with one table for parts (including the seed) and separate tables for each kind of relationship.
The seed object will be assigned part number 0 and the next available unused integer will be assigned to each component part added to give direct access to any component by number.
Relationships can use the component part numbers to specify that a particular relationship is between component so-and-so and this-other-one.

### Robot seed object
Every robot will have an object containing all of its parts, functions and relationships. We'll call that primary object the robot "seed".
The seed will have a Three.js mesh, a Cannon.js body, a link to the robot controller and a list of component parts.

While the seed probably won't be visible most of the time, lets make it easy to visually orient so we can fall back to it when needed. It will be a small cube (2 mm) with visibly identifiable faces:

1. "Front" (+X) yellow (R+G)
2. "Rear" (-X) green (G)
3. "Top" (+Y) magenta (R+B)
4. "Bottom" (-Y) red (R)
5. "Right" (+Z) cyan (B+G)
6. "Left" (-Z) blue (B)

### Robot controller object
Every robot will have a controller, representing the hand held device one uses to manually operate a robot by radio link. The controller is a surface area on the browser page which will support a variety of controls and indicators such as sliders, joysticks, switches, meters and lights.
Custom skins may also be specified to give a controller a unique look.

## Animation
There are several aspects to animating the robot:

1. visible motion handled by Three.js render()
2. physics interactions handled by Cannon.js world.step()
3. arbitrary inter-component effects handled by script callback routines

Some examples to mull over -

### What we've done so far:

The current "Blue balloon" is a seed mesh of a featureless sphere. The seed body is connected by a physics spring to the drag point. As the script animates the drag point body along the track path, the spring moves the seed body and then the script copies the seed body position to the seed mesh position.

The current "Beach ball" is a seed mesh of a multicolored sphere. The seed body is ignored. Script moves the seed mesh position to a fixed distance behind the drag point and a fixed distance above the track path. Script also rotates the ball approximately the right amount to give the appearance of a ball rolling along the track.

The current "Lonely wheel" is almost the same as the beach ball except that it's a cylinder, not a sphere. In order for the cylinder to be in the right orientation for a wheel, it has to be rotated 90 degrees around the +X axis. This was no good when the cylinder was the seed mesh because the script that moved and oriented the seed mesh to follow the track path also reset that 90 degree rotation. The solution was to make a small, unseed seed mesh and then make the cylinder mesh a child of the seed mesh. Then the 90 degree rotation stayed in place as the script moved the robot along the track. The rolling-approximation rotation is applied to the cylinder without regard to the present position and orientation of the seed mesh and it seems to work fine.

The current "Flying cardboard" is a seed mesh of a featureless oblong which is animated by script the same as the beach ball and wheel except there's no rotation so it simply illustrates that the script animating the position and orientation of the seed mesh properly follows the track path through turns and hills.

The current "Winged cardboard" is the same seed mesh as the flying cardboard but has two sub-components which are just different colored oblongs on each side. These meshes of these wings are made children of the seed mesh and the three meshes move as a group when script animates the position and orientation of the seed mesh. ALSO - when script animates some +/- X axis rotation on the child meshes only (the 'wings') those rotations apply only to the child meshes and it's straightforward to 'flap' the wings as the whole assemblage moves along.

### What we want to do going forward:

We want a platform with a wheel on an axle where the axle is fixed to the bottom of the oblong and the wheel is free-wheel rolling along the track as the oblong is pulled along by the moving drag point. ("caster")

We want a platform with a motorized left wheel and a motorized right wheel where the controller has both a speed control and left-right control. The speed control sets the rotation speed of the wheels and the left-right control adds a speed differential to steer. There's a socketed ball as a tail or nose skid at the rear and the robot is on a flat terrain rather than a track.
We want to extend this to be a simulation of the line tracking mouse robot with light sensor logic and a terrain with a line to follow.

We want a platform with pincer arms extending out from the front. A control actuates a motor which turns a screw which opens and closes the pincers.

We want a platform with a camera pointing straight ahead and the video from that camera displays on a screen on the robot controller.

To implement these we'll need:

1. an axle and its mount that can attach to the bottom of a platform
2. a wheel that can spin around the axle
3. a motor/wheel assembly that can attach to the bottom of a platform
4. a data link from controls to the motor/wheel assemblies
5. a socketed ball that can attach to the bottom of a platform
6. physics to keep the wheels and ball from sinking through the terrain
7. script to figure seed motion due to the wheels
8. a pincer arm that can be fixed to the platform
9. another pincer arm hinged to the first one
10. a motor/screw assembly that can be anchored to one pincer and move the other one
11. script to figure pincer motion due to the screw
12. a camera mount component that can mount to a platform
13. a three.js camera object mounted in the camera mount
14. a video screen area on the controller
15. a video information link from the camera to a screen on the controller

Because the shapes built into Three.js are a bit limited, lets use Openscad to make the more complex shapes needed, export them as STL and use the Three.js STL loader script. We'll make new subdirectory called "shape" as a place to store the STL files.

Lets put another table in the database called "shapes" where we can store the file names and perhaps other useful information on a shape-per-record basis. This way we can have a simple list selection way to see the shapes along the same lines as now used for robots and track layouts.

There's a wrinkle in using the STL files because the loader is asynchronous - like the image loader for interesting textures. It's more of a problem than the image loader because a mesh can be made with the image loader and added to the scene and the image catches up later apparently without problem. For the STL loader, using it needs a callback function in which the loaded geometry is used to create a mesh and add the mesh to the scene. This isn't going to work very well for our multi-part robots where we want to have 'child' components with their own meshes being added to the mesh coming from the STL file....

We've got to find a way to do custom geometries that doesn't rely on such a loader.....

How's about we get more clever at using the built-in THREE.JS geometries:

1. Box
2. Circle (2D - can be made as any arc-subpart of a circle, too)
3. Cylinder (top & bottom radii can be different - allows cones and pyramids)
4. Plane (2D)
5. Ring (2D - a circle with a hole in it)
6. Sphere
7. Text (maybe....)
8. Torus

Maybe useful:
ExtrudeGeometry can 3D-ize any 2D path
LatheGeometry can rotate a path about an axis
ParametricGeometry (??? not entirely sure just what this is or if it might be useful...)
TubeGeometry - extrudes a circle along a 3D curve ..... maybe....

Probably NOT useful:
Dodecahedron, Icosahedron, Octahedron, Polyhedron (used to make the regulars listed - it's a generalized method), Tetrahedron, TorusKnot

I'd REALLY like to have a generalized wedge shape... maybe we can make our own script version of that as though there were a THREE.WedgeGeometry?

Aha & Eureka and the like! Three.js DOES have a generalized geometry facility in the form of Shape() which lets make a 2D path (on XY plane) and ExtrudeGeometry which allows us to take that 2D path and extrude it an arbitrary distance into a third dimension (Z axis).

OK, having made a caster robot - a base platform, a U-bracket attached under that platform, an axle attached to the U-bracket and a wheel on the axle - we find that animating the wheel requires us to reference the fourth generation child of the platform. This means we need to work out a way to define robots so that such access can be reasonably achieved from the anonymous context of a callback routine.

Fortunately, it turns out that we can also use the neat javascript feature of it being quite OK to add arbitrary elements to pre-defined objects so we can add whatever extra information we need as we build up the robot structure.

## Terrain
We've currently got race tracks with arbitrary layouts and animated drag points for robot activity. We need to add terrains that fill in the "floor" of the background to allow robots which can be steered to be steered without falling off the track.

We need to make:

1. a way to choose between using a terrain and using a track
2. a way to come up with a variety of terrains as we have with track layouts

Each robot will lend itself to one or more motive methods. Each motive method will dictate the allowability of track, terrain or both. The choice of a robot will therefore determine which choices will be available.

The list of motive methods so far amounts to:

1. Being pulled along a track by an invisible chain attached to the track's drag point (slot car mode)
2. Being pulled along a track by an invisible spring attached to the track's drag point (balloon mode)
3. Self propelled on wheels (rolling mode)
4. Self propelled on rotors (drone mode)

For methods 1 and 2, there will be track layouts.
For methods 3 and 4, there will be terrains.

For now lets simply ignore the possibility of robots with more than one motive method.

We'll want a few starting terrains:

1. Flat floor
2. Rolling hills
3. Jagged saw-tooth terrain

## Editing
We need to start adding the capability for users to edit/create their own stuff in here....

1. Track layouts
2. Robots
3. ??....

While anybody browsing to our site is welcome to play with what's there, editng tracks and robots will be restricted to logged in users having at least "author" rights. Anybody can register and become a "Standard User" but then a request must be sent to administration asking for upgrade to "Author" status.

### Editing track layouts
We'll have a single facility for track layout editing - to create a new track layout we need to enter the layout name and the starting location and have no sections in the layout.

To add a section to a layout, we choose "Add straight", "Add right" or "Add left" and enter rise plus length (straight) or radius and angle (curve). To start with we'll have numeric entry fields for rise, length, radius and angle but maybe later we can make it more directly graphic allowing layouts to be essentially "doodled" with the mouse/finger.

To delete or change a section, we'll have a single button "Change section" which will bring up a set of more detailed option buttons: "Delete section", "Change section type", "Increase/decrease rise", "Increase/decrease length" (straight section) or "Increase/decrease radius" and "Increase/decrease angle" (curves) and "Finished changing sections". Along with the detailed change buttons, the track rendering will be put into a "change mode" where raycasting will allow highlighting of any of the layout's sections. With any section hightlighted, clicking on any of the detailed change buttons will change that section. Clicking the "Finished" button will exit the "change mode".

The type of highlighted section will dictate the visibility of "length" vs. "radius/angle" buttons.
The type of highlighted section will also dictate the visibility of "change type to" buttons.

When a section is added/changed/deleted, the new layout configuration is immediately calculated and rendered so that the entire track can be seen right away.

If a section's type is changed from straight to curved or vice versa, then we'll convert properties as:

1. rise doesn't change
2. from straight to curve, radius is set to last-used radius (or a default value if there isn't a 'last' one to use)
3. from straight to curve, angle is set to make the linear extent of the curve match the length of the former straight given the radius
4. from curve to straight, length is set to radius * angle of the former curve

During editing, we also want buttons to allow selection of units. One pair of buttons will allow selection of degrees vs. radians. Another pair of buttons will allow selection of millimeters vs. inches. Script and database internal quantities will always be in radians and millimeters but user input and output will be converted to/from as needed.

For "Increase" and "Decrease" we'll use numeric entry fields a la "Add _______ to rise" paired with a button "Add".

### Editing robots

Creating or changing a robot configuration amounts to assembling pre-defined parts from the part library. The parts in the library are a mix of arbitrary parts and off-the-shelf parts.

Other than the robot root part, each part will physically attach to one or more other parts in a tree-ish structure so we define the following kinds of nodes:

1. root node is the single robot root which has zero or more child nodes but NO parent node
2. leaf node is any part which has no child nodes
3. branch node is any part which has both a parent node and one or more child nodes
4. relationship node is a part which has neither parent nor child but implements a relationship between other parts (such as a solenoid)

Each part will have rendering information so that it can be seen
Each part might have mechanical considerations
Each part might have electrical considerations
Each part might have informational considerations
Each part might have physics properties to support the part's behavior via Cannon.js
Each part might have call back routines to handle its various aspects during animation

#### Callback ordering considerations
Since we're animating a pseudo-reality here, we want to break down "call back" into categories which can be invoked in a sequence. Our goal is to attain a good level of realism while remaining within computational capabilities.

To simulate every aspect of energy flows and force interactions would be Cray material - not iPhone. SOOooooo.... lets make some unrealistic but pragmatic simplifications.

1. Motors and solenoids will step particular distances without regard to resistance (i.e. they're infinitely strong)
2. Batteries and motor controllers are required but are always fully charged and instantly obedient
3. Only the robot root part has mass
4. The root part body connects directly to wheel bottoms via vertical springs
5. Terrain robots will never have more than 3 wheels
6. Friction doesn't exist BUT robot wheels never slip
7. Drones will operate differently with a single under-surface for physics with the ground and mass vs. lift for motion

The order in which things must be evaluated at each animation step:

robot controller controls are sampled
robot controller control information is applied to robot parts (motors, solenoids)
positions of parts are updated 

1. evaluation of internal electrical energy expenditure (battery->motor, solenoid)
2. evaluation of internal forces generated by energy expenditure (wheel traction, solenoid force vector)
3. transmission of internal forces acting on robot parts
4. evaluation of external reactions to internally generated forces
5. evaluation of external forces acting on robot parts
6. transmission of external forces through robot part structure
7. application of external forces to any parts involved in Cannon.js physics stepping
8. the Cannon.js physics step call
9. update positions of parts that are affected by physics stepping
10. transmission of position updates through robot part structure
11. handling of new part positions on rendering considerations
12. the Three.js render call

.... not entirely sure how and where to work in potential vs. kinetic energy considerations here ..... does Cannon.js take care of that?

In addition to the categorical ordering above, we must also be sure to properly order the "transmission of blah throuth the robot parts" items in a proper sequence.

#### Some starting examples
Lets explore some typical parts and take a look....

1. A rigid piece of material:

  a. rendering

    1. a 3D shape of arbitrary complexity

  b. mechanical

    1. point(s) where it can be attached to another part
    2. point(s) where other parts can be attached to it
    3. it can transmit mechanical forces, torques and energies
    4. geometric relationships between attachment points

  c. electrical - nothing
  d. informational - nothing
  e. physics

    1. optional mass
    2. optional contact equation properties

  f. call back - none

2. A fixed-direction, free-spinning wheel:

  a. rendering

    1. a cylindrical wheel
    2. a cylindrical axle
    3. a mounting bracket of arbitrary shape

  b. mechanical

    1. places where the bracket mounts to a parent part
    2. transmission of left/right forces parallel to the axle
    3. support of weight

  c. electrical - nothing
  d. informational

    1. rotational position of the wheel with respect to the axle

  e. physics

    1. optional contact equation properties for the wheel

  f. call back

    1. set rotation of wheel mesh to visibly implement rolling

3. A freely-rotating, free-spinning wheel (i.e: a caster):

  a. rendering

    1. a cylindrical wheel
    2. a cylindrical axle
    3. an axle bracket of arbitrary shape
    4. a mounting bracket of arbitrary shape

  b. mechanical

    1. places where the bracket mounts to a parent part
    2. support of weight

  c. electrical - nothing
  d. informational

    1. rotational position of the axle bracket with respect to the mounting bracket
    2. rotational position of the wheel with respect to the axle

  e. physics

    1. optional contact equation properties for the wheel

  f. call back

    1. set rotation of axle bracket relative to mounting bracket
    2. set rotation of wheel mesh to visibly implement rolling

4. A motorized wheel

  a. rendering

    1. a cylindrical wheel
    2. a cylindrical axle
    3. a motor/gearbox of arbitrary shape

  b. mechanical

    1. places where the motor/gearbox mounts to a parent part
    2. support of weight
    3. motor/gearbox/wheel torque => tangential force where wheel contacts surface

  c. electrical

    1. power to the motor

  d. informational

    1. speed control to motor
    2. rotational position of wheel with respect to gearbox axle

  e. physics

    1. contact equation properties for wheel with surface

  f. call back

    1.

## CANNON.JS and THREE.JS considerations
The differences of opinion about the meaning of X, Y & Z between these two isn't as troublesome as it appears at first.
Three.js comes from the conceptual realm of animating things on a computer screen so it takes X to be "toward the right of the screen", Y to be "upward on the screen" and Z to be "closer to the observer".
Cannon.js comes from a more traditional classroom concept of X and Y being axes you'd draw on a sheet of paper on your desk with X pointing toward the right edge of the page, Y pointing toward the top edge of the page and Z pointing "up from the surface of the desk".
Cannon.js claims to be "agnostic concerning the meaning of axis directions" and that is apparently pretty much true.
So.....
#### Shapes and vectors
When it comes to creating and placing shapes they get along just fine. It appears to work just fine to copy position vectors and rotational quaternions from one to the other.
#### Gravity
When it comes to which way gravity points, they tend to disagree with Cannon saying "-Z" and Three saying "-Y". This needs to be taken into account.
#### Box geometry
A box is created in Three by passing it the three dimensions of the box. In Cannon, you pass in a 3-vector made up of each dimension divided by 2.
#### Plane geometry
A height field in Cannon is created by making an array of arrays. Each of the sub-arrays corresponds to an X-axis value and each element in a sub-array corresponds to a Y-axis value so you refer to a given vertex as "mainArray[ X ][ Y ]".
A plane geometry in Three is created by making a PlaneGeometry which has a single array of vertices. The length of this array of vertices is X * Y but Three steps along the X-axis as the smallest increment and bumps to the next Y-axis position as needed. So you reference a given vertex in Three as "mesh.geometry.vertices[ ( Y * sizeInTheXDirection ) + X ]".
Another little difference between the two is that the Three declaration takes X and Y size parameters as the number of SEGMENTS in the plane rather than the number of vertices. This means you have to pass it the size vertex count decremented by 1.
Both Cannon and Three make planes with a grid laying in the XY plane and "heights" in the Z direction so both of them need to be rotated -90 degrees around the X axis to get a terrain or floor rather than a funny vertical wall.

### Happy note!
Cannon.js has a pre-defined entity called "RaycastVehicle" which is intended to be a body/shape riding over a height field and has built in support for powered wheels being attached. This appears to be the way to go as far as a basic robot platform - the number of wheels and their location is freely configurable so we can probably go from a unicycle to a treaded tank with this.

#### Side note:
There being a mix of limit values to our collection of predefined control templates, they will now be unified so that full range on any control produces current values that range between 0.0 and 1.0.


# ****** AAARRGGHGHHHHH!!!! Hit a major snag-a-roo here....
My present target users (young kids in K-5th grade at a nearby school) have very limited access to the internet at home and at the school itself, they've got some old Dell's running Windows XP and the Internet Explorer old version that works in that OS. I downloaded Chrome there and even tried getting a cheap replacement computer (Raspberry Pi 2) but it doesn't really support WebGL so I find I've really got to make things work on older, slower machines running Canvas rendering rather than WebGL rendering.

I.E., it's got to be vastly simplified or it runs so slowly it might as well not be animated at all (I mean, 1 or 2 frames per second at BEST and freezing up sometimes....)

SOoooooo..... I'm going to git commit (as version 3) things as they stand - hoping to come back one day and carry on - and start off on a brand new, vastly simplified track.

