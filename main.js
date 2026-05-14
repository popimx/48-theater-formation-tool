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

        /* =========================
           列数判定
        ========================= */

        const maxY = Math.max(
          ...(part.members ?? []).map(m => m.y ?? 1)
        );

        const rows = Math.max(1, maxY);

        formationArea.classList.remove(
          "rows-1",
          "rows-2",
          "rows-3",
          "rows-4"
        );

        if (rows >= 5) {
          // 5列はデフォルト（何もしない）
        }
        else if (rows === 4) {
          formationArea.classList.add("rows-4");
        }
        else {
          formationArea.classList.add("rows-3");
        }

        /* =========================
           メンバー描画（完全固定）
        ========================= */

        (part.members ?? []).forEach(member => {

          const memberDiv =
            document.createElement("div");

          memberDiv.className = "member";

          const memberId = member.name;

          const isActive =
            memberId === focusMember;

          memberDiv.classList.add(
            isActive ? "active" : "sub"
          );

          /* ★ここは絶対固定（触らない） */
          const posX =
            50 + ((member.x ?? 0) * 6);

          const posY =
            100 - ((member.y ?? 0) * 18);

          memberDiv.style.left = `${posX}%`;
          memberDiv.style.top = `${posY}%`;

          const memberData =
            currentStage.members.find(
              m => m.id === memberId
            );

          const imgKey =
            memberData?.image ?? memberId;

          const img =
            document.createElement("img");

          img.src =
            `images/members/${currentStage.stageId}/${imgKey}.PNG`;

          img.alt =
            memberData?.name ?? memberId;

          memberDiv.appendChild(img);

          if (isActive) {
            const label = document.createElement("div");
            label.className = "label";
            label.textContent = Math.abs(member.x ?? 0);
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

  memberSelect.innerHTML = '<option value="">メンバーを選択</option>';
  songSelect.innerHTML = '<option value="">楽曲を選択</option>';

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
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    memberSelect.appendChild(option);
  });

  memberSelect.disabled = false;

  currentStage.songs.forEach(song => {
    const option = document.createElement("option");
    option.value = song.file;
    option.textContent = song.name;
    songSelect.appendChild(option);
  });

  songSelect.disabled = false;

  renderFormation();
});

songSelect.addEventListener("change", renderFormation);
memberSelect.addEventListener("change", renderFormation);
