var basicColors=[
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(1.0, 1.0, 1.0, 1.0),   // white
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
]
class Entity{
    constructor(gl){
        this.gl = gl;
        this._transform = mat4();
        this.verticies = [];
        this.triangles = [];
        this.positions = [];
        this.vertColors = [];
        this.normals = [];
        this._numPositions=0;
        this.buffers;
        this.rotationMatrixLoc;
    }

    init(program){
        //this.gen_normals();
        //gl.useProgram(program);
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertColors), gl.STATIC_DRAW);

        var colorLoc = gl.getAttribLocation( program, "aColor" );
        gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( colorLoc );

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.positions), gl.STATIC_DRAW);
        
        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        this.rotationMatrixLoc = gl.getUniformLocation(program, "objectMatrix");
        gl.uniformMatrix4fv(this.rotationMatrixLoc, false, flatten(this._transform));
    }

    render(){ 
        gl.uniformMatrix4fv(this.rotationMatrixLoc, false, flatten(this._transform));
        gl.drawArrays(gl.TRIANGLES, 0, table.numPositions);
    }
    make_triangle(a,b,c){
        this.triangles.push([a,b,c]);
        this.positions.push(this.verticies[a]);
        this.positions.push(this.verticies[b]);
        this.positions.push(this.verticies[c]);

        var an = this.verticies[a];
        var bn = this.verticies[b];
        var cn = this.verticies[c];
        var ab = add(an,negate(bn));
        var ac = add(an,negate(cn));
        var normal = vec4(normalize(cross(ac,ab)));
        this.normals.push(normal);
        this.normals.push(normal);
        this.normals.push(normal);

        var color = normal;
        for(var i = 0;i<4;i++){
            if(color[i] < 0){
                color[0] = 1+color[0];
                color[1] = 1+color[1];
                color[2] = 1+color[2];
                break;
            }
        }
        color[3] = 1;
        console.log(color);
        // this.vertColors.push(basicColors[a%8]);
        // this.vertColors.push(basicColors[a%8]);
        // this.vertColors.push(basicColors[a%8]);
        this.vertColors.push(color);
        this.vertColors.push(color);
        this.vertColors.push(color);

        this._numPositions+=3;
    }

    //top left, top right, bot right, bot left
    make_quad(a,b,c,d){
        this.make_triangle(a,b,c);
        this.make_triangle(a,c,d);
    }

    update(){
        for(var i = 0;i<this.verticies.length;++i){
            mult(this._transform,this.verticies[i]);
        }
    }

    get transform(){
        return this._transform;
    }

    set transform(m){
        this._transform = m;
        this.update();
    }

    get numPositions(){
        return this._numPositions;
    }
}