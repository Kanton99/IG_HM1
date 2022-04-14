//////////////////////
// Table
/////////////////////

class Table extends Entity{

    constructor(gl){
        super(gl);
        
        var scale = vec3(0.5,0.1,0.5);
        var position = vec3(0,0.5,0);
        this.make_cube(0,scale,position);

        scale = vec3(0.1,0.5,0.1);
        position = vec3(-0.4,0,-0.4);
        this.make_cube(8,scale,position);
        
        scale = vec3(0.1,0.5,0.1);
        position = vec3(-0.4,0,0.4);
        this.make_cube(16,scale,position);

        scale = vec3(0.1,0.5,0.1);
        position = vec3(0.4,0,-0.4);
        this.make_cube(24,scale,position);

        scale = vec3(0.1,0.5,0.1);
        position = vec3(0.4,0,0.4);
        this.make_cube(32,scale,position);
    }

    
}