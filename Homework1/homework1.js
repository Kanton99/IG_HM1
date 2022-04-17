"use strict";

var canvas;
var gl;

var numPositions  = 0;

var positions = [];
var colors = [];

var table;

var angle_input;

var iAxis = vec3();
var iPoint = vec3();

var modelViewLoc;
var modelViewMatrix = mat4();
var modelViewRotAngles = vec3();
var modelViewMove = vec4();

var perspectiveLoc;
var perspectiveMatrix;
var fovy = 45;
var aspect;
var zNear;
var zFar;
init();

function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    aspect = canvas.width/canvas.height
    //colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    table = new Table(gl);
    table.init(program);
    numPositions += table._numPositions;

    perspectiveMatrix = perspective(fovy,aspect,zNear,zFar);
    modelViewMatrix = mult(translate(0,0,-4),modelViewMatrix);

    perspectiveLoc = gl.getUniformLocation(program, "perspectiveMatrix");
    //gl.uniformMatrix4fv(perspectiveLoc, false, flatten(perspectiveMatrix));

    modelViewLoc = gl.getUniformLocation(program,"modelViewMatrix");
    //table.transform = mult(translate(0,0,3),table.transform);

    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // var colorLoc = gl.getAttribLocation( program, "aColor" );
    // gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    // gl.enableVertexAttribArray( colorLoc );

    // var vBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    // var positionLoc = gl.getAttribLocation(program, "aPosition");
    // gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(positionLoc);

    //event listeners for buttons
    var input_angle = document.createElement("div");
    input_angle.insertAdjacentText("beforeend","angle of rotation: ");
    angle_input = document.createElement("input");
    angle_input.setAttribute("type","number");
    angle_input.setAttribute("size","1px");
    angle_input.defaultValue = 0;
    input_angle.appendChild(angle_input);
    document.body.appendChild(input_angle);

    var input_axis = document.createElement("div");
    input_axis.insertAdjacentText("beforeend","axis of rotation: ");
    for(var i = 0;i<3;++i){
        iAxis[i] = (document.createElement("input"));
        iAxis[i].setAttribute("type","number");
        iAxis[i].defaultValue = 0;
        input_axis.appendChild(iAxis[i]);
    }
    document.body.appendChild(input_axis);

    var input_point = document.createElement("div");
    input_point.insertAdjacentText("beforeend","centre of rotation: ");
    for(var i = 0;i<3;++i){
        iPoint[i] = (document.createElement("input"));
        iPoint[i].setAttribute("type","number");
        iPoint[i].defaultValue = 0;
        input_point.appendChild(iPoint[i]);
    }
    document.body.appendChild(input_point);

    var viewControls = document.createElement("div");
    var cameraMove = document.createElement("div");
    cameraMove.insertAdjacentText("beforeend","move camera");
    viewControls.appendChild(cameraMove);
    for(var i = 0;i<3;i++){
        modelViewMove[i] = document.createElement("input");
        modelViewMove[i].setAttribute("type","range");
        modelViewMove[i].setAttribute("min","-0.1");
        modelViewMove[i].setAttribute("max","0.1");
        modelViewMove[i].setAttribute("step","0.01");
        modelViewMove[i].defaultValue=0;
        cameraMove.appendChild(modelViewMove[i]);
    }

    var cameraRot = document.createElement("div");
    cameraRot.insertAdjacentText("beforeend","rotate camera");
    viewControls.appendChild(cameraRot);
    for(var i = 0;i<3;i++){
        modelViewRotAngles[i] = document.createElement("input");
        modelViewRotAngles[i].setAttribute("type","range");
        modelViewRotAngles[i].setAttribute("min","-1");
        modelViewRotAngles[i].setAttribute("max","1");
        modelViewRotAngles[i].setAttribute("step","0.1");
        modelViewRotAngles[i].defaultValue=0;
        cameraRot.appendChild(modelViewRotAngles[i]);
    }

    document.body.appendChild(viewControls);

    var boundingControls = document.createElement("div");
    boundingControls.insertAdjacentText("beforeend","bounding box controls: ");
    zNear = document.createElement("input");
    zNear.setAttribute("type","number");
    zNear.defaultValue = 0.1;
    zNear.step = 0.1;
    boundingControls.appendChild(zNear);

    zFar = document.createElement("input");
    zFar.setAttribute("type","number");
    zFar.defaultValue = 10;
    zFar.step = 0.1;
    boundingControls.appendChild(zFar);
    document.body.appendChild(boundingControls);
    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = mult(translate(parseFloat(modelViewMove[0].value),parseFloat(modelViewMove[1].value),parseFloat(modelViewMove[2].value)),modelViewMatrix);
    modelViewMatrix = mult(rotateX(modelViewRotAngles[0].value),modelViewMatrix);
    modelViewMatrix = mult(rotateY(modelViewRotAngles[1].value),modelViewMatrix);
    modelViewMatrix = mult(rotateZ(modelViewRotAngles[2].value),modelViewMatrix);
    gl.uniformMatrix4fv(modelViewLoc,false,flatten(modelViewMatrix));

    perspectiveMatrix = perspective(fovy,aspect,parseFloat(zNear.value),parseFloat(zFar.value));
    gl.uniformMatrix4fv(perspectiveLoc, false, flatten(perspectiveMatrix));

    var angle = parseFloat(angle_input.value);
    var axis = vec3(parseFloat(iAxis[0].value),parseFloat(iAxis[1].value),parseFloat(iAxis[2].value));
    var point = vec3(parseFloat(iPoint[0].value),parseFloat(iPoint[1].value),parseFloat(iPoint[2].value));
    table.rotateAround(angle,axis,point);
    table.render();
    gl.drawArrays(gl.TRIANGLES, 0, table.numPositions);
    requestAnimationFrame(render);
}
