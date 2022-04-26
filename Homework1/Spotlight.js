class Spotlight{
    constructor(opening = radians(10)){
        this._position = vec4();
        this._position[3] = 1;
        this._opening = opening;
        this._direction = vec4();
        this._attenuation = 0;

        this.ambient = this.diffuse = this.specular = vec4();
    }

    render(gl, program){
        var lightPosLoc = gl.getUniformLocation(program, "lightPos");
        gl.uniform4fv(lightPosLoc,flatten(this._position));
        var lightDirLoc = gl.getUniformLocation(program, "lightDirection");
        gl.uniform4fv(lightDirLoc,flatten(this._direction));
        var lightOpeningLoc = gl.getUniformLocation(program, "angle");
        gl.uniform1f(lightOpeningLoc,this._opening);
        gl.uniform1f(gl.getUniformLocation(program,"attenuationFactor"),this._attenuation);
    }
    
    get position(){return this._position;}
    set position(position){this._position = position;}
    
    get opening(){return this._opening;}
    set opening(degree){this._opening = radians(degree);}

    get direction(){return this._direction;}
    set direction(direction){this._direction = vec4(normalize(vec3(direction)));}

}