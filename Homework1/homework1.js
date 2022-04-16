"use strict";

var canvas;
var gl;

var numPositions  = 0;

var positions = [];
var colors = [];

var table;

var angle_input;

var iAxis = [];
var iPoint = [];
init();

function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

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

    var fovy = 45;
    var aspect = canvas.width/canvas.height;
    var zNear = 0.1;
    var zFar = 100;
    var perspectiveMatrix = perspective(fovy,aspect,zNear,zFar);
    var modelViewMatrx = mult(translate(0,0,-4),mat4());

    var perspectiveLoc = gl.getUniformLocation(program, "perspectiveMatrix");
    gl.uniformMatrix4fv(perspectiveLoc, false, flatten(perspectiveMatrix));

    var modelViewLoc = gl.getUniformLocation(program,"modelViewMatrix");
    gl.uniformMatrix4fv(modelViewLoc,false,flatten(modelViewMatrx));
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
        iAxis.push(document.createElement("input"));
        iAxis[i].setAttribute("type","number");
        iAxis[i].defaultValue = 0;
        input_axis.appendChild(iAxis[i]);
    }
    iAxis[1].defaultValue = 1;
    document.body.appendChild(input_axis);

    var input_point = document.createElement("div");
    input_point.insertAdjacentText("beforeend","centre of rotation: ");
    for(var i = 0;i<3;++i){
        iPoint.push(document.createElement("input"));
        iPoint[i].setAttribute("type","number");
        iPoint[i].defaultValue = 0;
        input_point.appendChild(iPoint[i]);
    }
    document.body.appendChild(input_point);
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
    var angle = parseFloat(angle_input.value);
    var axis = vec3(parseFloat(iAxis[0].value),parseFloat(iAxis[1].value),parseFloat(iAxis[2].value));
    var point = vec3(parseFloat(iPoint[0].value),parseFloat(iPoint[1].value),parseFloat(iPoint[2].value));
    table.rotateAround(angle,axis,point);
    table.render();
    gl.drawArrays(gl.TRIANGLES, 0, table.numPositions);
    requestAnimationFrame(render);
}
