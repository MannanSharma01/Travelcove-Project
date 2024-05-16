let taxSwitch_input = document.querySelector(".tax-switch input");

taxSwitch_input.addEventListener("click", () => {

  let allPricesBT = document.querySelectorAll(".price-before-tax");
  let allPricesAT = document.querySelectorAll(".price-after-tax");
  let i;
  for(i=0; i<=allPricesBT.length -1; i++) {
    allPricesBT[i].classList.toggle("display-none");
    allPricesAT[i].classList.toggle("display-none");
  }
});