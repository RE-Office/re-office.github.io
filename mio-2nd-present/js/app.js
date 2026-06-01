const API = "https://script.google.com/macros/s/AKfycbzkJHQo-2Qih294C1xR8ROpnO_ouRCn9Rv5gN2kIf5kz5JAESccp7JbsFiNLzagXXfG-w/exec";

let originalData = [];
let localData = [];
let filteredData = [];
let sortState = {};
let edited = false;

/* ===========================
   テーブル描画
=========================== */
function renderTable(data) {
  const tbody = document.querySelector("#giftTable tbody");
  tbody.innerHTML = "";

  data.forEach((item, index) => {
    const tr = document.createElement("tr");

    ["type","maker","name","price","url"].forEach(key => {
      const td = document.createElement("td");

      if (key === "url") {
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

/* ===========================
   ソート
=========================== */
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

/* ===========================
   検索フィルタ
=========================== */
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

/* ===========================
   初期データ読み込み
=========================== */
(async () => {
  showLoading();

  const res = await fetch(API + "?t=" + Date.now());
  const data = await res.json();

  originalData = JSON.parse(JSON.stringify(data));
  localData = JSON.parse(JSON.stringify(data));
  filteredData = localData;

  renderTable(localData);
  enableEditing(localData, filterData);

  hideLoading();
})();

/* ===========================
   イベント
=========================== */
document.getElementById("searchBox").addEventListener("input", e => {
  filterData(e.target.value);
});

document.querySelectorAll("#giftTable th[data-key]").forEach(th => {
  th.addEventListener("click", () => {
    sortData(th.dataset.key);
  });
});

/* ===========================
   ★ 追加ボタン（商品名必須チェック）
=========================== */
document.getElementById("addBtn").addEventListener("click", () => {
  const type  = addType.value.trim();
  const maker = addMaker.value.trim();
  const name  = addName.value.trim();
  const price = addPrice.value.trim();
  const url   = addUrl.value.trim();

  // ★ 商品名が空なら追加拒否
  if (name === "") {
    showToast("商品名を入力してください", "error");
    return;
  }

  const item = { type, maker, name, price, url };

  localData.push(item);
  edited = true;
  updateButtons();
  filterData(document.getElementById("searchBox").value);

  showToast("追加しました");

  // 入力欄クリア
  clearAddFields();

  // 自動で閉じる
  addBox.classList.remove("open");
  toggleBtn.textContent = "＋ 追加";
});

/* ===========================
   キャンセル
=========================== */
document.getElementById("cancelBtn").addEventListener("click", () => {
  localData = JSON.parse(JSON.stringify(originalData));
  edited = false;
  updateButtons();
  filterData("");
  searchBox.value = "";

  showToast("キャンセルしました");
});

/* ===========================
   保存
=========================== */
document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    showLoading();

    await fetch(API, {
      method: "POST",
      body: JSON.stringify(localData)
    });

    showToast("保存しました");
    edited = false;
    updateButtons();

    // 再読み込み
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
    hideLoading();
  }
});

/* ===========================
   ローディング
=========================== */
function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

/* ===========================
   カウントダウン
=========================== */
function updateCountdown() {
  const box = document.getElementById("countdownBox");
  const now = new Date();

  let target = new Date(now.getFullYear(), 5, 21, 0, 0, 0);
  if (now > target) {
    target = new Date(now.getFullYear() + 1, 5, 21, 0, 0, 0);
  }

  const diff = target - now;

  if (diff <= 0) {
    box.classList.add("happy");
    box.textContent = "🎉 Happy Birthday 美桜！🎂";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  box.classList.remove("happy");

  box.innerHTML =
    `<span class="name">美桜</span>の` +
    `<span class="age">2歳</span>の` +
    `<span class="birthday">誕生日</span>まで：` +
    `<span class="num">${days}</span>日 ` +
    `<span class="num">${hours}</span>時間 ` +
    `<span class="num">${mins}</span>分 ` +
    `<span class="num">${secs}</span>秒`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ===========================
   追加フォーム開閉
=========================== */
const toggleBtn = document.getElementById("toggleAddBox");
const addBox = document.querySelector(".add-box");

toggleBtn.addEventListener("click", () => {
  addBox.classList.toggle("open");

  if (addBox.classList.contains("open")) {
    toggleBtn.textContent = "✕ 閉じる";
  } else {
    toggleBtn.textContent = "＋ 追加";
  }
});

/* ===========================
   入力欄クリア
=========================== */
function clearAddFields() {
  addType.value = "";
  addMaker.value = "";
  addName.value = "";
  addPrice.value = "";
  addUrl.value = "";
}

document.getElementById("clearBtn").addEventListener("click", clearAddFields);
