"use strict";

var canvas;
var gl;

var numPositions  = 0;

var positions = [];
var colors = [];

var program;

var table;

var angle;

var iAxis = vec3();
var iPoint = vec3();

var modelViewLoc;
var modelViewMatrix = mat4();
var modelViewRotAngles = vec3();
var modelViewMove = vec4();
modelViewMove[3] = 1;

var perspectiveLoc;
var perspectiveMatrix;
var fovy = 45;
var aspect;
var zNear = 0.1;
var zFar = 10;


var spotlight;
var per_vertex = true;
var texture=true;
init();

function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    aspect = canvas.width/canvas.height

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var per_vertex_program = initShaders(gl, "per-vertex-vertex-shader", "per-vertex-fragment-shader");
    var per_fragment_program = initShaders(gl, "per-fragment-vertex-shader", "per-fragment-fragment-shader");
    program = per_vertex_program;
    gl.useProgram(program);

    table = new Table();
    table.init(gl, program);
    table.material.ambient = vec4(0.5,0.5,0.5,1);
    table.material.diffuse = vec4(1,1,1,1);
    table.material.specular = vec4(0.3,0.3,0.3,1);
    table.material.shininess = 27.8;
    table.texture(gl,"woodTexture.png");

    numPositions += table._numPositions;
    
    spotlight = new Spotlight();
    spotlight.position = vec4(1,1,1,1);
    spotlight.direction = vec4(-1,-1,-1,1);
    spotlight.opening = 25;
    spotlight._attenuation = 1;

    spotlight.ambient = spotlight.diffuse = vec4(1,1,1,1);
    spotlight.specular = vec4(1,1,1,1);

    perspectiveMatrix = perspective(fovy,aspect,zNear,zFar);
    modelViewMatrix = mult(translate(0,0,-4),modelViewMatrix);
    
    gl.uniform4fv(gl.getUniformLocation(program,"AmbientProduct"), flatten(mult(table.material.ambient,spotlight.ambient)));
    gl.uniform4fv(gl.getUniformLocation(program,"DiffuseProduct"),flatten(mult(table.material.diffuse,spotlight.diffuse)));
    gl.uniform4fv(gl.getUniformLocation(program,"SpecularProduct"),flatten(mult(table.material.specular,spotlight.specular)));
    gl.uniform1f(gl.getUniformLocation(program,"Shininess"),table.material.shininess);

    //event listeners for buttons
    //#region listeners
    document.querySelector('#rotation').addEventListener('input', (e)=>{
        angle = parseFloat(e.target.value);
    });
    document.querySelector("#axisX").addEventListener('input',(e)=>{
        iAxis[0]=parseFloat(e.target.value);
    });
    document.querySelector("#axisY").addEventListener('input',(e)=>{
        iAxis[1]=parseFloat(e.target.value);
    });
    document.querySelector("#axisZ").addEventListener('input',(e)=>{
        iAxis[2]=parseFloat(e.target.value);
    });

    document.querySelector("#centreX").addEventListener('input',(e)=>{
        iPoint[0]=parseFloat(e.target.value);
    });
    document.querySelector("#centreY").addEventListener('input',(e)=>{
        iPoint[1]=parseFloat(e.target.value);
    });
    document.querySelector("#centreZ").addEventListener('input',(e)=>{
        iPoint[2]=parseFloat(e.target.value);
    });

    document.querySelector("#cameraTX").addEventListener('input',(e)=>{
        modelViewMove[0]=parseFloat(e.target.value);
    });
    document.querySelector("#cameraTY").addEventListener('input',(e)=>{
        modelViewMove[1]=parseFloat(e.target.value);
    });
    document.querySelector("#cameraTZ").addEventListener('input',(e)=>{
        modelViewMove[2]=parseFloat(e.target.value);
    });
    document.querySelector("#cameraRX").addEventListener('input',(e)=>{
        modelViewRotAngles[0]=parseFloat(e.target.value);
    });
    document.querySelector("#cameraRY").addEventListener('input',(e)=>{
        modelViewRotAngles[1]=parseFloat(e.target.value);
    });
    document.querySelector("#cameraRZ").addEventListener('input',(e)=>{
        modelViewRotAngles[2]=parseFloat(e.target.value);
    });

    document.querySelector("#zNear").addEventListener('input',(e)=>{
        zNear = parseFloat(e.target.value);
    });
    document.querySelector("#zFar").addEventListener('input',(e)=>{
        zFar = parseFloat(e.target.value);
    });
    document.querySelector("#spotlightPX").addEventListener('input',(e)=>{
        spotlight._position[0]=parseFloat(e.target.value);
    });
    document.querySelector("#spotlightPY").addEventListener('input',(e)=>{
        spotlight._position[1]=parseFloat(e.target.value);
    });
    document.querySelector("#spotlightPZ").addEventListener('input',(e)=>{
        spotlight._position[2]=parseFloat(e.target.value);
    });
    document.querySelector("#spotlightDX").addEventListener('input',(e)=>{
        var oldDir = spotlight.direction;
        oldDir[0] = parseFloat(e.target.value);
        spotlight.direction = oldDir;
    });
    document.querySelector("#spotlightDY").addEventListener('input',(e)=>{
        var oldDir = spotlight.direction;
        oldDir[1] = parseFloat(e.target.value);
        spotlight.direction = oldDir;
    });
    document.querySelector("#spotlightDZ").addEventListener('input',(e)=>{
        var oldDir = spotlight.direction;
        oldDir[2] = parseFloat(e.target.value);
        spotlight.direction = oldDir;
    });
    document.querySelector("#spotlightAngle").addEventListener('input',(e)=>{
        spotlight.opening=parseFloat(e.target.value);
    });
    document.querySelector("#SpotlightAtt").addEventListener('input',(e)=>{
        spotlight._attenuation=parseFloat(e.target.value);
    });

    document.querySelector("#changeShader").onclick = function(){
        per_vertex = !per_vertex;
        if(per_vertex) program = per_vertex_program;
        else program = per_fragment_program;
        gl.useProgram(program);
        table.init(gl, program);
        gl.uniform4fv(gl.getUniformLocation(program,"AmbientProduct"), flatten(mult(table.material.ambient,spotlight.ambient)));
        gl.uniform4fv(gl.getUniformLocation(program,"DiffuseProduct"),flatten(mult(table.material.diffuse,spotlight.diffuse)));
        gl.uniform4fv(gl.getUniformLocation(program,"SpecularProduct"),flatten(mult(table.material.specular,spotlight.specular)));
        gl.uniform1f(gl.getUniformLocation(program,"Shininess"),table.material.shininess);
    };

    document.querySelector("#disableTexture").onclick = function(){
        texture = !texture;
        table.texture(gl,(texture ? "woodTexture.png" : ""));
    }
    //#endregion
    
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    spotlight.render(gl,program);

    modelViewMatrix = mult(translate(modelViewMove[0],modelViewMove[1],(modelViewMove[2])),modelViewMatrix);
    modelViewMatrix = mult(rotateX(modelViewRotAngles[0]),modelViewMatrix);
    modelViewMatrix = mult(rotateY(modelViewRotAngles[1]),modelViewMatrix);
    modelViewMatrix = mult(rotateZ(modelViewRotAngles[2]),modelViewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelViewMatrix"),false,flatten((modelViewMatrix)));

    perspectiveMatrix = perspective(fovy,aspect,zNear,zFar);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspectiveMatrix"), false, flatten((perspectiveMatrix)));

    var normalMatrix = (table.transform);
    var normalMatrixLoc = gl.getUniformLocation(program,"normalMatrix");
    gl.uniformMatrix4fv(normalMatrixLoc,false,flatten(normalMatrix));
    table.rotateAround(angle,iAxis,iPoint);
    table.render(gl);
    gl.drawArrays(gl.TRIANGLES, 0, table.numPositions);
    requestAnimationFrame(render);
}
