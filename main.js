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
  .then(response => response.json())
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
   描画関数（共通化＝即時更新の核）
========================= */

function renderFormation() {

  partsContainer.innerHTML = "";

  if (!currentStage) return;
  if (!songSelect.value) return;

  const file =
    songSelect.value;

  fetch(`formations/${currentStage.stageId}/${file}`)
    .then(r => r.json())
    .then(data => {

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
             フォーカス（ID統一）
          ========================= */

          const isActive =
            member.id === focusMember;

          memberDiv.classList.add(
            isActive ? "active" : "sub"
          );

          /* 座標 */

          const posX =
            50 + ((member.x ?? 0) * 5);

          const posY =
            92 - ((member.y ?? 0) * 18);

          memberDiv.style.left = `${posX}%`;
          memberDiv.style.top = `${posY}%`;

          /* メンバー情報 */

          const memberData =
            currentStage.members.find(
              m => m.id === member.id
            );

          const imgKey =
            memberData?.image ?? member.id;

          const image =
            document.createElement("img");

          // ★重要：PNG大文字維持
          image.src =
            `images/members/${currentStage.stageId}/${imgKey}.PNG`;

          image.alt =
            memberData?.name ?? member.id;

          memberDiv.appendChild(image);

          /* ラベル */

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

            const displayName =
              memberData?.display ??
              memberData?.name ??
              member.id;

            label.innerHTML =
              `${displayName}<br>${positionText}`;

            memberDiv.appendChild(label);

          }

          formationArea.appendChild(memberDiv);

        });

        partsContainer.appendChild(card);

      });

    })
    .catch(err => console.error(err));

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

  /* メンバー */

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

  /* 楽曲 */

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

  // ★自動描画（重要）
  renderFormation();

});

/* =========================
   ★即時切替（ここが追加部分）
========================= */

songSelect.addEventListener("change", renderFormation);
memberSelect.addEventListener("change", renderFormation);
