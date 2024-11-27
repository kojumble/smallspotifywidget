import clamp from "clamp";

const movemultiple = 5;
const shadowmultiple = 8;
// const opacitymultiple = 3;

const songthumbrot = document.getElementById("thumbrot");
const songthumbbounds = document.getElementById("thumbnailbounds");
const songthumbglint = document.getElementById("thumbnailglint");
const songthumbshadow = document.getElementById("thumbnailshadow");

function transformElement(x, y) {
    let thumbbox = songthumbrot.getBoundingClientRect();
    let glintbox = songthumbglint.getBoundingClientRect();
    const calcX = -(y - thumbbox.y - thumbbox.height / 2) / movemultiple;
    const calcY = (x - thumbbox.x - thumbbox.width / 2) / movemultiple;

    const shdcalcY = -(y - thumbbox.y - thumbbox.height / 2) / shadowmultiple;
    const shdcalcX = (x - thumbbox.x - thumbbox.width / 2) / shadowmultiple;

    // rotate thumbnail root and shadow
    songthumbrot.style.transform = "rotateX(" + calcX + "deg) " + "rotateY(" + calcY + "deg)";
    songthumbshadow.style = `transform: rotateX(${shdcalcX}deg) rotateY(${shdcalcY}deg) translate(9px, 9px);`;

    // translate the background to slide in when the mouse is near the top left
    // and clamp it so that it doesnt slide off
    songthumbglint.style.backgroundPositionX = clamp(((-155 + ((x - glintbox.x - glintbox.width)) * -1)) , -135, 0)  + `px`;
    songthumbglint.style.backgroundPositionY = clamp(((-155 + ((y - glintbox.y - glintbox.height)) * -1)), -135, 0 )  + `px`;
}

// set the glints opacity by how close to the top left you are
// unused

// function glintOpacity(x, y) {
//     let thumbbox = songthumbrot.getBoundingClientRect();
//     songthumbglint.style.opacity = parseInt((((y + thumbbox.y - thumbbox.height) / opacitymultiple ) * -1) + (((x - thumbbox.x - thumbbox.width) / opacitymultiple ) * -1)) + `%`;
// }

songthumbbounds.addEventListener("mousemove", (e) => {
    window.requestAnimationFrame(function () {
        transformElement(e.clientX, e.clientY);
    });
});

songthumbbounds.addEventListener("mouseleave", (e) => {
    window.requestAnimationFrame(function () {
        songthumbrot.style.transform = "rotateX(0) rotateY(0)";
        songthumbshadow.style.transform = `rotateX(0) rotateY(0) translate(0px, 0px)`;
    });
});

