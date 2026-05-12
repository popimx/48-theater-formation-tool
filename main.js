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

      const option =
        document.createElement("option");

      option.value =
        stage.stageId;

      option.textContent =
        stage.stage;

      stageSelect.appendChild(option);

    });

  });

/* =========================
   描画関数
========================= */

async function renderFormation() {

  partsContainer.innerHTML = "";

  if (!currentStage) return;
  if (!songSelect.value) return;

  try {

    const response =
      await fetch(
        `formations/${currentStage.stageId}/${songSelect.value}`
      );

    const data =
      await response.json();

    if (!data.parts) return;

    const focusMember =
      memberSelect.value;

    data.parts.forEach(part => {

      const card =
        document.createElement("div");

      card.className = "part-card";

      card.innerHTML = `
        <h2 class="part-title">${part.title ?? ""}</h2>
        <div class="lyrics">${(part.lyrics ?? "").trim()}</div>
        <div class="formation-area"></div>
      `;

      const formationArea =
        card.querySelector(".formation-area");

      (part.members ?? []).forEach(member => {

        const memberDiv =
          document.createElement("div");

        memberDiv.className = "member";

        /* =========================
           フォーカス
        ========================= */

        const isActive =
          member.id === focusMember;

        memberDiv.classList.add(
          isActive ? "active" : "sub"
        );

        /* =========================
           座標
        ========================= */

        const posX =
          50 + ((member.x ?? 0) * 5);

        const posY =
          92 - ((member.y ?? 0) * 18);

        memberDiv.style.left = `${posX}%`;
        memberDiv.style.top = `${posY}%`;

        /* =========================
           ★画像（ここが完全修正版）
        ========================= */

        const memberData =
          currentStage.members.find(
            m => m.id === member.id
          );

        const imgKey =
          memberData.image; // ← これだけ信じる（超重要）

        const image =
          document.createElement("img");

        image.src =
          `images/members/${currentStage.stageId}/${imgKey}.PNG`;

        image.alt =
          memberData?.name ?? member.id;

        memberDiv.appendChild(image);

        /* =========================
           ラベル
        ========================= */

        if (isActive) {

          const label =
            document.createElement("div");

          label.className = "label";

          let positionText = "";

          if ((member.x ?? 0) < 0) {
            positionText = `下 ${Math.abs(member.x)}`;
          } else if ((member.x ?? 0) > 0) {
            positionText = `上 ${member.x}`;
          } else {
            positionText = "0";
          }

          label.innerHTML =
            `${memberData.display ?? memberData.name}<br>${positionText}`;

          memberDiv.appendChild(label);

        }

        formationArea.appendChild(memberDiv);

      });

      partsContainer.appendChild(card);

    });

  } catch (err) {
    console.error(err);
  }
}

/* =========================
   演目変更
========================= */

stageSelect.addEventListener("change", () => {

  memberSelect.innerHTML =
    '<option value="">メンバーを選択</option>';

  songSelect.innerHTML =
    '<option value="">楽曲を選択</option>';

  memberSelect.disabled = true;
  songSelect.disabled = true;

  partsContainer.innerHTML = "";

  currentStage =
    stagesData.find(
      s => s.stageId === stageSelect.value
    );

  if (!currentStage) return;

  currentStage.members.forEach(member => {

    const option =
      document.createElement("option");

    option.value =
      member.id;

    option.textContent =
      `${member.name}ポジ`;

    memberSelect.appendChild(option);

  });

  memberSelect.disabled = false;

  currentStage.songs.forEach(song => {

    const option =
      document.createElement("option");

    option.value =
      song.file;

    option.textContent =
      song.name;

    songSelect.appendChild(option);

  });

  songSelect.disabled = false;

});

/* =========================
   即時更新（これ入れる）
========================= */

songSelect.addEventListener("change", renderFormation);
memberSelect.addEventListener("change", renderFormation);
