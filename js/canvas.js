/**
 * "3D" Cube on a 2D Canvas
 * 
 * This is a simple demo of how to draw a 3D cube on a 2D canvas using WPP.
 * It uses a weak perspective projection and rotation matrices.
 * 
 * The cube and tiles (squares) can be rotated around the x and y axes using the 'w', 'a', 's', 'd' keys.
 * The cubeand tiles (squares) can be rotated around the z axis using the 'q' and 'e' keys.
 * 
 * 
 * Author: @FreddyFlamingo 
 */

document.addEventListener("DOMContentLoaded", function() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var squareSize = 50; // Size of each square
    var cubeSize = 16; // Size of each cube
    var squares = []; // To store the positions of the squares
    var currentTargetSquareIndex = 0; // To store the index of the target square 

    var rotating = false; // Wether to rotate camera or not

    // View settings
    var twoAndHalfDimensions = false;
    var twoDimensions = false;
    var threeDimensions = true;

    // Camera settings
    var fov = 500; // Field of view or focal length
    var xAngle = 0; // Rotation around x-axis in radians
    var yAngle = 0; // Rotation around y-axis in radians
    var zAngle = 0; // Rotation around z-axis in radians
    
    // Function for dimetric projection with a 2:1 pixel ratio ('2.5D')
    function dimetricProjection(point) {
        return {
            x: (point.x - point.y) * Math.sqrt(3) / 2,
            y: (point.x + point.y) / 2 - point.z
        };
    }
    
    // Function for perspective projection
    function perspectiveProjection(point) {
        var d = fov; // Distance from viewer to screen
        
        return {
            x: point.x * d / (d + point.z),
            y: point.y * d / (d + point.z),
            z: point.z
        };
    }
    
    // Function to draw all squares
    function drawSquares() {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        var currentCenterX = window.innerWidth / 2;
        var currentCenterY = window.innerHeight / 2;
        
        // Draw all squares
        squares.forEach(function(square) {
            var vertices = [
                { x: square.relativeX - squareSize / 2, y: square.relativeY - squareSize / 2, z: 0 }, // Top left
                { x: square.relativeX + squareSize / 2, y: square.relativeY - squareSize / 2, z: 0 }, // Top right
                { x: square.relativeX + squareSize / 2, y: square.relativeY + squareSize / 2, z: 0 }, // Bottom right
                { x: square.relativeX - squareSize / 2, y: square.relativeY + squareSize / 2, z: 0 }, // Bottom left
            ];
            
            var edges = [
                [0, 1], [1, 2], [2, 3], [3, 0]
            ];
            
            // Draw the square
            context.beginPath();
            if (square.color) {
                context.fillStyle = square.color;
            } else { 
                context.fillStyle = 'rgba(255, 255, 255, 1)';
            }
            
            // Apply bird's eye view to each corner of the square
            if (twoDimensions === true) {
                context.moveTo(vertices[0].x + currentCenterX, vertices[0].y + currentCenterY);
                for (var i = 1; i <= vertices.length; i++) {
                    var point = vertices[i % vertices.length];
                    context.lineTo(point.x + currentCenterX, point.y + currentCenterY);
                }
            }
            
            // Apply dimetric projection to each corner of the square
            if (twoAndHalfDimensions === true) {
                vertices = vertices.map(p => dimetricProjection(p));
                
                context.moveTo(vertices[0].x + currentCenterX, vertices[0].y + currentCenterY);
                for (var i = 1; i <= vertices.length; i++) { 
                    var point = vertices[i % vertices.length];
                    context.lineTo(point.x + currentCenterX, point.y + currentCenterY);
                }
            }
            
            // Apply perspective view to each corner of the square
            if (threeDimensions === true) {
                // Apply roll effect to each vertex
                vertices = vertices.map(vertex => rotateZ(vertex, zAngle));
                for (var i = 0; i < vertices.length; i++) {
                    var point = perspectiveProjection(rotateXY(vertices[i], xAngle, yAngle));
                    
                    if (i === 0) {
                        context.moveTo(point.x + currentCenterX, point.y + currentCenterY);
                    } else {
                        context.lineTo(point.x + currentCenterX, point.y + currentCenterY);
                    }
                }
            }
            
            context.closePath();
            context.fill();
            context.stroke();
        });
        
        // Draw the cube on the current target square
        var targetSquare = squares[currentTargetSquareIndex];
        var projectedCenter;
        
        if (twoAndHalfDimensions) {
            projectedCenter = dimetricProjection({
                x: targetSquare.relativeX,
                y: targetSquare.relativeY,
                z: 0
            });
        } else if (twoDimensions) {
            // In bird's eye view, use the square's position directly
            projectedCenter = {
                x: targetSquare.relativeX,
                y: targetSquare.relativeY,
                z: 0
            };
        }
        
        drawCube(currentCenterX, currentCenterY, cubeSize);
        if (rotating) {
            var rotationAmount = Math.PI / 180 * 5; // Rotate 5 degrees
            xAngle += rotationAmount;
            yAngle += rotationAmount;
            setTimeout(drawSquares, 40);
        }
    }
    
    // Function to draw a cube
    function drawCube(centerX, centerY, sideLength) {
        var targetSquare = squares[currentTargetSquareIndex];
        var halfSide = sideLength / 2;

        // Define vertices
        var vertices = [
            { x: targetSquare.relativeX -halfSide , y: targetSquare.relativeY -halfSide, z: -halfSide }, // 0: Back top left
            { x: targetSquare.relativeX + halfSide, y: targetSquare.relativeY -halfSide, z: -halfSide },  // 1: Back top right
            { x: targetSquare.relativeX + halfSide, y: targetSquare.relativeY + halfSide, z: -halfSide },   // 2: Back bottom right
            { x: targetSquare.relativeX -halfSide, y: targetSquare.relativeY + halfSide, z: -halfSide },  // 3: Back bottom left
            { x: targetSquare.relativeX -halfSide, y: targetSquare.relativeY -halfSide, z: halfSide },  // 4: Front top left
            { x: targetSquare.relativeX + halfSide, y: targetSquare.relativeY -halfSide, z: halfSide },   // 5: Front top right
            { x: targetSquare.relativeX + halfSide, y: targetSquare.relativeY + halfSide, z: halfSide },    // 6: Front bottom right
            { x: targetSquare.relativeX -halfSide, y: targetSquare.relativeY + halfSide, z: halfSide }    // 7: Front bottom left
        ];
        
        // Edges of the cube
        var edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

         // Faces of the cube
         var faces = [
            [0, 1, 2, 3], // Back face
            [1, 5, 6, 2], // Right face
            [5, 4, 7, 6], // Front face
            [4, 0, 3, 7], // Left face
            [3, 2, 6, 7], // Top face
            [4, 5, 1, 0], // Bottom face
        ];

        // lift the cube up by half its height so that it sits on top of the square
        vertices = vertices.map(vertex => {
            return {
                x: vertex.x,
                y: vertex.y,
                z: vertex.z + halfSide + 1
            };
        });
        
        // Apply z-axis rotation to the vertices
        vertices = vertices.map(vertex => rotateZ(vertex, zAngle));
        
        for (var face of faces) {
            var p0 = perspectiveProjection(rotateXY(vertices[face[0]], xAngle, yAngle));
            var p1 = perspectiveProjection(rotateXY(vertices[face[1]], xAngle, yAngle));
            var p2 = perspectiveProjection(rotateXY(vertices[face[2]], xAngle, yAngle));
    
            var normal = crossProduct(
                [p1.x - p0.x, p1.y - p0.y, p1.z - p0.z],
                [p2.x - p0.x, p2.y - p0.y, p2.z - p0.z]
            );
    
            if (normal[2] < 0) {
                context.beginPath();
                context.moveTo(p0.x + centerX, p0.y + centerY);
                for (var i = 1; i < face.length; i++) {
                    var p = perspectiveProjection(rotateXY(vertices[face[i]], xAngle, yAngle));
                    context.lineTo(p.x + centerX, p.y + centerY);
                }
                context.closePath();
                context.stroke();
            }

            // Fill the face with a color
            context.fillStyle = 'rgba(0, 255, 255, 1)';
            context.fill();
        }
    }

    // Function to update and draw cube on a specific or new square
    function updateAndDrawCubeOnSquare(squareIndex, direction) {
        var targetSquare;
        
        if (squareIndex === -1) {
            // Calculate new square position based on the direction
            var currentSquare = squares[currentTargetSquareIndex];
            var newX = currentSquare.relativeX;
            var newY = currentSquare.relativeY;
            
            if (direction === 'left') newX -= squareSize;
            else if (direction === 'right') newX += squareSize;
            else if (direction === 'up') newY -= squareSize;
            else if (direction === 'down') newY += squareSize;
            
            // Add new square if it does not exist
            if (!squareExistsAtPosition(newX, newY)) {
                addNewSquareAtPosition(newX, newY);
            }
            
            // Update the index to the new square
            currentTargetSquareIndex = squares.findIndex(sq => sq.relativeX === newX && sq.relativeY === newY);
        } else {
            currentTargetSquareIndex = squareIndex;
        }
        
        drawSquares(); // Redraw all squares and the cube
    }



    
    // Generate squares when the page is loaded
    function generateSquares() {
        // Always draw the first square in the center
        squares.push({ relativeX: 0, relativeY: 0 });
        
        // Generate a random number of additional squares. Min 9, Max 33
        var additionalSquares = Math.floor(Math.random() * 25) + 9;
        while (squares.length < additionalSquares + 1) {
            addAdjacentSquare();
        }
    }
    
    // Function to add a square adjacent to an existing square
    function addAdjacentSquare() {
        var adjacentPositions = [
            { dx: -squareSize, dy: 0 }, // Left
            { dx: squareSize, dy: 0 },  // Right
            { dx: 0, dy: -squareSize }, // Above
            { dx: 0, dy: squareSize },  // Below
            { dx: -squareSize, dy: -squareSize }, // Diagonal Top Left
            { dx: squareSize, dy: -squareSize },  // Diagonal Top Right
            { dx: -squareSize, dy: squareSize },  // Diagonal Bottom Left
            { dx: squareSize, dy: squareSize }    // Diagonal Bottom Right
        ];
        
        var baseSquare = squares[Math.floor(Math.random() * squares.length)];
        var position = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
        var newRelativeX = baseSquare.relativeX + position.dx;
        var newRelativeY = baseSquare.relativeY + position.dy;
        
        // Check if the new position is already occupied
        var isOccupied = squares.some(function(square) {
            return square.relativeX === newRelativeX && square.relativeY === newRelativeY;
        });
        
        if (!isOccupied) {
            squares.push({ relativeX: newRelativeX, relativeY: newRelativeY });
        }
    }
    
    // Function to find the nearest square based on direction
    function findNearestSquare(currentSquare, direction) {
        var nearestSquareIndex = -1;
        var minDistance = Number.MAX_VALUE;
        
        squares.forEach(function(square, index) {
            var dx = square.relativeX - currentSquare.relativeX;
            var dy = square.relativeY - currentSquare.relativeY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance && distance > 0) {
                if (direction === 'left' && dx < 0 && Math.abs(dy) < squareSize) {
                    nearestSquareIndex = index;
                    minDistance = distance;
                } else if (direction === 'right' && dx > 0 && Math.abs(dy) < squareSize) {
                    nearestSquareIndex = index;
                    minDistance = distance;
                } else if (direction === 'up' && dy < 0 && Math.abs(dx) < squareSize) {
                    nearestSquareIndex = index;
                    minDistance = distance;
                } else if (direction === 'down' && dy > 0 && Math.abs(dx) < squareSize) {
                    nearestSquareIndex = index;
                    minDistance = distance;
                }
            }
        });
        
        return nearestSquareIndex;
    }
    
    // function to check if a square exists at a given position
    function squareExistsAtPosition(x, y) {
        return squares.some(function(square) {
            return square.relativeX === x && square.relativeY === y;
        });
    }
    
    // Function to add a new square at a given position
    function addNewSquareAtPosition(x, y) {
        squares.push({ relativeX: x, relativeY: y, color: 'red' }); // New square is red
    }
    


    // Function to rotate around the x-axis
    function rotateX(point, angle) {
        var cosX = Math.cos(angle);
        var sinX = Math.sin(angle);

        return {
            x: point.x,
            y: point.y * cosX - point.z * sinX,
            z: point.y * sinX + point.z * cosX
        };
    }
    
    // Function to rotate around the y-axis
    function rotateY(point, angle) {
        var cosY = Math.cos(angle);
        var sinY = Math.sin(angle);

        return {
            x: point.x * cosY + point.z * sinY,
            y: point.y,
            z: -point.x * sinY + point.z * cosY
        };  
    }

    // Function to rotate around the z-axis
    function rotateZ(point, angle) {
        var cosZ = Math.cos(angle);
        var sinZ = Math.sin(angle);

        return {
            x: point.x * cosZ - point.y * sinZ,
            y: point.x * sinZ + point.y * cosZ,
            z: point.z
        };
    }
    
    // Function to rotate a point around the x and y axes
    function rotateXY(point, angleX, angleY) {
        // Rotation matrices for X and Y
        var cosX = Math.cos(angleX);
        var sinX = Math.sin(angleX);
        var cosY = Math.cos(angleY);
        var sinY = Math.sin(angleY);

        return {
            x: cosY * point.x + sinY * point.z,
            y: cosX * point.y - sinX * (sinY * point.x - cosY * point.z),
            z: cosX * (sinY * point.x - cosY * point.z) + sinX * point.y
        };
    }

    // Translation function
    function translate(point, dx, dy) {
        return {
            x: point.x + dx,
            y: point.y + dy,
            z: point.z
        };
    }

    // Function to calculate the cross product
    function crossProduct(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    

    
    // Function to move the cube
    function keyBoardEvents(event) {
        var direction;
        var rotationAmount = Math.PI / 180 * 5; // Rotate 5 degrees
        
        if (event.key === 'ArrowLeft') {
            direction = 'left';
        } else if (event.key === 'ArrowRight') {
            direction = 'right';
        } else if (event.key === 'ArrowUp') {
            direction = 'up';
        } else if (event.key === 'ArrowDown') {
            direction = 'down';
        } else if (event.key === 'w') {
            xAngle -= rotationAmount;
        } else if (event.key === 'd') {
            yAngle += rotationAmount;
        } else if (event.key === 's') {
            xAngle += rotationAmount;
        } else if (event.key === 'a') {
            yAngle -= rotationAmount;
        } else if (event.key === 'q') {
            zAngle -= rotationAmount;
        } else if (event.key === 'e') {
            zAngle += rotationAmount;
        } else if(event.key === 'o') {
            if (!rotating){
                rotating = true;
                drawSquares();
            } 
        } else if (event.key === 'p') {
            rotating = false;
        }

        if (direction !== undefined) {
            var currentSquare = squares[currentTargetSquareIndex];
            var newIndex = findNearestSquare(currentSquare, direction);
            updateAndDrawCubeOnSquare(newIndex, direction);
        } else {
            if (!rotating){
                drawSquares();
            }
        }

    }

     // Function to resize the canvas to fill the browser window dynamically
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawSquares();
    }

    // Event listeners
    window.addEventListener('keydown', keyBoardEvents);
    window.addEventListener('resize', resizeCanvas);
    // Generate squares and then resize the canvas
    generateSquares();
    resizeCanvas();
}); 