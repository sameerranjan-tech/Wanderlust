const params = new URLSearchParams(window.location.search);
const currentCategory = params.get("category");

const filters = document.querySelectorAll(".filter-item");

filters.forEach((link) => {
  const category = link.getAttribute("data-category");

  if (
    (currentCategory && category === currentCategory) ||
    (!currentCategory && category === "All")
  ) {
    link.classList.add("active");
  }
});

const toggle = document.getElementById("taxToggle");
const prices = document.querySelectorAll(".price");

toggle.addEventListener("change", () => {
  prices.forEach((p) => {
    let basePrice = Number(p.getAttribute("data-price"));
    let finalPrice = Math.round(basePrice * 1.18);

    if (toggle.checked) {
      p.querySelector(".price-value").innerHTML =
        `Price: ₹${finalPrice.toLocaleString("en-IN")} <small style="color:green">(+18% GST)</small>`;
    } else {
      p.querySelector(".price-value").innerText =
        `Price: ₹${basePrice.toLocaleString("en-IN")}`;
    }
  });
});