// this was just made to test out some fun perspective math as i had the idea making the album art rotate around the mouse
// it has some visible perspective issues, but its not too noticible (atleast to other people, it bugs me)
// as you rotate it closer to flipping over, the inner elements start to squish to flatten out and lose a lot of perspective
// could possibly be fixed by adding a scaling offset based on how close to 90 & -90 degrees you are on each axis
// but thats a little too much effort and work for a small fun code project that im not optimizing that hard anyways
// it works for what it is

// NEVERMIND I BROKE LIKE HALF OF IT !!! HAHA!!! YES!!! im not fixing it

// click the card to change visual modes from one sided to double sided

// writing
// clamp(x, null, 90) [number, min, max]
// is way faster to write, read, and modify than
// if (x > 90) { 
//   x = 90;
// }
import clamp from "clamp";

const container = document.getElementById("container");
const boxrot = document.getElementById("thumbrot");
const boxbounds = document.getElementById("thumbnailbounds");

const box1 = document.getElementById("red");
const box2 = document.getElementById("orange");
const box3 = document.getElementById("yellow");
const box4 = document.getElementById("green");
const box5 = document.getElementById("blue");
const bg1 = document.getElementById("bg");

box1.style.zIndex = 0;
box2.style.zIndex = -1;
box3.style.zIndex = -2;
box4.style.zIndex = -3;
box5.style.zIndex = -4;
bg1.style.zIndex = -5;

const modeArray = ['onesided', 'doublesided'];
let mode = 0;
console.info(`mode is ${mode}, ${modeArray[mode]}`);

// cycles through array on click, affecting the way it renders the item
boxbounds.addEventListener("click", function() {
     // subtract 1 from length to account for the mode starting at 0 and the array starting at 1
    if (mode >= (modeArray.length-1)) {
        mode = 0;
    } else if (mode < modeArray.length) {
        mode++;
    } 
    console.debug(`array is ${modeArray.length-1} entries long`)
    console.info(`mode is ${mode}, ${modeArray[mode]}`);
    document.getElementById('modetext').innerText = modeArray[mode].toString();
});

function transformElement(x, y) {
    // get the bounding box of the div
    let boxboundsrect = boxbounds.getBoundingClientRect();

    // setting this lower increases, and higher decreases
    // affects depth and speed, so adjust accordingly
    let rotationSpeed = 5;

    // css uses rotations in "it rotates AROUND this axis not ON this axis" terms so its reversed
    // also x has to not be negative if i want it to point to my mouse
    let calcX = -(y - boxboundsrect.y - boxboundsrect.height / 2) / rotationSpeed;
    let calcY = (x - boxboundsrect.x - boxboundsrect.width / 2) / rotationSpeed;

    let calcYcor = -(y - boxboundsrect.y - boxboundsrect.width / 2);
    let calcXcor = -(x - boxboundsrect.x - boxboundsrect.height / 2);

    let calcXoffset = 0;
    let calcYoffset = 0;

    // console.log(parseInt(calcY/90), (Math.round(((calcY/90)/2))%2));

    // bools for reading if it is flipped
    let xFlip;
    let yFlip;

    // y axis (check comments at the top of the function for why)
    // if calcX is greater than 90 or less than -90 (flipping)
    if ((calcX > 90) || (calcX < -90)) {
        // if the result of the rounded calculated position is divided by 90 divided by 2 isnt even (modulus of 2), its flipped
        /// so that means it is showing the backside and not the front
        // math!
        if ( (Math.round(((calcX/90)/2))%2) !== 0 ) {
            // its flipped on the X axis
            yFlip = true;
            // show on debug menu
            document.getElementById('flipytext').innerText = 'true';
        } else {
            yFlip = false;
            document.getElementById('flipytext').innerText = 'false';
        }
    } else {
        // else
        // its not flipped on the Y axis
        yFlip = false;
        // show on debug menu
        document.getElementById('flipytext').innerText = 'false';
    }

    // x axis (check comments at the top of the function for why)
    // if calcY is greater than 90 or less than -90 (flipping)
    if ((calcY > 90) || (calcY < -90)) {
        // same as other axis
        // mathematical!
        if ( (Math.round(((calcY/90)/2))%2) !== 0 ) {
            // its flipped on the X axis
            xFlip = true;
            // show on debug menu
            document.getElementById('flipxtext').innerText = 'true';
        } else {
            xFlip = false;
            document.getElementById('flipxtext').innerText = 'false';
        }
    } else {
        // else
        // its not flipped on the X axis
        xFlip = false;
        // show on debug menu
        document.getElementById('flipxtext').innerText = 'false';
    }

    // toggling visual display stuff
    switch(mode) {
        case 0:
            // if both are differnet bool values, show flat color backside without depth
            // the card is flipped once (multiple of 90), and because of this we need to render the backside instead of the front side
            if (((xFlip == true) && (yFlip == false))||((xFlip == false) && (yFlip == true))) {
                // hide the drop shadow and inner elements
                box1.style.filter = `drop-shadow(rgba(0, 0, 0, 0) 0px 0px 0px)`;
                box2.style.display = 'none';
                box3.style.display = 'none';
                box4.style.display = 'none';
                box5.style.display = 'none';
                // change background to match the outer rim
                bg1.style.backgroundColor = 'red';

                // set translations to 0
                if ((calcX > 90) || (calcY > 90)) {
                    calcYcor = 0;
                    calcXcor = 0;
                }
            
                // again for other axis
                if ((calcX < -90) || (calcY <- 90)) {
                    calcYcor = 0;
                    calcXcor = 0;
                }
            } 
            // if both sides are false, that means the card hasnt rotated at all (or calc/90 is not even)
            // or if both sides are true, that means the card has rotated a total of 180 degrees (equal to or a multiple)
            // render the front side
            else if (((xFlip == true) && (yFlip == true))||((xFlip == false) && (yFlip == false))) {
                box1.style.filter = `drop-shadow(rgba(0, 0, 0, 0.15) 2px 2px 1px)`;
                box2.style.display = 'initial';
                box3.style.display = 'initial';
                box4.style.display = 'initial';
                box5.style.display = 'initial';
                bg1.style.backgroundColor = 'white';

                let fullRotationCountX = (360*(parseInt(calcY/270)));
                let fullRotationCountY = (360*(parseInt(calcX/270)));

                if (calcX > 90) {
                    calcYoffset = fullRotationCountY;
                } else if (calcX < -90) {
                    calcYoffset = fullRotationCountY;
                }
            
                if (calcY > 90) {
                    calcXoffset = -fullRotationCountX;
                } else if (calcY < -90){
                    calcXoffset = -fullRotationCountX;
                }
            }

            // console.log(calcXcor, (calcY/10));
            // console.log(parseInt(calcY/270));
            // console.log(Math.round(((calcX/90)/2))%2, Math.round(((calcY/90)/2))%2);

            // gets each item and translates it to match the perspective
            // dividing it by a number lowers the amount it moves
            let box2mult = 10;
            let box3mult = 6;
            let box4mult = 4;
            let box5mult = 3;
            
            let box2thingX = (((calcXcor/box2mult)-((calcXoffset)/box2mult)));
            let box2thingY = (((calcYcor/box2mult)-((calcYoffset)/box2mult)));
        
            let box3thingX = (((calcXcor/box3mult)-((calcXoffset)/box3mult)));
            let box3thingY = (((calcYcor/box3mult)-((calcYoffset)/box3mult)));
        
            let box4thingX = (((calcXcor/box4mult)-((calcXoffset)/box4mult)));
            let box4thingY = (((calcYcor/box4mult)-((calcYoffset)/box4mult)));
        
            let box5thingX = (((calcXcor/box5mult)-((calcXoffset)/box5mult)));
            let box5thingY = (((calcYcor/box5mult)-((calcYoffset)/box5mult)));
        
            boxrot.style.transform = `rotateX(${calcX}deg) rotateY(${calcY}deg)`;
            box2.style.transform = `translate(${box2thingX}px, ${box2thingY}px)`;
            box3.style.transform = `translate(${box3thingX}px, ${box3thingY}px)`;
            box4.style.transform = `translate(${box4thingX}px, ${box4thingY}px)`;
            box5.style.transform = `translate(${box5thingX}px, ${box5thingY}px)`;
            break

        case 1:
            // allat
            if (calcX > 90) {
                calcYcor = -calcYcor + (boxboundsrect.height*3);
            } else if (calcX < -90) {
                calcYcor = -calcYcor - (boxboundsrect.height*3);
            }
        
            if (calcY > 90) {
                calcXcor = -calcXcor - (boxboundsrect.width*3);
            } else if (calcY < -90){
                calcXcor = -calcXcor + (boxboundsrect.width*3);
            }
            
            boxrot.style.transform = `rotateX(${calcX}deg) rotateY(${calcY}deg)`;
            box2.style.transform = `translate(${calcXcor/10}px,${calcYcor/10}px)`;
            box3.style.transform = `translate(${calcXcor/6}px,${calcYcor/6}px)`;
            box4.style.transform = `translate(${calcXcor/4}px,${calcYcor/4}px)`;
            box5.style.transform = `translate(${calcXcor/3}px,${calcYcor/3}px)`;
            break
    }
}

// move mouse when it detects movement inside the entire container
// can be changed to just the actual card thing by changing container to boxbounds
container.addEventListener("mousemove", (e) => {
    window.requestAnimationFrame(function () {
        transformElement(e.clientX, e.clientY);
    });
});

// if the code above is set to boxbounds instead of container, uncomment this so it resets on the mouse leaving

// boxbounds.addEventListener("mouseleave", (e) => {
//     window.requestAnimationFrame(function () {
//         boxrot.style.transform = `rotateX(0) rotateY(0)`;
//         box2.style.transform = `translate(0px,0px)`;
//         box3.style.transform = `translate(0px,0px)`;
//         box4.style.transform = `translate(0px,0px)`;
//         box5.style.transform = `translate(0px,0px)`;
//     });
// });

