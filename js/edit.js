let edited = false;

function updateButtons() {
  document.querySelector(".controls").style.display = edited ? "block" : "none";
}

function enableEditing(localData, filterData) {
  const tbody = document.querySelector("#giftTable tbody");

  tbody.addEventListener("click", (e) => {
    const td = e.target.closest("td");
    if (!td || td.querySelector("input")) return;

    const tr = td.parentElement;
    const index = [...tbody.children].indexOf(tr);
    const key = ["type","maker","name","price","url"][td.cellIndex];

    td.classList.add("editing");
    const input = document.createElement("input");
    input.type = "text";
    input.value = localData[index][key];
    input.style.width = "95%";

    td.innerHTML = "";
    td.appendChild(input);
    input.focus();

    const finish = () => {
      localData[index][key] = input.value;
      td.textContent = input.value;
      td.classList.remove("editing");
      edited = true;
      updateButtons();
    };

    input.addEventListener("blur", finish);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") input.blur();
    });
  });
}
