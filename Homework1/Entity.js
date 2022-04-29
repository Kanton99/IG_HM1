class Entity{
    constructor(){
        this._transform = mat4();
        this._verticies = [];
        this.triangles = [];
        this.positions = [];
        this.vertColors = [];
        this.normals = [];
        this._numPositions=0;
        
        this._material = new Material();
        this._texture = new Texture();
    }

    init(gl, program){
        this.calculateNormals();
        this.gen_textCoods();

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.positions), gl.STATIC_DRAW);
        
        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(this.normals),gl.STATIC_DRAW);

        var normalLoc = gl.getAttribLocation(program,"aNormal");
        gl.vertexAttribPointer(normalLoc,4,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(normalLoc);
        
        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(this._texture._textCoords),gl.STATIC_DRAW);

        var textureLoc = gl.getAttribLocation(program,"aTextureCoord");
        gl.vertexAttribPointer(textureLoc,2,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(textureLoc);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._texture._texture);
        gl.uniform1i(gl.getUniformLocation(program,"sampler1"),1);
    }

    update(gl){ 
        gl.uniformMatrix4fv( gl.getUniformLocation(program, "objectMatrix"), false, flatten((this._transform)));
        //gl.drawArrays(gl.TRIANGLES, 0, this.numPositions);
    }
    make_triangle(a,b,c){
        this.triangles.push([a,b,c]);
        this.positions.push(this._verticies[a]);
        this.positions.push(this._verticies[b]);
        this.positions.push(this._verticies[c]);

        this._numPositions+=3;
    }

    //top left, top right, bot right, bot left
    make_quad(a,b,c,d){
        this.make_triangle(a,b,c);
        this.make_triangle(a,c,d);
    }

    gen_textCoods(){
        for(var i = 0;i<this.positions.length/4;i++){  
            this._texture._textCoords.push(vec2(0,0));
            this._texture._textCoords.push(vec2(0,1));
            this._texture._textCoords.push(vec2(1,1));

            this._texture._textCoords.push(vec2(0,0));
            this._texture._textCoords.push(vec2(1,1));
            this._texture._textCoords.push(vec2(1,0));

        }
    }

    get transform(){return this._transform;}
    set transform(m){this._transform = m;}

    get numPositions(){return this._numPositions;}

    make_cube(offset, scale, position){
        scale = mult(this._transform,vec4(scale));
        var _scale = mat4();
        _scale[0][0] *= scale[0];
        _scale[1][1] *= scale[1];
        _scale[2][2] *= scale[2];

        var _position = translate(position[0],position[1],position[2]);
        for(var x = -1;x<2;x+=2) for(var y = -1;y<2;y+=2) for(var z = -1;z<2;z+=2){
            var vertex = vec4(x,y,z,1);
            vertex = mult(_scale,vertex);
            vertex[3] = 1;
            vertex = mult(_position,vertex);
            vertex[3] = 1;
            this._verticies.push(vertex);
        }
        /* 
        -1 -1 -1 -0
        -1 -1  1 -1
        -1  1 -1 -2
        -1  1  1 -3
         1 -1 -1 -4
         1 -1  1 -5
         1  1 -1 -6
         1  1  1 -7
        */ 

        this.make_quad(offset+2,offset+6,offset+4,offset+0); //front
        this.make_quad(offset+6,offset+7,offset+5,offset+4); //right
        this.make_quad(offset+7,offset+3,offset+1,offset+5); //back
        this.make_quad(offset+3,offset+2,offset+0,offset+1); //left
        this.make_quad(offset+3,offset+7,offset+6,offset+2); //top
        this.make_quad(offset+0,offset+4,offset+5,offset+1); //bottom
    }

    rotateAround(angle, axis, point){
        if(equal(axis,vec3(0,0,0)) || angle == 0) return this.transform;
        axis = normalize(axis);
        var translation =  translate(point[0],point[1],point[2]);
        this.transform = mult(translation,this.transform);
        var rotation = rotate(angle,axis);
        this.transform = mult(rotation,this.transform);
        this.transform = mult(inverse(translation),this.transform);
    }

    calculateNormals(){
        var normals = [];
        var l = this.triangles.length;
        for(var i = 0;i<l;++i){
            var a = this._verticies[this.triangles[i][0]];
            var b = this._verticies[this.triangles[i][1]];
            var c = this._verticies[this.triangles[i][2]];
            a = (vec3(a[0],a[1],a[2]));
            b = (vec3(b[0],b[1],b[2]));
            c = (vec3(c[0],c[1],c[2]));
            var ab = (subtract(b,a));
            var ac = (subtract(c,a));
            var normal = vec4(negate(normalize(cross(ac,ab))));
            normals.push((normal));
            normals.push((normal));
            normals.push((normal));
        }

        this.normals = normals;
    }

    get material(){return this._material;}
    set material(material){this._material = material;}

    get verticies(){return this._verticies;}

    get texture(){return this._texture;}
    texture(gl, image){this._texture.loadTexture(gl, image);}
}