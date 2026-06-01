function createSnow() {
  const snow = document.createElement("div");
  snow.className = "snowflake";
  snow.textContent = "❄";

  const size = Math.random() * 12 + 8;
  snow.style.fontSize = size + "px";

  snow.style.left = Math.random() * 100 + "vw";

  const fallDuration = Math.random() * 5 + 4;
  const swayDuration = Math.random() * 3 + 2;

  snow.style.animationDuration = fallDuration + "s, " + swayDuration + "s";

  document.body.appendChild(snow);

  setTimeout(() => snow.remove(), fallDuration * 1000);
}

setInterval(createSnow, 120);
