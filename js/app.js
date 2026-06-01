const API = "https://script.google.com/macros/s/AKfycbzkJHQo-2Qih294C1xR8ROpnO_ouRCn9Rv5gN2kIf5kz5JAESccp7JbsFiNLzagXXfG-w/exec";

let originalData = [];
let localData = [];
let filteredData = [];
let sortState = {};

function renderTable(data) {
  const tbody = document.querySelector("#giftTable tbody");
  tbody.innerHTML = "";

  data.forEach((item, index) => {
    const tr = document.createElement("tr");

  ["type","maker","name","price","url"].forEach(key => {
    const td = document.createElement("td");

    if (key === "url") {
      // 通常表示は「商品ページへ」
      const a = document.createElement("a");
      a.href = item[key];
      a.target = "_blank";
      a.textContent = "商品ページへ";
      td.appendChild(a);
    } else {
      td.textContent = item[key];
    }
    tr.appendChild(td);
  });


    // 編集ボタン
    const editTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.className = "edit-btn";
    editTd.appendChild(editBtn);
    tr.appendChild(editTd);

    // 削除ボタン
    const delTd = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.style.background = "#b71c1c";
    delBtn.style.color = "white";
    delBtn.style.border = "none";
    delBtn.style.padding = "6px 10px";
    delBtn.style.borderRadius = "6px";

    delBtn.addEventListener("click", () => {
      localData.splice(index, 1);
      edited = true;
      updateButtons();
      filterData(document.getElementById("searchBox").value);
      showToast("削除しました");
    });

    delTd.appendChild(delBtn);
    tr.appendChild(delTd);

    tbody.appendChild(tr);
  });
}

function sortData(key) {
  if (sortState.key === key) {
    sortState.order = sortState.order === "asc" ? "desc" : "asc";
  } else {
    sortState.key = key;
    sortState.order = "asc";
  }

  filteredData.sort((a, b) => {
    let x = a[key];
    let y = b[key];

    if (key === "price") {
      x = parseInt(x.replace(/[^0-9]/g, "")) || 0;
      y = parseInt(y.replace(/[^0-9]/g, "")) || 0;
    }

    if (x < y) return sortState.order === "asc" ? -1 : 1;
    if (x > y) return sortState.order === "asc" ? 1 : -1;
    return 0;
  });

  renderTable(filteredData);
}

function filterData(keyword) {
  keyword = keyword.toLowerCase();

  filteredData = localData.filter(item =>
    item.type.toLowerCase().includes(keyword) ||
    item.maker.toLowerCase().includes(keyword) ||
    item.name.toLowerCase().includes(keyword) ||
    item.price.toLowerCase().includes(keyword) ||
    item.url.toLowerCase().includes(keyword)
  );

  if (sortState.key) {
    sortData(sortState.key);
  } else {
    renderTable(filteredData);
  }
}

(async () => {
  const res = await fetch(API + "?t=" + Date.now());
  const data = await res.json();

  originalData = JSON.parse(JSON.stringify(data));
  localData = JSON.parse(JSON.stringify(data));
  filteredData = localData;

  renderTable(localData);
  enableEditing(localData, filterData);
})();

document.getElementById("searchBox").addEventListener("input", e => {
  filterData(e.target.value);
});

document.querySelectorAll("#giftTable th[data-key]").forEach(th => {
  th.addEventListener("click", () => {
    sortData(th.dataset.key);
  });
});

document.getElementById("addBtn").addEventListener("click", () => {
  const item = {
    type: addType.value,
    maker: addMaker.value,
    name: addName.value,
    price: addPrice.value,
    url: addUrl.value
  };

  localData.push(item);
  edited = true;
  updateButtons();
  filterData(document.getElementById("searchBox").value);

  showToast("追加しました");
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  localData = JSON.parse(JSON.stringify(originalData));
  edited = false;
  updateButtons();
  filterData("");
  searchBox.value = "";

  showToast("キャンセルしました");
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(localData)
    });

    edited = false;
    updateButtons();

    showToast("保存しました");
  } catch (err) {
    showToast("保存エラー");
  }
});
