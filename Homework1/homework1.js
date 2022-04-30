"use strict";

var canvas;
var gl;

var numPositions  = 0;

var positions = [];
var colors = [];

var program;
var program1;

var table;

var angle;

var iAxis = vec3();
var iPoint = vec3();

var modelViewLoc;
var modelViewMatrix = mat4();
var modelViewRotAngles = vec3();
var modelViewMove = vec3();
modelViewMove[3] = 1;

var perspectiveLoc;
var perspectiveMatrix;
var fovy = 45;
var aspect;
var zNear = 0.1;
var zFar = 10;
var buffer2, buffer3;

var spotlight;
var per_vertex = true;
var texture=true;
var blur = true;

var flag =true;
var frameBuffer;
var copyFrame;
var texture1;
var texture2;
var texture3;
var texture4;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0)
];

var vertices = [
    vec2(-1, -1),
    vec2(-1, 1),
    vec2(1, 1),
    vec2(1, 1),
    vec2(1, -1),
    vec2(-1, -1)
];
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
    program1 = initShaders(gl,"final-render-vertex","final-render-fragment");
    program = per_vertex_program;
    gl.useProgram(program);
    //#region Table setup
    table = new Table();
    table.material.ambient = vec4(1,1,1,1);
    table.material.diffuse = vec4(0.5,0.5,0.5,1);
    table.material.specular = vec4(1,1,1,1);
    table.material.shininess = 10;
    table.texture(gl,"woodTexture.png");
    table.init(gl, program);
    numPositions += table._numPositions;
    //#endregion
    
    //#region Spotlight setup
    spotlight = new Spotlight();
    spotlight.position = vec4(2,2,2,1);
    spotlight.direction = vec4(-1,-1,-1,1);
    spotlight.opening = 25;
    spotlight._attenuation = 1;

    spotlight.ambient = vec4(0.3,0.3,0.3,1);
    spotlight.diffuse = vec4(1,1,1,1);
    spotlight.specular = vec4(1,1,1,1);
    //#endregion
    
    perspectiveMatrix = perspective(fovy,aspect,zNear,zFar);
    modelViewMatrix = mult(translate(0,0,-4),modelViewMatrix);
    
    gl.uniform4fv(gl.getUniformLocation(program,"AmbientProduct"), flatten(mult(table.material.ambient,spotlight.ambient)));
    gl.uniform4fv(gl.getUniformLocation(program,"DiffuseProduct"),flatten(mult(table.material.diffuse,spotlight.diffuse)));
    gl.uniform4fv(gl.getUniformLocation(program,"SpecularProduct"),flatten(mult(table.material.specular,spotlight.specular)));
    gl.uniform1f(gl.getUniformLocation(program,"Shininess"),table.material.shininess);

    //#region Textures and Frame Buffers setup
    texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width, canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    texture3 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    texture4 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    frameBuffer.width = canvas.width;
    frameBuffer.height = canvas.height;

    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE) alert("Frame buffer not complete");


    gl.useProgram(program);
    //render to frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer);

    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER,depthBuffer);
    
    gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,canvas.width,canvas.height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    gl.enable(gl.DEPTH_TEST);

    renderScene();
    // send data to GPU for normal render
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.useProgram(program1);

    buffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( positionLoc );

    buffer3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer3);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation( program1, "aTexCoord");
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( texCoordLoc );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,texture1);
    gl.uniform1i( gl.getUniformLocation(program1, "newImage"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,texture2);
    gl.uniform1i( gl.getUniformLocation(program1, "oldImages[0]"), 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D,texture3);
    gl.uniform1i( gl.getUniformLocation(program1, "oldImages[1]"), 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D,texture4);
    gl.uniform1i( gl.getUniformLocation(program1, "oldImages[2]"), 3);


    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE) alert("Frame buffer not complete");
    //#endregion

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
        perspectiveMatrix = perspective(fovy,aspect,zNear,zFar);
    });
    document.querySelector("#zFar").addEventListener('input',(e)=>{
        zFar = parseFloat(e.target.value);
        perspectiveMatrix = perspective(fovy,aspect,zNear,zFar);
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
        gl.useProgram(program1);
    };

    document.querySelector("#disableTexture").onclick = function(){
        texture = !texture;
        table.texture(gl,(texture ? "woodTexture.png" : ""));
    }

    document.querySelector("#motionBlur").onclick = function(){
        blur = !blur;
    }
    //#endregion
    
    copyFrame = gl.createFramebuffer();
    render();
}

function render()
{
    copyTexture(texture3,texture4);
    copyTexture(texture2,texture3);
    copyTexture(texture1,texture2);

    //rendere new frame
    renderScene()


    //render effect
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(program1);

    gl.bindBuffer( gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( positionLoc );

    gl.bindBuffer( gl.ARRAY_BUFFER, buffer3);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation( program1, "aTexCoord");
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( texCoordLoc );

    //send texture for effect
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,texture1);
    gl.uniform1i( gl.getUniformLocation(program1, "newImage"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,texture2);
    gl.uniform1i( gl.getUniformLocation(program1, "oldImages[0]"), 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D,texture3);
    gl.uniform1i( gl.getUniformLocation(program1, "oldImages[1]"), 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D,texture4);
    gl.uniform1i( gl.getUniformLocation(program1, "oldImages[2]"), 3);

    gl.uniform1i(gl.getUniformLocation(program1,"blurEffect"),blur);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,6);

    requestAnimationFrame(render);
}

function update(){
    //#region camera change
    modelViewMatrix = mult(translate(modelViewMove[0],modelViewMove[1],(modelViewMove[2])),modelViewMatrix);
    modelViewMatrix = mult(rotateX(modelViewRotAngles[0]),modelViewMatrix);
    modelViewMatrix = mult(rotateY(modelViewRotAngles[1]),modelViewMatrix);
    modelViewMatrix = mult(rotateZ(modelViewRotAngles[2]),modelViewMatrix);
    //#endregion
    gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelViewMatrix"),false,flatten((modelViewMatrix)));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "perspectiveMatrix"), false, flatten((perspectiveMatrix)));

    var normalMatrix = (table.transform);
    var normalMatrixLoc = gl.getUniformLocation(program,"normalMatrix");
    gl.uniformMatrix4fv(normalMatrixLoc,false,flatten(normalMatrix));

    table.rotateAround(angle,iAxis,iPoint);
    table.update(gl);
    spotlight.update(gl,program);
    gl.uniform4fv(gl.getUniformLocation(program,"AmbientProduct"), flatten(mult(table.material.ambient,spotlight.ambient)));
    gl.uniform4fv(gl.getUniformLocation(program,"DiffuseProduct"),flatten(mult(table.material.diffuse,spotlight.diffuse)));
    gl.uniform4fv(gl.getUniformLocation(program,"SpecularProduct"),flatten(mult(table.material.specular,spotlight.specular)));
    gl.uniform1f(gl.getUniformLocation(program,"Shininess"),table.material.shininess);
}

function renderScene(){
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer)
    table.init(gl, program);
    update();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,table._numPositions);
}

function copyTexture(from, to){
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,null);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D,null);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D,null);
    gl.useProgram(program1);
    gl.bindFramebuffer(gl.FRAMEBUFFER,copyFrame);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, to, 0);

    gl.uniform1i(gl.getUniformLocation(program1,"blurEffect"),0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,from);
    gl.uniform1i( gl.getUniformLocation(program1, "newImage"), 0);

    gl.viewport(0,0,canvas.width,canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,6);
}
