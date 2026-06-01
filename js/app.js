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
  showLoading();   // ← ここに追加

  const res = await fetch(API + "?t=" + Date.now());
  const data = await res.json();

  originalData = JSON.parse(JSON.stringify(data));
  localData = JSON.parse(JSON.stringify(data));
  filteredData = localData;

  renderTable(localData);
  enableEditing(localData, filterData);

  hideLoading();   // ← ここに追加
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
    showLoading();   // ← ここに追加

    await fetch(API, {
      method: "POST",
      body: JSON.stringify(localData)
    });

    showToast("保存しました");
    edited = false;
    updateButtons();

    // 🔥 再読み込み
    const res2 = await fetch(API + "?t=" + Date.now());
    const newData = await res2.json();

    originalData = JSON.parse(JSON.stringify(newData));
    localData = JSON.parse(JSON.stringify(newData));
    filteredData = localData;

    renderTable(localData);
    enableEditing(localData, filterData);

  } catch (err) {
    showToast("保存エラー");
  } finally {
    hideLoading();   // ← ここに追加
  }
});


function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

function updateCountdown() {
  const box = document.getElementById("countdownBox");
  const now = new Date();

  // 誕生日（今年）
  let target = new Date(now.getFullYear(), 5, 21, 0, 0, 0); 
  // 月は 0=1月 → 5=6月

  // 誕生日を過ぎていたら来年
  if (now > target) {
    target = new Date(now.getFullYear() + 1, 5, 21, 0, 0, 0);
  }

  const diff = target - now;

  // 誕生日当日（0秒以下）
  if (diff <= 0) {
    box.classList.add("happy");
    box.textContent = "🎉 Happy Birthday 美桜！🎂";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  // 数字に .num を付けてアニメさせる
  box.classList.remove("happy");
  box.innerHTML =
    `美桜の2歳の誕生日まで：` +
    `<span class="num">${days}</span>日 ` +
    `<span class="num">${hours}</span>時間 ` +
    `<span class="num">${mins}</span>分 ` +
    `<span class="num">${secs}</span>秒`;
}

// 1秒ごとに更新
setInterval(updateCountdown, 1000);
updateCountdown();

