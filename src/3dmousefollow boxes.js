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
    let boxboundsrect = boxbounds.getBoundingClientRect();

    // css uses rotations in "it rotates AROUND this axis not ON this axis" terms so its reversed
    // also x has to not be negative if i want it to point to my mouse
    const calcX = -(y - boxboundsrect.y - boxboundsrect.height / 2) / 5;
    const calcY = (x - boxboundsrect.x - boxboundsrect.width / 2) / 5;

    let calcYcor = -(y - boxboundsrect.y - boxboundsrect.height / 2);
    let calcXcor = -(x - boxboundsrect.x - boxboundsrect.width / 2);

    switch(mode) {
        case 0:
            // bools for reading if it is flipped
            let xFlip;
            let yFlip;

            // if the multiple of 90 is even, it is flipped
            // math!

            // y axis
            if ((calcX > 90) || (calcX < -90)) {
            // if calc divided by 90 isnt even, keep going
                if ((parseInt(calcX/90)%2 !== 0)) {
                    xFlip = true;
                    if (document.getElementById('flipytext').innerText !== xFlip.toString()) {
                        document.getElementById('flipytext').innerText = xFlip.toString();
                    }
                }
            } else {
                xFlip = false;
                if (document.getElementById('flipytext').innerText !== xFlip.toString()) {
                    document.getElementById('flipytext').innerText = xFlip.toString();
                }
            }

            // x axis
            if ((calcY > 90) || (calcY < -90)) {
            // if calc divided by 90 isnt even, keep going
                if ((parseInt(calcY/90)%2 !== 0)) {
                    yFlip = true;
                    if (document.getElementById('flipxtext').innerText !== yFlip.toString()) {
                        document.getElementById('flipxtext').innerText = yFlip.toString();
                    }
                }
            } else {
                yFlip = false;
                if (document.getElementById('flipxtext').innerText !== yFlip.toString()) {
                    document.getElementById('flipxtext').innerText = yFlip.toString();
                }
            }

            // if both are differnet bool values, show backside without depth
            if ( ((xFlip == false) && (yFlip == true)) || ( (xFlip == true) && (yFlip == false) )) {
                box1.style.filter = `drop-shadow(rgba(0, 0, 0, 0) 0px 0px 0px)`;
                box2.style.display = 'none';
                box3.style.display = 'none';
                box4.style.display = 'none';
                box5.style.display = 'none';
                bg1.style.backgroundColor = 'red';

                if ((calcX > 90) || (calcY > 90)) {
                    calcYcor = 0;
                    calcXcor = 0;
                }
            
                if ((calcX < -90) || (calcY <- 90)) {
                    calcYcor = 0;
                    calcXcor = 0;
                }
            } 
            // if both are different values, do the parallax normally
            else if (((xFlip == false) && (yFlip == false)) || ((xFlip == true) && (yFlip == true))) {
                box1.style.filter = `drop-shadow(rgba(0, 0, 0, 0.15) 2px 2px 1px)`;
                box2.style.display = 'initial';
                box3.style.display = 'initial';
                box4.style.display = 'initial';
                box5.style.display = 'initial';
                bg1.style.backgroundColor = 'white';
                
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
            }

            // allat
            boxrot.style.transform = `rotateX(${calcX}deg) rotateY(${calcY}deg)`;
            box2.style.transform = `translate(${calcXcor/10}px,${calcYcor/10}px)`;
            box3.style.transform = `translate(${calcXcor/6}px,${calcYcor/6}px)`;
            box4.style.transform = `translate(${calcXcor/4}px,${calcYcor/4}px)`;
            box5.style.transform = `translate(${calcXcor/3}px,${calcYcor/3}px)`;
            break

        case 1:
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

container.addEventListener("mousemove", (e) => {
    window.requestAnimationFrame(function () {
        transformElement(e.clientX, e.clientY);
    });
});

boxbounds.addEventListener("mouseleave", (e) => {
    window.requestAnimationFrame(function () {
        boxrot.style.transform = `rotateX(0) rotateY(0)`;
        box2.style.transform = `translate(0px,0px)`;
        box3.style.transform = `translate(0px,0px)`;
        box4.style.transform = `translate(0px,0px)`;
        box5.style.transform = `translate(0px,0px)`;
    });
});

