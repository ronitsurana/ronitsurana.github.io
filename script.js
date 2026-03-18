/* ═══════════════════════════════════════════════════════
   ClockCraft — Minimal + Theme-aware script.js
   Original elements preserved, minimal clock rendering
   ═══════════════════════════════════════════════════════ */

// ── Bootstrap CDN ────────────────────────────────────
const linkBoot = document.createElement("link");
linkBoot.setAttribute("rel", "stylesheet");
linkBoot.setAttribute("href", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css");
linkBoot.setAttribute("integrity", "sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB");
linkBoot.setAttribute("crossorigin", "anonymous");
document.head.appendChild(linkBoot);

const scriptBoot = document.createElement("script");
scriptBoot.setAttribute("src", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js");
scriptBoot.setAttribute("integrity", "sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI");
scriptBoot.setAttribute("crossorigin", "anonymous");
document.head.appendChild(scriptBoot);

const scriptColor = document.createElement("script");
scriptColor.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/Colors.js/1.2.3/colors.min.js");
document.head.appendChild(scriptColor);

// ── Canvas alignment ─────────────────────────────────
const alignment = document.getElementsByTagName("canvas");
for (let i = 0; i < alignment.length; i++) {
    if (((innerWidth - (4 * alignment[0].width)) / 5.4) < 0 || ((innerHeight - (alignment[0].height)) / 2) < 0) {
        alignment[i].style.marginLeft = "0px";
        alignment[i].style.marginTop  = "0px";
    } else {
        alignment[i].style.marginLeft = (innerWidth - (4 * alignment[0].width)) / 5.4 + "px";
        alignment[i].style.marginTop  = (innerHeight - (alignment[0].height)) / 2 + "px";
    }
}

// ── Theme helpers ────────────────────────────────────
function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── Clock Class ──────────────────────────────────────
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
            this.canvas.width  = this.width;
            this.canvas.height = this.height;
            this.element.appendChild(this.canvas);
        }
        this.radius = Math.min(this.width, this.height) / 2;
        const self = this;
        this.canvas.addEventListener('click', function () {
            clockConfig(self);
        }, false);
    }

    constructor(element, color, width, height, canvas, defaultZone, stream) {
        this.element     = element;
        this.color       = color || null; // null = use theme default
        this.width       = width  || 300;
        this.height      = height || 300;
        this.canvas      = canvas;
        this.defaultZone = defaultZone || "Asia/Kolkata";
        clockClass.#log(this);
        this.#init();
        this.#startAnimation();
        this.stream = stream;
    }

    // ── Minimal clock rendering ───────────────────────
    #drawClock() {
        const ctx = this.canvas.getContext("2d");
        const w  = this.width, h = this.height;
        const cx = w / 2,    cy = h / 2;
        const r  = this.radius - 6;

        // Resolve theme colors from CSS variables
        const bg0      = getCssVar("--clock-bg0")      || "#1c1c1c";
        const bg1      = getCssVar("--clock-bg1")      || "#111111";
        const ringCol  = getCssVar("--clock-ring")     || "rgba(255,255,255,0.06)";
        const tickCol  = getCssVar("--clock-tick")     || "rgba(255,255,255,0.35)";
        const tickMinor= getCssVar("--clock-tickminor")|| "rgba(255,255,255,0.1)";
        const numCol   = getCssVar("--clock-num")      || "rgba(255,255,255,0.35)";
        const handCol  = this.color || getCssVar("--clock-hand") || "#e8e8e8";
        const accent   = getCssVar("--accent")         || "#fe9637";

        ctx.clearRect(0, 0, w, h);

        // ── Face ──
        const bgGrad = ctx.createRadialGradient(cx, cy * 0.85, 0, cx, cy, r);
        bgGrad.addColorStop(0, bg0);
        bgGrad.addColorStop(1, bg1);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Thin outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = ringCol;
        ctx.lineWidth = 1;
        ctx.stroke();

        // ── Get time ──
        const now = new Date();
        let t;
        try {
            t = new Date(Date.parse(now.toLocaleString('en-US', { timeZone: this.defaultZone })));
        } catch { t = now; }
        const hrs = t.getHours(), min = t.getMinutes(), sec = t.getSeconds();
        const ms  = now.getMilliseconds();
        const smoothSec = sec + ms / 1000;

        // ── Tick marks ──
        for (let i = 0; i < 60; i++) {
            const angle  = (i * 6 - 90) * (Math.PI / 180);
            const isHour = i % 5 === 0;
            const len    = isHour ? 10 : 5;
            const outer  = r - 12;
            const inner  = outer - len;
            ctx.beginPath();
            ctx.moveTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle));
            ctx.lineTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
            ctx.strokeStyle = isHour ? tickCol : tickMinor;
            ctx.lineWidth   = isHour ? 1.5 : 1;
            ctx.lineCap     = "round";
            ctx.stroke();
        }

        // ── Hour numbers (12, 3, 6, 9 only — minimal) ──
        ctx.font         = `${Math.round(r * 0.12)}px "Inter", sans-serif`;
        ctx.fillStyle    = numCol;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        for (const i of [3, 6, 9, 12]) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const nr    = r - 34;
            ctx.fillText(i, cx + nr * Math.cos(angle), cy + nr * Math.sin(angle));
        }

        // ── Hour hand ──
        const hrAngle = ((hrs % 12) * 30 + min * 0.5 - 90) * (Math.PI / 180);
        const hrLen   = r * 0.48;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + hrLen * Math.cos(hrAngle), cy + hrLen * Math.sin(hrAngle));
        ctx.strokeStyle = handCol;
        ctx.lineWidth   = 3;
        ctx.lineCap     = "round";
        ctx.stroke();

        // ── Minute hand ──
        const minAngle = (min * 6 + sec * 0.1 - 90) * (Math.PI / 180);
        const minLen   = r * 0.68;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + minLen * Math.cos(minAngle), cy + minLen * Math.sin(minAngle));
        ctx.strokeStyle = handCol;
        ctx.lineWidth   = 2;
        ctx.lineCap     = "round";
        ctx.stroke();

        // ── Second hand ──
        const secAngle = (smoothSec * 6 - 90) * (Math.PI / 180);
        const secLen   = r * 0.75;
        // tail
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - r * 0.12 * Math.cos(secAngle), cy - r * 0.12 * Math.sin(secAngle));
        ctx.strokeStyle = accent;
        ctx.lineWidth   = 1;
        ctx.lineCap     = "round";
        ctx.stroke();
        // hand
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + secLen * Math.cos(secAngle), cy + secLen * Math.sin(secAngle));
        ctx.strokeStyle = accent;
        ctx.lineWidth   = 1;
        ctx.lineCap     = "round";
        ctx.stroke();

        // ── Center cap ──
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
    }

    #canvas_arrow(context, fromx, fromy, tox, toy, r) {
        const xc = tox, yc = toy;
        let angle = Math.atan2(toy - fromy, tox - fromx);
        context.beginPath();
        context.moveTo(r * Math.cos(angle) + xc, r * Math.sin(angle) + yc);
        angle += (1/3) * (2 * Math.PI);
        context.lineTo(r * Math.cos(angle) + xc, r * Math.sin(angle) + yc);
        angle += (1/3) * (2 * Math.PI);
        context.lineTo(r * Math.cos(angle) + xc, r * Math.sin(angle) + yc);
        context.closePath();
        context.fillStyle = this.color || getCssVar("--clock-hand");
        context.fill();
    }

    #startAnimation() {
        const tick = () => {
            this.#drawClock();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    getData(data)    { this.data  = data; }
    getImage(image1) { this.image = image1; }

    setImage() {
        const rgb1 = window.activecanvas.getComplementColor(window.activecanvas);
        if (window.confirm("Set hand color based on background?")) {
            window.activecanvas.update(rgb1);
        } else {
            window.activecanvas.update(window.activecanvas.color);
        }
        window.activecanvas.canvas.style.backgroundImage = "url(" + window.activecanvas.image + ")";
    }

    update(newcolor)      { this.color       = newcolor; }
    setDefaultZone(zone)  { this.defaultZone = zone; }

    getComplementColor(scanner) {
        const rgb  = { r: 0, g: 0, b: 0 };
        const data = scanner.data;
        if (data) {
            let count = 0;
            const step = (5 * 4) - 4;
            for (let i = step; i < data.length; i += step) {
                count++;
                rgb.r += data[i];
                rgb.g += data[i + 1];
                rgb.b += data[i + 2];
            }
            rgb.r = Math.floor(rgb.r / count);
            rgb.g = Math.floor(rgb.g / count);
            rgb.b = Math.floor(rgb.b / count);
            const avg = Colors.complement(rgb.r, rgb.b, rgb.g);
            return Colors.rgb2hex.apply(null, avg.a);
        }
        return window.activecanvas.color;
    }

    timer() {
        let sect = prompt("Enter seconds");
        let mint = prompt("Enter Minutes");
        let hrst = prompt("Enter Hours");
        function updateClock2(sender) {
            const d  = new Date(Date.parse(new Date().toLocaleString('en-US', { timeZone: sender.defaultZone })));
            if (d.getHours() == hrst && d.getMinutes() == mint && d.getSeconds() == sect) {
                alert("THE TIME IS UP");
            }
        }
        setInterval(updateClock2, 1000, this);
    }

    secTimer() {
        let sect = parseInt(prompt("Enter seconds for the timer"));
        let mint;
        if (sect > 60) {
            const rem = sect % 60;
            sect = sect - rem;
            mint = sect / 60;
            sect = rem;
        } else {
            mint = 0;
        }
        const d = new Date(Date.parse(new Date().toLocaleString('en-US', { timeZone: this.defaultZone })));
        let secTotal = d.getSeconds() + sect;
        let minTotal = d.getMinutes() + mint;
        while (secTotal > 60) { secTotal -= 60; minTotal += 1; }
        function updateClock2(sender) {
            const d2 = new Date(Date.parse(new Date().toLocaleString('en-US', { timeZone: sender.defaultZone })));
            if (d2.getSeconds() == secTotal && d2.getMinutes() == minTotal) { alert("THE TIME IS UP"); }
        }
        setInterval(updateClock2, 1000, this);
    }

    stopwatch() {
        const btn = document.getElementById("stopWatch");
        if (btn.getAttribute("data-value") == 1) {
            btn.setAttribute("data-value", "2");
            btn.className = "cc-btn cc-btn--danger";
            btn.setAttribute("value", "Stop");
            const d = new Date(Date.parse(new Date().toLocaleString('en-US', { timeZone: this.defaultZone })));
            clockClass.hrs1 = d.getHours();
            clockClass.min1 = d.getMinutes();
            clockClass.sec1 = d.getSeconds();
        } else {
            btn.setAttribute("data-value", "1");
            btn.className = "cc-btn";
            btn.setAttribute("value", "StopWatch");
            const d = new Date(Date.parse(new Date().toLocaleString('en-US', { timeZone: this.defaultZone })));
            let timeHrs = d.getHours() - clockClass.hrs1;
            let timeMin = d.getMinutes() - clockClass.min1;
            let timeSec = d.getSeconds() - clockClass.sec1;
            while (timeMin < 0) { timeHrs--; timeMin += 60; }
            while (timeSec < 0) { timeMin--; timeSec += 60; }
            window.confirm(`${timeHrs}h ${timeMin}m ${timeSec}s elapsed`);
        }
    }

    static #log(obj) { if (clockClass.#debug) console.log(obj); }

    static scanelements() {
        const elements = document.getElementsByTagName("div");
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].getAttribute('data-value') == "clock") {
                const canvases = elements[i].getElementsByTagName("canvas");
                if (canvases.length == 0) {
                    clockClass.arrayofclocks.push(new clockClass(elements[i], null));
                } else {
                    for (let j = 0; j < canvases.length; j++) {
                        const cv = canvases[j];
                        clockClass.arrayofclocks.push(new clockClass(elements[i], null, cv.width, cv.height, cv));
                    }
                }
            }
        }
    }
}

clockClass.scanelements();
console.log(clockClass.arrayofclocks);

window.activecanvas = null;

const color     = document.getElementById("color");
const apply     = document.getElementById("apply");
const close1    = document.getElementById("close");
const timer     = document.getElementById("timer");
const secTimer  = document.getElementById("secondTimer");
const stopwatch = document.getElementById("stopWatch");
const select    = document.getElementById("zone");
const file      = document.getElementById("file");
const remove    = document.getElementById("remove");
const pip       = document.getElementById("pipButton");

apply.addEventListener("click", function () {
    window.activecanvas.update(color.value);
    window.activecanvas.setDefaultZone(select.value);
    if (file.value != "") {
        window.activecanvas.setImage();
        file.value = "";
    }
    hideProperties();
}, false);

timer.addEventListener("click",     () => window.activecanvas.timer());
secTimer.addEventListener("click",  () => window.activecanvas.secTimer());
stopwatch.addEventListener("click", () => window.activecanvas.stopwatch());
close1.addEventListener("click",    hideProperties);

remove.addEventListener("click", function () {
    window.activecanvas.canvas.style.backgroundImage = "";
    window.activecanvas.update(null); // back to theme default
}, false);

file.addEventListener("change", function () {
    // Update label to show chosen filename
    const fileLabel = document.getElementById("fileLabel");
    if (fileLabel) {
        fileLabel.textContent = this.files.length > 0 ? `📎 ${this.files[0].name}` : "📁 Choose Image";
    }
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image(window.activecanvas.width, window.activecanvas.height);
        img.onload = function () {
            const ctx = window.activecanvas.canvas.getContext("2d");
            ctx.arc(window.activecanvas.width / 2, window.activecanvas.height / 2, window.activecanvas.radius, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, 0, 0, window.activecanvas.width, window.activecanvas.height);
            const imgCrop = window.activecanvas.canvas.toDataURL();
            let interval = setInterval(() => {
                ctx.drawImage(img, 0, 0, window.activecanvas.width, window.activecanvas.height);
            });
            setTimeout(() => clearInterval(interval), 3000);
            const imgData = ctx.getImageData(0, 0, window.activecanvas.width, window.activecanvas.height);
            window.activecanvas.getImage(imgCrop);
            window.activecanvas.getData(imgData.data);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file.files[0]);
}, false);

pip.addEventListener("click", async function () {
    if (typeof documentPictureInPicture === "undefined") {
        alert("Picture-in-Picture is not supported in this browser.\nPlease use Chrome 116 or later.");
        return;
    }
    const clock = window.activecanvas;
    if (!clock) return;
    try {
        const pipWindow = await documentPictureInPicture.requestWindow({
            width:  clock.width + 32,
            height: clock.height + 84,
        });
        const isDark = document.documentElement.getAttribute("data-theme") !== "light";
        const style = pipWindow.document.createElement("style");
        style.textContent = `
            @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                background: ${isDark ? "#111" : "#f5f5f5"};
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                height: 100vh;
                font-family: "Inter", sans-serif;
                gap: 8px; overflow: hidden;
            }
            canvas { border-radius: 50%; display: block; }
            #pip-tz {
                font-size: 10px; font-weight: 600;
                letter-spacing: 0.12em; text-transform: uppercase;
                color: ${isDark ? "rgba(224,224,240,0.45)" : "rgba(0,0,0,0.4)"};
            }
            #pip-time {
                font-size: 22px; font-weight: 600;
                letter-spacing: 0.04em; color: #fe9637;
                font-variant-numeric: tabular-nums;
            }
        `;
        pipWindow.document.head.appendChild(style);
        clock.canvas.style.marginLeft = "0";
        clock.canvas.style.marginTop  = "0";
        clock.canvas.style.boxShadow  = "0 0 0 3px #fe9637";
        pipWindow.document.body.appendChild(clock.canvas);
        const tzLabel = pipWindow.document.createElement("div");
        tzLabel.id = "pip-tz";
        tzLabel.textContent = clock.defaultZone || "Local";
        pipWindow.document.body.appendChild(tzLabel);
        const timeDiv = pipWindow.document.createElement("div");
        timeDiv.id = "pip-time";
        pipWindow.document.body.appendChild(timeDiv);
        function updateDigital() {
            try {
                const d = new Date(Date.parse(new Date().toLocaleString("en-US", { timeZone: clock.defaultZone })));
                timeDiv.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
                    .map(n => String(n).padStart(2, "0")).join(":");
            } catch { timeDiv.textContent = ""; }
        }
        updateDigital();
        const digitalInterval = setInterval(updateDigital, 1000);
        const themeObserver = new MutationObserver(() => {
            const dark = document.documentElement.getAttribute("data-theme") !== "light";
            pipWindow.document.body.style.background = dark ? "#111" : "#f5f5f5";
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        pipWindow.addEventListener("pagehide", () => {
            clearInterval(digitalInterval);
            themeObserver.disconnect();
            const pipCanvases = pipWindow.document.getElementsByTagName("canvas");
            if (pipCanvases.length > 0) {
                const c = pipCanvases[0];
                c.style.marginLeft = (innerWidth - (4 * alignment[0].width)) / 5.4 + "px";
                c.style.marginTop  = (innerHeight - (alignment[0].height)) / 2 + "px";
                c.style.boxShadow  = "";
                document.getElementById("div1").appendChild(c);
            }
        });
    } catch (err) {
        console.error("PiP error:", err);
        alert("Could not open Picture-in-Picture.\nMake sure you are using Chrome 116 or later.");
    }
}, false);

function showProperties() {
    document.getElementById("overlay-back").classList.add("active");
    document.getElementById("popup").classList.add("active");
}

function hideProperties() {
    document.getElementById("overlay-back").classList.remove("active");
    document.getElementById("popup").classList.remove("active");
}

function clockConfig(scanner) {
    window.activecanvas = scanner;
    color.value  = scanner.color || "#000000";
    select.value = scanner.defaultZone;
    showProperties();
}

// Populate timezone dropdown
if (!Intl.supportedValuesOf) {
    const opt = new Option('Browser does not support Intl.supportedValuesOf().', null, true, true);
    opt.disabled = true;
    select.options.add(opt);
} else {
    for (const tz of Intl.supportedValuesOf('timeZone')) {
        select.options.add(new Option(tz));
    }
}

// ── Theme Toggle ─────────────────────────────────────
const themeToggle = document.getElementById("themeToggle");

// Restore saved preference
const savedTheme = localStorage.getItem("cc-theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "light" ? "🌙" : "☀️";

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next    = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    themeToggle.textContent = next === "light" ? "🌙" : "☀️";
    localStorage.setItem("cc-theme", next);
});

// -- Float Widget (draggable in-page overlay) ----------
const floatBtn = document.getElementById("floatButton");
const popupBtn = document.getElementById("popupButton");

floatBtn.addEventListener("click", function () {
    const clock = window.activecanvas;
    if (!clock) return;

    // Create widget container
    const widget = document.createElement("div");
    widget.className = "cc-float";
    const startRight = 80, startBottom = 80;
    widget.style.cssText = `right:${startRight}px;bottom:${startBottom}px;`;

    // Title bar (drag handle)
    const bar = document.createElement("div");
    bar.className = "cc-float__bar";

    const zoneLabel = document.createElement("span");
    zoneLabel.className = "cc-float__zone";
    zoneLabel.textContent = clock.defaultZone || "Local";

    const closeBtn = document.createElement("button");
    closeBtn.className = "cc-float__close";
    closeBtn.textContent = "?";
    closeBtn.title = "Close float widget";

    bar.appendChild(zoneLabel);
    bar.appendChild(closeBtn);

    // Body
    const body = document.createElement("div");
    body.className = "cc-float__body";

    const timeDiv = document.createElement("div");
    timeDiv.className = "cc-float__time";

    body.appendChild(timeDiv);

    widget.appendChild(bar);
    widget.appendChild(body);
    document.body.appendChild(widget);

    // Move canvas into widget body (before timeDiv)
    clock.canvas.style.marginLeft = "0";
    clock.canvas.style.marginTop  = "0";
    clock.canvas.style.boxShadow  = "";
    body.insertBefore(clock.canvas, timeDiv);

    // Live digital time
    function updateTime() {
        try {
            const d = new Date(Date.parse(new Date().toLocaleString("en-US", { timeZone: clock.defaultZone })));
            timeDiv.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
                .map(n => String(n).padStart(2, "0")).join(":");
        } catch { timeDiv.textContent = ""; }
    }
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Close � restore canvas
    closeBtn.addEventListener("click", () => {
        clearInterval(timeInterval);
        clock.canvas.style.marginLeft = (innerWidth - (4 * alignment[0].width)) / 5.4 + "px";
        clock.canvas.style.marginTop  = (innerHeight - (alignment[0].height)) / 2 + "px";
        document.getElementById("div1").appendChild(clock.canvas);
        document.body.removeChild(widget);
    });

    // Drag logic
    let dragging = false, ox = 0, oy = 0;

    bar.addEventListener("mousedown", (e) => {
        dragging = true;
        const rect = widget.getBoundingClientRect();
        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;
        widget.style.right = "";
        widget.style.bottom = "";
        widget.style.left = rect.left + "px";
        widget.style.top  = rect.top  + "px";
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        widget.style.left = (e.clientX - ox) + "px";
        widget.style.top  = (e.clientY - oy) + "px";
    });

    document.addEventListener("mouseup", () => { dragging = false; });

    hideProperties();
}, false);

// -- Popup Window (window.open with self-contained clock) --
popupBtn.addEventListener("click", function () {
    const clock = window.activecanvas;
    if (!clock) return;

    const popup = window.open(
        "", "_blank",
        `popup,width=${clock.width + 40},height=${clock.height + 120},` +
        `toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
    );

    if (!popup) {
        alert("Popup was blocked.\nPlease allow popups for this site and try again.");
        return;
    }

    const isDark  = document.documentElement.getAttribute("data-theme") !== "light";
    const bg      = isDark ? "#111" : "#f5f5f5";
    const handCol = clock.color || (isDark ? "#e8e8e8" : "#222222");
    const accent  = "#fe9637";
    const tz      = clock.defaultZone || "Asia/Kolkata";
    const cw      = clock.width, ch = clock.height;

    // Build self-contained renderer
    const drawFn = `(function(){
        var canvas=document.getElementById("c"),ctx=canvas.getContext("2d");
        var w=${cw},h=${ch},cx=w/2,cy=h/2,r=Math.min(w,h)/2-6;
        var tz="${tz}",hCol="${handCol}",acc="${accent}",dark=${isDark};
        function draw(){
            ctx.clearRect(0,0,w,h);
            var g=ctx.createRadialGradient(cx,cy*.85,0,cx,cy,r);
            g.addColorStop(0,dark?"#1c1c1c":"#fff");
            g.addColorStop(1,dark?"#111":"#f0f0f0");
            ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
            ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
            ctx.strokeStyle=dark?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)";ctx.lineWidth=1;ctx.stroke();
            for(var i=0;i<60;i++){
                var a=(i*6-90)*Math.PI/180,isH=i%5===0,o=r-12,inn=o-(isH?10:5);
                ctx.beginPath();ctx.moveTo(cx+o*Math.cos(a),cy+o*Math.sin(a));
                ctx.lineTo(cx+inn*Math.cos(a),cy+inn*Math.sin(a));
                ctx.strokeStyle=isH?(dark?"rgba(255,255,255,.35)":"rgba(0,0,0,.4)"):(dark?"rgba(255,255,255,.1)":"rgba(0,0,0,.12)");
                ctx.lineWidth=isH?1.5:1;ctx.lineCap="round";ctx.stroke();
            }
            ctx.font=Math.round(r*.12)+"px Inter,sans-serif";
            ctx.fillStyle=dark?"rgba(255,255,255,.35)":"rgba(0,0,0,.35)";
            ctx.textAlign="center";ctx.textBaseline="middle";
            [3,6,9,12].forEach(function(n){
                var a=(n*30-90)*Math.PI/180,nr=r-34;
                ctx.fillText(n,cx+nr*Math.cos(a),cy+nr*Math.sin(a));
            });
            var now=new Date(),t;
            try{t=new Date(Date.parse(now.toLocaleString("en-US",{timeZone:tz})));}catch(e){t=now;}
            var hrs=t.getHours(),min=t.getMinutes(),sec=t.getSeconds(),ms=now.getMilliseconds();
            var ss=sec+ms/1000;
            var ha=((hrs%12)*30+min*.5-90)*Math.PI/180;
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*.48*Math.cos(ha),cy+r*.48*Math.sin(ha));
            ctx.strokeStyle=hCol;ctx.lineWidth=3;ctx.lineCap="round";ctx.stroke();
            var ma=(min*6+sec*.1-90)*Math.PI/180;
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*.68*Math.cos(ma),cy+r*.68*Math.sin(ma));
            ctx.strokeStyle=hCol;ctx.lineWidth=2;ctx.lineCap="round";ctx.stroke();
            var sa=(ss*6-90)*Math.PI/180;
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx-r*.12*Math.cos(sa),cy-r*.12*Math.sin(sa));
            ctx.strokeStyle=acc;ctx.lineWidth=1;ctx.lineCap="round";ctx.stroke();
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*.75*Math.cos(sa),cy+r*.75*Math.sin(sa));
            ctx.strokeStyle=acc;ctx.lineWidth=1;ctx.lineCap="round";ctx.stroke();
            ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle=acc;ctx.fill();
            var te=document.getElementById("t");
            if(te){var hh=String(t.getHours()).padStart(2,"0"),mm=String(t.getMinutes()).padStart(2,"0"),ss2=String(t.getSeconds()).padStart(2,"0");te.textContent=hh+":"+mm+":"+ss2;}
            requestAnimationFrame(draw);
        }
        draw();
    })();`;

    popup.document.open();
    popup.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>${tz}</title>
<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");
*{margin:0;padding:0;box-sizing:border-box;}
body{background:${bg};display:flex;flex-direction:column;align-items:center;
justify-content:center;height:100vh;font-family:Inter,sans-serif;gap:8px;overflow:hidden;}
canvas{border-radius:50%;}
#tz{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
color:${isDark?"rgba(224,224,240,.45)":"rgba(0,0,0,.4)"};}
#t{font-size:22px;font-weight:600;color:${accent};font-variant-numeric:tabular-nums;}
</style></head><body>
<canvas id="c" width="${cw}" height="${ch}"></canvas>
<div id="tz">${tz}</div><div id="t"></div>
<script>${drawFn}<\/script>
</body></html>`);
    popup.document.close();

    hideProperties();
}, false);