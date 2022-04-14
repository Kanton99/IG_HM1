//////////////////////
// Table
/////////////////////

class Table extends Entity{

    constructor(gl){
        super(gl);
        //this.gen_vertices();
        this.verticies = [
            //Top square
            vec4(-0.5, 0.4,  0.5, 1.0),
            vec4(-0.5,  0.5,  0.5, 1.0),
            vec4(0.5,  0.5,  0.5, 1.0),
            vec4(0.5, 0.4,  0.5, 1.0),//3

            vec4(-0.5, 0.4, -0.5, 1.0),
            vec4(-0.5,  0.5, -0.5, 1.0),
            vec4(0.5,  0.5, -0.5, 1.0),
            vec4(0.5, 0.4, -0.5, 1.0),//7
            //front left leg
            vec4(-0.5,-0.5,-0.5,1),
            vec4(-0.4,-0.5,-0.5,1),
            vec4(-0.4,0.4,-0.5,1),
            vec4(-0.5,-0.5,-0.4,1),//11
            vec4(-0.5,0.4,-0.4,1),
            vec4(-0.4,0.4,-0.4,1),
            vec4(-0.4,-0.5,-0.4,1),
            // front right leg
            vec4(0.5,-0.5,-0.5,1),//15
            vec4(0.4,-0.5,-0.5,1),
            vec4(0.4,0.4,-0.5,1),
            vec4(0.5,-0.5,-0.4,1),
            vec4(0.5,0.4,-0.4,1),//19
            vec4(0.4,0.4,-0.4,1),
            vec4(0.4,-0.5,-0.4,1)

        ]
        //main surface
        this.make_quad(1, 0, 3, 2);
        this.make_quad(2, 3, 7, 6);
        this.make_quad(3, 0, 4, 7);
        this.make_quad(6, 5, 1, 2);
        this.make_quad(4, 5, 6, 7);
        this.make_quad(5, 4, 0, 1);
        //front left leg
        this.make_quad(4,10,9,8);
        this.make_quad(4,8,11,12);
        this.make_quad(13,14,9,10);
        this.make_quad(13,12,11,14);
        this.make_quad(8,9,14,11);
        //front right leg
        this.make_quad(17,7,15,16);
        this.make_quad(4,8,11,12);
        //this.make_quad(13,14,9,10);
        //this.make_quad(13,12,11,14);
        //this.make_quad(8,9,14,11);
    }

}