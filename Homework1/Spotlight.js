class Spotlight{
    constructor(opening = 10){
        this._position = vec4();
        this._position[3] = 1;
        this._opening = opening;
        this._direction = vec4(),
        this._direction[2] = this._direction[3] = 1;
        this._color = vec4();
    }

    get transform(){
        return this._transform;
    }

    render(gl, program){
        var lightPosLoc = gl.getUniformLocation(program, "lightPos");
        gl.uniform4fv(lightPosLoc,flatten(this._position));
        var lightDirLoc = gl.getUniformLocation(program, "lightDirection");
        gl.uniform4fv(lightDirLoc,flatten(this._direction));
        var lightOpeningLoc = gl.getUniformLocation(program, "angle");
        gl.uniform1f(lightOpeningLoc,this._opening);
        
        var lightColorLoc = gl.getUniformLocation(program, "lightColor");
        gl.uniform4fv(lightColorLoc,flatten(this._color));
    }
    get position(){return this._position;}
    set position(position){this._position = position;}
    
    get opening(){return this._opening;}
    set opening(degree){this._opening = degree;}

    get direction(){return this._direction;}
    set direction(direction){this._direction = (direction);this._direction[3]=1;}

    get color(){return this._color;}
    set color(color){this._color = color}
}