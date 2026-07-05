class TickerUpdater {

    constructor(updateInterval = 1000) {
        this.updateInterval = updateInterval;
        this.updating = false;

        this.tickertime = document.getElementById("tickertime");
        this.timezone = document.getElementById("timezone");
        this.timeformat = document.getElementById("timeformat");

        this.startUpdating();
    }

    getTimeZone() {
        const zones = {
            SAST: "Africa/Johannesburg",
            CET: "Europe/Paris",
            CEST: "Europe/Paris",
            EST: "America/New_York",
            CST: "America/Chicago",
            MST: "America/Denver",
            PST: "America/Los_Angeles",
            JST: "Asia/Tokyo"
        };

        const code = this.timezone?.innerText.trim().toUpperCase();
        return zones[code] || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    getHourFormat() {
        const value = this.timeformat?.innerText.trim().toUpperCase();
        return value === "AM/PM" || value === "12H" || value === "12";
    }

    startUpdating() {
        if (this.updating) return;

        this.updating = true;
        this.update();

        this.interval = setInterval(() => {
            this.update();
        }, this.updateInterval);
    }

    stopUpdating() {
        clearInterval(this.interval);
        this.updating = false;
    }

    update() {
        if (!this.tickertime) return;

        const tz = this.getTimeZone();
        const hour12 = this.getHourFormat();

        const formatted = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12,
            timeZone: tz
        }).format(new Date());

        this.tickertime.textContent = formatted;

        if (hour12) {
            this.tickertime.classList.add("ampm");
        } else {
            this.tickertime.classList.remove("ampm");
        }
    }
}

/* ===================== TITLE AUTO-FIT ===================== */

function fitTextToWidth(el, max = 48, min = 20) {

    const parentWidth = el.clientWidth;

    // Create hidden measurement element
    const clone = document.createElement("span");

    const style = getComputedStyle(el);

    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.whiteSpace = "nowrap";
    clone.style.fontFamily = style.fontFamily;
    clone.style.letterSpacing = style.letterSpacing;
    clone.style.textTransform = style.textTransform;
    clone.style.fontWeight = style.fontWeight;

    document.body.appendChild(clone);

    let low = min;
    let high = max;
    let best = min;

    while (low <= high) {
        const mid = (low + high) >> 1;

        clone.style.fontSize = mid + "px";
        clone.textContent = el.textContent;

        const width = clone.offsetWidth;

        if (width <= parentWidth) {
            best = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    document.body.removeChild(clone);

    el.style.fontSize = best + "px";
}

/* Call when title updates */
function updateTitle(text) {
    const el = document.getElementById("title");

    el.textContent = text;

    requestAnimationFrame(() => {
        el.style.fontSize = "48px";

        requestAnimationFrame(() => {
            fitTextToWidth(el, 48, 20);
        });
    });
}

/* Ensure fonts are loaded before measuring */
document.fonts.ready.then(() => {
    const el = document.getElementById("title");
    if (el) fitTextToWidth(el, 48, 20);
});