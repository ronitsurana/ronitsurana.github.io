var linkBoot = document.createElement("link");
linkBoot.setAttribute("rel", "stylesheet");
linkBoot.setAttribute("href", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css");
linkBoot.setAttribute("integrity", "sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN");
linkBoot.setAttribute("crossorigin", "anonymous");
document.head.appendChild(linkBoot);

var scriptBoot = document.createElement("script");
scriptBoot.setAttribute("src", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js");
scriptBoot.setAttribute("integrity", "sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL");
scriptBoot.setAttribute("crossorigin", "anonymous");
document.head.appendChild(scriptBoot);

var scriptColor = document.createElement("script");
scriptColor.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/Colors.js/1.2.3/colors.min.js");
document.head.appendChild(scriptColor);

var alignment = document.getElementsByTagName("canvas");
for (var i = 0; i < alignment.length; i++) {
    if (((innerWidth - (4 * alignment[0].width)) / 5.4) < 0 || ((innerHeight - (alignment[0].height)) / 2) < 0) {
        alignment[i].style.marginLeft = "0px";
        alignment[i].style.marginTop = "0px";
    } else {
        alignment[i].style.marginLeft = (innerWidth - (4 * alignment[0].width)) / 5.4 + "px";
        alignment[i].style.marginTop = (innerHeight - (alignment[0].height)) / 2 + "px";
    }
}

class clockClass {

    #canvas;
    #image;
    #data;
    #context;
    #width;
    #height;
    hrs1;
    min1;
    sec1;
    color;
    #defaultZone;
    #radius;
    static arrayofclocks = [];
    static #debug = false;
    element;
    stream;


    #init() {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width
            this.canvas.height = this.height;
            this.canvas.style = "border:1px solid rgb(0, 0, 0);";
            this.element.appendChild(this.canvas);
        }
        if (this.width > this.height) {
            this.radius = this.height / 2;
        }
        else {
            this.radius = this.width / 2;
        }
        var self = this;
        this.canvas.addEventListener('click', function () {
            clockConfig(self);
        }, false);
    }

    constructor(element, color, width, height, canvas, defaultZone, stream) {
        this.element = element;
        this.color = color || 0x000000;
        this.width = width || 300;
        this.height = height || 300;
        this.canvas = canvas;
        this.defaultZone = defaultZone || "Asia/kolkata";
        clockClass.#log(this);
        this.#init();
        this.#animateClock();
        this.stream = stream;
    }

    #minSecCoord(val, length) {
        val = val * 6;
        let coordx, coordy;
        var cx = this.width / 2, cy = this.height / 2;
        if (val >= 0 && val <= 100) {
            coordx = cx + (length * Math.sin(Math.PI * val / 180));
            coordy = cy - (length * Math.cos(Math.PI * val / 180));
        }
        else {
            coordx = cx - (length * -Math.sin(Math.PI * val / 180));
            coordy = cy - (length * Math.cos(Math.PI * val / 180));
        }
        return [coordx, coordy];
    }

    #canvas_arrow(context, fromx, fromy, tox, toy, r) {
        var x_center = tox;
        var y_center = toy;
        var angle;
        var x;
        var y;
        context.beginPath();
        angle = Math.atan2(toy - fromy, tox - fromx)
        x = r * Math.cos(angle) + x_center;
        y = r * Math.sin(angle) + y_center;
        context.moveTo(x, y);
        angle += (1 / 3) * (2 * Math.PI)
        x = r * Math.cos(angle) + x_center;
        y = r * Math.sin(angle) + y_center;
        context.lineTo(x, y);
        angle += (1 / 3) * (2 * Math.PI)
        x = r * Math.cos(angle) + x_center;
        y = r * Math.sin(angle) + y_center;
        context.lineTo(x, y);
        context.closePath();
        context.fill();
    }

    #hrsCoord(hval, val, length, cx, cy) {
        val = ((hval * 30) + (val * 0.5));
        let coordx, coordy;
        if (val >= 0 && val <= 180) {
            coordx = cx + (length * Math.sin(Math.PI * val / 180));
            coordy = cy - (length * Math.cos(Math.PI * val / 180));
        }
        else {
            coordx = cx - (length * -Math.sin(Math.PI * val / 180));
            coordy = cy - (length * Math.cos(Math.PI * val / 180));
        }
        return [coordx, coordy];
    }

    #clockNum() {
        var cx = this.width / 2, cy = this.height / 2;
        this.context.beginPath();
        this.context.arc(cx, cy, this.radius, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.font = this.radius / 10 + "px Verdana";
        this.context.textAlign = "center";
        var list = [12, 15, 30, 30, 30, 30, 30, 30, 30, 10, 10, 10];
        for (var l = 0; l < 12; l++) {
            var handCoordt = this.#minSecCoord((l + 1) * 5, this.radius - (this.radius / list[l]), cx, cy);
            this.context.fillText(String(l + 1), handCoordt[0], handCoordt[1]);
        }
    }

    getData(data) {
        this.data = data;
    }

    getImage(image1) {
        this.image = image1;
    }

    setImage() {
        var rgb1 = window.activecanvas.getComlementColor(window.activecanvas);
        if (window.confirm("Do you want to set the font color based on the background selected?")) {
            window.activecanvas.update(rgb1);
        }
        else {
            window.activecanvas.update(window.activecanvas.color);
        }
        window.activecanvas.canvas.style.backgroundImage = "url(" + window.activecanvas.image + ")";
    }

    update(newcolor) {
        this.color = newcolor;
    }

    setDefaultZone(newZone) {
        this.defaultZone = newZone;
    }

    getComlementColor(scanner) {
        var rgb = {
            b: 0,
            g: 0,
            r: 0
        };
        var data = scanner.data;
        if (data) {
            var count = 0;
            var length = data.length;
            var blockSize = 5;
            var step = (blockSize * 4) - 4;
            for (var i = step; i < length; i += step) {
                count += 1;
                rgb.r += data[i];
                rgb.g += data[i + 1];
                rgb.b += data[i + 2];
            }
            rgb.r = Math.floor(rgb.r / count);
            rgb.g = Math.floor(rgb.g / count);
            rgb.b = Math.floor(rgb.b / count);
            console.log(rgb);
            var avgComplement = Colors.complement(rgb.r, rgb.b, rgb.g);
            var avgComplementHex = Colors.rgb2hex.apply(null, avgComplement.a);
            return avgComplementHex;
        }
        else {
            return window.activecanvas.color;
        }
    }

    #animateClock() {
        this.#normalClock();
        requestAnimationFrame(this.#animateClock);
    }

    #normalClock() {
        var cx = this.width / 2, cy = this.height / 2;
        function updateClock(sender) {
            sender.context = sender.canvas.getContext("2d");
            sender.context.fillStyle = sender.color;
            sender.context.strokeStyle = sender.color;
            sender.context.clearRect(0, 0, sender.width, sender.height);
            const date = new Date();
            const date1 = new Date(Date.parse(date.toLocaleString('en-US', {
                timeZone: sender.defaultZone || "Asia/calcutta",
            })))
            var hrs = date1.getHours(), min = date1.getMinutes(), sec = date1.getSeconds();
            var hrLength = sender.radius - (sender.radius / 2.5), minLength = sender.radius - (sender.radius / 15), secLength = sender.radius;
            sender.context.beginPath();
            sender.#clockNum();
            var handCoordm = sender.#minSecCoord(sec, secLength);
            sender.context.moveTo(cx, cy);
            sender.context.lineTo(handCoordm[0], handCoordm[1]);
            sender.context.stroke();
            var handCoords = sender.#minSecCoord(min, minLength, cx, cy);
            sender.context.moveTo(cx, cy);
            sender.context.lineTo(handCoords[0], handCoords[1]);
            sender.context.stroke();
            sender.#canvas_arrow(sender.context, cx, cy, handCoords[0], handCoords[1], (sender.radius / 10) - (sender.radius / 15));
            var handCoordh = sender.#hrsCoord(hrs, min, hrLength, cx, cy);
            sender.context.moveTo(cx, cy);
            sender.context.lineTo(handCoordh[0], handCoordh[1]);
            sender.context.stroke();
            sender.#canvas_arrow(sender.context, cx, cy, handCoordh[0], handCoordh[1], (sender.radius / 10) - (sender.radius / 15));
        }
        setInterval(updateClock, 1000, this);
    }

    timer() {
        let sect = prompt("Enter seconds");
        let mint = prompt("Enter Minutes");
        let hrst = prompt("Enter Hours");
        function updateClock2(sender) {
            const date = new Date();
            const date1 = new Date(Date.parse(date.toLocaleString('en-US', {
                timeZone: sender.defaultZone,
            })))
            var hrs = date1.getHours(), min = date1.getMinutes(), sec = date1.getSeconds();
            if (hrs == hrst && min == mint && sec == sect) {
                alert("THE TIME IS UP");
            }
        } setInterval(updateClock2, 1000, this)
    }

    secTimer() {
        let sect = parseInt(prompt("Enter seconds for the timer"));
        if (sect > 60) {
            var rem = sect % 60;
            sect = sect - rem;
            var mint = sect / 60;
            sect = rem;
        }
        else {
            mint = 0;
            sect = sect;
        }
        const date = new Date();
        const date1 = new Date(Date.parse(date.toLocaleString('en-US', {
            timeZone: this.defaultZone,
        })))
        var min = date1.getMinutes(), sec = date1.getSeconds();
        let secTotal = sec + sect;
        let minTotal = min + mint;
        while (secTotal > 60) {
            secTotal = secTotal - 60;
            minTotal += 1;
        }
        function updateClock2(sender) {

            const date = new Date();
            const date1 = new Date(Date.parse(date.toLocaleString('en-US', {
                timeZone: sender.defaultZone,
            })))
            var hrs = date1.getHours(), min = date1.getMinutes(), sec = date1.getSeconds();

            if (sec == secTotal && min == minTotal) {
                alert("THE TIME IS UP");
            }
        } setInterval(updateClock2, 1000, this)
    }

    stopwatch() {
        let varName = document.getElementById("stopWatch").getAttribute("data-value");
        if (varName == 1) {
            document.getElementById("stopWatch").setAttribute("data-value", "2");
            const date = new Date();
            const date1 = new Date(Date.parse(date.toLocaleString('en-US', {
                timeZone: this.defaultZone,
            })))
            clockClass.hrs1 = date1.getHours(), clockClass.min1 = date1.getMinutes(), clockClass.sec1 = date1.getSeconds();
            console.log(clockClass.hrs1, clockClass.min1, clockClass.sec1);

        }
        else {
            document.getElementById("stopWatch").setAttribute("data-value", "1");
            var timeHrs = 0, timeMin = 0, timeSec = 0;
            const date = new Date();
            const date1 = new Date(Date.parse(date.toLocaleString('en-US', {
                timeZone: this.defaultZone,
            })))
            var hrs2 = date1.getHours(), min2 = date1.getMinutes(), sec2 = date1.getSeconds();
            timeHrs = hrs2 - clockClass.hrs1, timeMin = min2 - clockClass.min1, timeSec = sec2 - clockClass.sec1;
            while (timeMin < 0) {
                timeHrs--;
                timeMin += 60
            }
            while (timeSec < 0) {
                timeMin--;
                timeSec += 60;
            }

            if (window.confirm(timeHrs.toString() + " Hours " + timeMin.toString() + " Minutes " + timeSec.toString() + " Seconds")) {

                hrs2 = 0, min2 = 0, sec2 = 0;
            }
        }
    }


    static #log(obj) {
        if (clockClass.#debug) {
            console.log(obj);
        }
    }

    static scanelements() {
        const element = document.getElementsByTagName("div");
        for (var i = 0; i < (element.length); i++) {
            if (element[i].getAttribute('data-value') == "clock") {
                var canvases = element[i].getElementsByTagName("canvas");
                if (canvases.length == 0) {
                    var c = new clockClass(element[i], 0x00000);
                    clockClass.arrayofclocks.push(c);
                }
                else {
                    for (var j = 0; j < canvases.length; j++) {
                        var canElement = canvases[j];
                        var c = new clockClass(element[i], 0x00000, canElement.width, canElement.height, canElement);
                        clockClass.arrayofclocks.push(c);
                    }
                }
            }
        }
    }
}

clockClass.scanelements();
console.log(clockClass.arrayofclocks);

window.activecanvas = null;

let color = document.getElementById("color");
let apply = document.getElementById("apply");
let close1 = document.getElementById("close");
let timer = document.getElementById("timer");
let secTimer = document.getElementById("secondTimer");
let stopwatch = document.getElementById("stopWatch");
let select = document.querySelector('select');
let file = document.getElementById("file");
let remove = document.getElementById("remove");
let pip = document.getElementById("pipButton");

apply.addEventListener("click", function () {
    window.activecanvas.update(color.value);
    window.activecanvas.setDefaultZone(select.value);
    if (file.value != "") {
        window.activecanvas.setImage();
        file.value = ""
    }
    hideProperties();
}, false);

timer.addEventListener("click", function () {
    window.activecanvas.timer();
}, false);

secTimer.addEventListener("click", function () {
    window.activecanvas.secTimer();
}, false);

stopwatch.addEventListener("click", function () {
    window.activecanvas.stopwatch();
}, false);

close1.addEventListener("click", function () {
    hideProperties();
}, false);

remove.addEventListener("click", function () {
    window.activecanvas.canvas.style.backgroundImage = "";
    window.activecanvas.update("#000000");
}, false);

file.addEventListener("change", function () {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image(window.activecanvas.width, window.activecanvas.height);
        img.onload = function () {
            window.activecanvas.context.arc(window.activecanvas.width / 2, window.activecanvas.height / 2, window.activecanvas.radius, 0, 2 * Math.PI);
            window.activecanvas.context.clip();
            window.activecanvas.context.drawImage(img, 0, 0, window.activecanvas.width, window.activecanvas.height);
            var imgCrop = window.activecanvas.canvas.toDataURL();
            function preview() {
                for (var i = 0; i < 6; i++) {
                    window.activecanvas.context.drawImage(img, 0, 0, window.activecanvas.width, window.activecanvas.height);
                }
            }
            var interval = setInterval(preview);
            setTimeout(() => { clearInterval(interval); }, 3000);
            var imgData = window.activecanvas.context.getImageData(0, 0, window.activecanvas.width, window.activecanvas.height);
            console.log(window.activecanvas);
            window.activecanvas.getImage(imgCrop);
            window.activecanvas.getData(imgData.data);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file.files[0]);
}, false);

pip.addEventListener("click", async function () {
    if (document.pictureInPictureEnabled) {
        var pipWindow = await documentPictureInPicture.requestWindow({
            width: window.activecanvas.width + 50,
            height: window.activecanvas.height + 62,
        });
        window.activecanvas.canvas.style.marginLeft = '0px';
        window.activecanvas.canvas.style.marginTop = '0px';
        pipWindow.document.body.append(window.activecanvas.canvas);


        pipWindow.addEventListener("pagehide", (event) => {
            const canvasPlace = document.getElementById("div1");
            const pipCanvas = pipWindow.document.getElementsByTagName("canvas");
            pipCanvas[0].style.marginLeft = (innerWidth - (4 * alignment[0].width)) / 5.4 + "px";
            pipCanvas[0].style.marginTop = (innerHeight - (alignment[0].height)) / 2 + "px";
            canvasPlace.append(pipCanvas[0]);
        });
    }
}, false);

function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className);
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className;
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}

function showProperties() {
    let ovl = document.getElementById("overlay-back");
    let popup = document.getElementById("popup");

    addClass(ovl, "active");
    addClass(popup, "active");

}

function hideProperties() {
    let ovl = document.getElementById("overlay-back");
    let popup = document.getElementById("popup");
    removeClass(ovl, "active");
    removeClass(popup, "active");
}

function clockConfig(scanner) {
    window.activecanvas = scanner;
    console.log(scanner);
    color.value = scanner.color;
    select.value = scanner.defaultZone;
    showProperties();
}

if (!Intl.supportedValuesOf) {
    let opt = new Option('Your browser does not support Intl.supportedValuesOf().', null, true, true);
    opt.disabled = true;
    select.options.add(opt);
} else {
    for (const timeZone of Intl.supportedValuesOf('timeZone')) {
        select.options.add(new Option(timeZone));
    }
}




