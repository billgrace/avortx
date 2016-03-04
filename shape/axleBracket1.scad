/* axleBracket1.scad
 A simple U bracket to hold an axle
*/

thickness = 0.5;
width = 10;
length = 5;
axleElevation = 10;
hubRadius = 1.5;

translate([0,0,-thickness/2])
	cube([length, width, thickness], center=true);
translate([0,(width/2 - thickness/2),0])
	leg();
translate([0,-(width/2 - thickness/2),0])
	leg();

module leg() {
	rotate([90,0,0])
		rotate([0,0,-90])
			difference() {
				union() {
					translate([axleElevation,0,0])
						cylinder(r=hubRadius, h=thickness, center=true, $fn=32);
					translate([axleElevation/2,0,0])
						cube([axleElevation, length, thickness], center=true);
				}
				translate([1,5,0])
					rotate([0,0,-6.3401975])
						cube([20, 5, thickness*2], center=true);
				translate([1,-5,0])
					rotate([0,0,6.3401975])
						cube([20, 5, thickness*2], center=true);
			}
}