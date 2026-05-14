const stageSelect =
  document.getElementById("stage-select");

const memberSelect =
  document.getElementById("member-select");

const songSelect =
  document.getElementById("song-select");

const partsContainer =
  document.getElementById("parts-container");

let stagesData = [];
let currentStage = null;

/* =========================
   演目一覧読み込み
========================= */

fetch("data/stages.json")
  .then(r => r.json())
  .then(data => {

    stagesData = data;

    data.forEach(stage => {

      const option = document.createElement("option");

      option.value = stage.stageId;
      option.textContent = stage.stage;

      stageSelect.appendChild(option);

    });

  });

/* =========================
   描画関数
========================= */

function renderFormation() {

  partsContainer.innerHTML = "";

  if (!currentStage) return;
  if (!songSelect.value) return;

  fetch(`formations/${currentStage.stageId}/${songSelect.value}`)
    .then(r => r.json())
    .then(data => {

      if (!data.parts) return;

      const focusMember = memberSelect.value;

      data.parts.forEach(part => {

        const card = document.createElement("div");
        card.className = "part-card";

        card.innerHTML = `
          <h2 class="part-title">${part.title ?? ""}</h2>
          <div class="lyrics">${(part.lyrics ?? "").trim()}</div>
          <div class="formation-area"></div>
        `;

        const formationArea =
          card.querySelector(".formation-area");

        const members =
          part.members ?? [];

        /* =========================
           列数判定
        ========================= */

        const rows = Math.max(
          ...members.map(m => m.y ?? 0)
        );

        /* =========================
           ★サイズ制御（重要）
        ========================= */

        let aspect = 10; // 3列基準（固定）

        if (rows >= 5) {
          aspect = 12;   // 5列：拡張
        } else if (rows === 4) {
          aspect = 11;   // 4列：少し拡張
        } else {
          aspect = 10;   // 1〜3列：完全固定（ここ重要）
        }

        formationArea.style.aspectRatio =
          `16 / ${aspect}`;

        /* =========================
           メンバー描画
        ========================= */

        members.forEach(member => {

          const memberDiv =
            document.createElement("div");

          memberDiv.className = "member";

          const memberId = member.name;

          const isActive =
            memberId === focusMember;

          memberDiv.classList.add(
            isActive ? "active" : "sub"
          );

          /* =========================
             座標（完全固定）
          ========================= */

          const posX =
            50 + (member.x ?? 0) * 6;

          const posY =
            100 - (member.y ?? 0) * 18;

          memberDiv.style.left =
            `${posX}%`;

          memberDiv.style.top =
            `${posY}%`;

          /* =========================
             画像
          ========================= */

          const memberData =
            currentStage.members.find(
              m => m.id === memberId
            );

          const img =
            document.createElement("img");

          img.src =
            `images/members/${currentStage.stageId}/${memberData?.image ?? memberId}.PNG`;

          memberDiv.appendChild(img);

          /* =========================
             ラベル
          ========================= */

          if (isActive) {

            const label =
              document.createElement("div");

            label.className = "label";

            label.textContent =
              Math.abs(member.x ?? 0);

            memberDiv.appendChild(label);
          }

          formationArea.appendChild(memberDiv);

        });

        partsContainer.appendChild(card);

      });

    })
    .catch(err => {
      console.error("描画エラー:", err);
    });

}

/* =========================
   イベント
========================= */

stageSelect.addEventListener("change", async () => {

  memberSelect.innerHTML =
    '<option value="">メンバーを選択</option>';

  songSelect.innerHTML =
    '<option value="">楽曲を選択</option>';

  memberSelect.disabled = true;
  songSelect.disabled = true;

  partsContainer.innerHTML = "";

  const stageInfo =
    stagesData.find(s => s.stageId === stageSelect.value);

  if (!stageInfo) return;

  const response =
    await fetch(`data/${stageInfo.file}`);

  currentStage =
    await response.json();

  currentStage.members.forEach(member => {

    const option =
      document.createElement("option");

    option.value = member.id;
    option.textContent = member.name;

    memberSelect.appendChild(option);

  });

  memberSelect.disabled = false;

  currentStage.songs.forEach(song => {

    const option =
      document.createElement("option");

    option.value = song.file;
    option.textContent = song.name;

    songSelect.appendChild(option);

  });

  songSelect.disabled = false;

  renderFormation();

});

songSelect.addEventListener("change", renderFormation);
memberSelect.addEventListener("change", renderFormation);
