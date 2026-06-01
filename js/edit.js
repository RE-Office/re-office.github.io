let edited = false;

function updateButtons() {
  document.querySelector(".controls").style.display = edited ? "block" : "none";
}

function enableEditing(localData, filterData) {
  const tbody = document.querySelector("#giftTable tbody");

  tbody.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const saveBtn = e.target.closest(".save-row-btn");

    // 編集開始
    if (editBtn) {
      const tr = editBtn.closest("tr");
      const index = [...tbody.children].indexOf(tr);

      [...tr.children].forEach((td, i) => {
        if (i >= 5) return; // 編集・削除列は除外
        const key = ["type","maker","name","price","url"][i];

        const input = document.createElement("input");
        input.type = "text";
        input.value = localData[index][key];
        input.style.width = "95%";

        td.innerHTML = "";
        td.appendChild(input);
        td.classList.add("editing");
      });

      editBtn.textContent = "保存";
      editBtn.classList.remove("edit-btn");
      editBtn.classList.add("save-row-btn");
    }

    // 行保存
    if (saveBtn) {
      const tr = saveBtn.closest("tr");
      const index = [...tbody.children].indexOf(tr);

      [...tr.children].forEach((td, i) => {
        if (i >= 5) return;
        const key = ["type","maker","name","price","url"][i];
        const input = td.querySelector("input");
        if (input) {
          localData[index][key] = input.value;
          td.textContent = input.value;
          td.classList.remove("editing");
        }
      });

      saveBtn.textContent = "編集";
      saveBtn.classList.remove("save-row-btn");
      saveBtn.classList.add("edit-btn");

      edited = true;
      updateButtons();
      showToast("行を保存しました");
    }
  });
}
