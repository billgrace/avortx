# AVORTX: A Virtual Online Robot Template eXerciser

## Version 0 is:
### Basic php user login functions taken from a YouTube video tutorial by Alex Garrett, "PHP OOP Login/Register System" in 23 tutorial videos.

His method gives us a simple MySQL database allowing reasonably secure user registration and login with no graphics - just simple text, entry boxes and functional classes and typical base pages (login, register, view profile, ...).
The database schema is named "avortx_db". The tables supporting user registration and login are "users", "users_session" and "user_groups".

We've incorporated those tables into the avortx database as:
### users:
1.**"db_id"** - auto-increment integer primary key for a happy database
2.**"login_name"** - (vchar20) the ID a with which a user logs in
3.**"password"** - (vchar64) a hash of the user's password and salt
4.**"salt"** - (vchar32) an additional safeguard for the password
5.**"full_name"** (vchar50) the user's full name
6.**"email_address"** (vchar255) an optional email for forgotten username and password recovery
7.**"register_date"** (datetime) when the user registered
8.**"user_group"** (int) the user's group type for permissions

### users_session:
1.**"db_id"** - auto-increment integer primary key for a happy database
2.**"user_id"** (int) a "remember me" logged in user's id integer from the "users" table
3.**"hash"* - varchar(64) a unique hash for the duration of this session

### user_groups:
1.**"db_id"** - auto-increment integer primary key for a happy database
2.**"group_name"** - (vchar20) the name of this group of users
3.**"permissions"** - (text) the jason string of an array of permissions for this group of users
- - - at present, there are two groups defined:
- "Standard user" with no permissions (id = 1)
- "Administrator" with permissions: {"admin":1,"moderator",1}
and all new registrants are assigned a 1 and we're not using that value anywhere...

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
1.**"backgrounds"** to define ground, sky and distant graphics as an enclosure for the track.
2.**"track_types"** to define attributes of the track that apply to the entire track.
3.**"track_layouts"** to define the layout of the track as a starting point/direction plus an arbitrary number of sections of track.

#### Background definitions include:
1.**"db_id"** - auto-increment integer primary key for a happy database
2.**"background_name"** - (vchar50) a user-friendly name by which the background can be known
3.**"author_name"** - (vchar50) the full_name of the user who created this background
4.**"shape_type"** - (vchar10) the shape of the background ( "cube" or "cylinder" )
5.**"shape_parameter_1, 2, 3, 4, 5, 6"** - (float) parameters defining the shape:

| type          | cube                       | cylinder                   |
|:-------------:|:--------------------------:|:--------------------------:|
| parameter 1   |  width (x, east/west extent)      |  radius                    |
| parameter 2   |  height (y, up/down extent)       |  height                    |
| parameter 3   |  depth (z, north/south extent)    |  number of radial segments |
| parameter 4   |  x, east/west offset       |  x, east/west offset       |
| parameter 5   |  y, up/down offset         |  y, up/down offset         |
| parameter 6   |  z, north/south offset     |  z, north/south offset     |
The "offset" parameters above allow the cube or cylinder to be placed anywhere using the Three.js x, y, z coordinates which is the same coordinate system as that used for the track origin point's location and starting direction. The offset values provided for a cube or cylinder place the center of that shape at the given x, y and z coordinates.
6.**"auto_locate_flag"** - (boolean) if this flag is true then the offset parameters are ignored and the background is centered horizontally at x = 0, z = 0 and placed vertically such that its bottom surface one track thickness below y = 0 (which is normally the bottom of the track).
7.**"image_filename_1, 2, 3, 4, 5, 6"** - (vchar100) image file names to be applied as textures to the background shape surfaces. These may be simply file names ( e.g. "flowers.jpg" ) or a string beginning with an exclamation point followed by a 6-digit hex rgb color specification ( e.g. "!ff0000" for red ). In the case of an image file, that file will be loaded as a texture for the Three.js material of the background. In the case of a color specification, that color will be specified for a MeshLambertMaterial for the background.

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
1.**"db_id"** - auto-increment integer primary key for a happy database
2.**"track_type_name"** - (vchar50) a user-friendly name by which the track type can be known
3.**"author_name"** - (vchar50) the full_name of the user who creates the track type
4.**"thickness"** - (float) distance from the top surface to the bottom surface of the track.
5.**"width"** - (float) distance between the left and right edges of the track.
6.**"small_piece_length"** - (float) every section of track (see track layouts below) has a given length. In order to render the track layout more smoothly, each section of track is divided into a number of "small pieces" which are then used to create the rendering meshes to display the track and the Cannon.js physics bodies to give the track substance. This parameter is made configurable as part of the track type definition because there comes a tradoff between smooth-looking track and rendering speed. The track designer may opt for a more complex track layout and still have a decent animation rate if the number of small pieces is decreased to balance a large number of track sections in the layout.
7.**"slope_match_angle"** - (float) the incremental angle used from one small piece to the next when smoothing the slope change from one track section to the next.
8.**"track_color"** - (vchar10) a string with 6 hex digits which will be passed to the Three.js material object to specify the color used to render the track pieces.
9.**"drag_point_radius"** - (float) the radius of a visible ball to show the motion of the drag point as its animated along the track.
10.**"drag_point_color"** - (vchar10) a string in the same format as "track_color" above but used as the color of the visible drag point ball.

#### Track_layout definitions include:
1.**"db_id"** - auto-increment integer primary key for a happy database
2.**"track_layout_name"** - (vchar50) a user-friendly name by which the track layout can be known
3.**"author_name"** - (vchar50) the full_name of the user who creates the track layout
4.**"track_layout_id"** - (int) each track layout will have multiple parts each of which will have an entry in this table. A given track layout will have a single track_layout_id and name shared among the various parts that make up the track.
5.**"section_sequence_number"** - (int) each part of a track layout will have a sequence number indicating where that part lies in the sequence of parts making up the layout.
6.**"section__type"** - (float) the type of this track part (**origin** location, starting **direction**, **straight** section, **right** curve section, **left** curve section )
7.**"section__parameter_1, 2, 3"** - (float) parameters defining the track part:

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
1) make a console that allows operator control over how things are happening
2) make a more general robot entity

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
But there's a very neat and straightforward way to handle it all in Three.js. You create a sort of "root" mesh that will be manipulated in terms of translation and rotation.... this could be the 'chassis' of the robot, say. Then, for wheels and everything else, the meshes for those sub-parts are created and then ADDED TO THE ROOT MESH instead of individually added to the scene (rootMesh.add(subMesh) and then scene.add(rootMesh) rather than scene.add(rootMesh) and scene.add(subMesh)). Using this procedure, any future manipulations of the position and rotation of the root mesh carry the sub meshes along because the positions and rotations of the sub meshes set that sub mesh's position and rotation WITH RESPECT TO THE ROOT MESH! Not only that, but you can make future manipulations to the sub mesh position and rotation and that will continue to apply only to the relative position and rotation of the sub mesh with respect to the root mesh (which can be doing all kinds of unrelated motion around the scene and carries the sub meshes along).
The beauty of it is that the rendering engine is doing all the heavy math and we programmers can concentrate on a position and rotation of the overall robot as things animate and, optionally, changes in relative positions and rotations of the sub meshes (such as wings flapping, wheels turning, ...).
Delightful!!!!!
### Here we pull the plug and declare an end to Version 2
We've got a not-too-bad set up for backgrounds, track layouts and track types. We've also got the ability to select among some very simple robots and motive power (drag point tracking or spring connection to drag point). We need to do some serious planning to get data structures for robots, meshes, bodies, physics relationships, etc.
### Version 3 will be about developing appropriate data structures

