//////////////////////
// Table
/////////////////////

class Table extends Entity{

    constructor(gl){
        super(gl);
        //this.gen_vertices();
        this.verticies = []
        //main surface
        var matr = mat4();
        matr[0][0] = matr[1][1] = matr[2][2] = matr[3][3] =
        this.make_cube(0,mat);
        
    }

    make_cube(offset,modMatrix){
        var verts = [
            vec4(-1, -1,  1, 1.0),
            vec4(-1,  1,  1, 1.0),
            vec4(1,  1,  1, 1.0),
            vec4(1, -1,  1, 1.0),
            vec4(-1, -1, -1, 1.0),
            vec4(-1,  1, -1, 1.0),
            vec4(1,  1, -1, 1.0),
            vec4(1, -1, -1, 1.0)
        ];
        for(var i = 0;i<verts.length;++i){
            var vert = mult(modMatrix,verts[i]);
            this.verticies.push(vert);
        }
        this.make_quad(offset+1, offset+0, offset+3, offset+2);
        this.make_quad(offset+2, offset+3, offset+7, offset+6);
        this.make_quad(offset+3, offset+0, offset+4, offset+7);
        this.make_quad(offset+4, offset+5, offset+6, offset+7);
        this.make_quad(offset+6, offset+5, offset+1, offset+2);
        this.make_quad(offset+5, offset+4, offset+0, offset+1);


    }

}