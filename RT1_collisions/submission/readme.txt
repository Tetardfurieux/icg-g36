Workload splitting: equal contributions


Ray-Plane Intersection
----------------------
This part was implemented using the course's formula for the intersection of a ray and a plane:
    t = dot(plane_center - ray_origin, plane_normal) / dot(ray_direction, plane_normal);
Where:
    t: the distance from the ray's origin to the intersection point along the ray's direction


Ray-Cylinder Intersection
----------------------
This part was implemented using a formula derived from the ray's parametric equation and the cylinder's parametric equation.
The equation is explained in the pdf file joined to this archive.


Problems encountered
--------------------
Debugging was pretty difficult especially for the second part since we did not find good ways to compute test values and 
the crash reports in the browser's console were not very detailed.
Computing the formula for the ray-cylinder intersection was also complex and we did not find many online resources to help us.
