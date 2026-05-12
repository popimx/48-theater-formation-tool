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
      stage => stage.stageId === stageSelect.value
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

});

/* =========================
   楽曲変更（完全修正版）
========================= */

songSelect.addEventListener("change", async () => {

  partsContainer.innerHTML = "";

  if (!currentStage) return;

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

      card.className =
        "part-card";

      card.innerHTML = `
        <h2 class="part-title">
          ${part.title ?? ""}
        </h2>

        <div class="lyrics">
          ${(part.lyrics ?? "").trim()}
        </div>

        <div class="formation-area"></div>
      `;

      const formationArea =
        card.querySelector(".formation-area");

      (part.members ?? []).forEach(member => {

        const memberDiv =
          document.createElement("div");

        memberDiv.className =
          "member";

        /* =========================
           ★修正ポイント（ここ重要）
           フォーカス判定はidで統一
        ========================= */

        const isActive =
          member.name === focusMember || member.id === focusMember;

        if (isActive) {
          memberDiv.classList.add("active");
        } else {
          memberDiv.classList.add("sub");
        }

        /* 座標 */

        const posX =
          50 + ((member.x ?? 0) * 5);

        const posY =
          92 - ((member.y ?? 0) * 18);

        memberDiv.style.left =
          `${posX}%`;

        memberDiv.style.top =
          `${posY}%`;

        /* メンバー情報（idで確実に紐付け） */

        const memberData =
          currentStage.members.find(
            m => m.id === member.name || m.id === member.id
          );

        const imgKey =
          memberData?.image ?? member.name;

        const image =
          document.createElement("img");

        image.src =
          `images/members/${currentStage.stageId}/${imgKey}.PNG`;

        image.alt =
          memberData?.name ?? member.name;

        memberDiv.appendChild(image);

        /* ラベル（フォーカスのみ） */

        if (isActive) {

          const label =
            document.createElement("div");

          label.className =
            "label";

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
            member.name;

          label.innerHTML =
            `${displayName}<br>${positionText}`;

          memberDiv.appendChild(label);

        }

        formationArea.appendChild(memberDiv);

      });

      partsContainer.appendChild(card);

    });

  } catch (err) {
    console.error(err);
  }

});
