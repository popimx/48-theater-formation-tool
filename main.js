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
   元の%座標を完全再現
========================= */

/*
  元コード

  left:
  50 + (x * 6)

  top:
  100 - (y * 18)

  を px 化
*/

/* formation-area 横幅基準 */
const AREA_WIDTH = 320;

/* formation-area 縦幅基準 */
const AREA_HEIGHT = 180;

/* % → px変換 */

const BASE_X =
  AREA_WIDTH * 0.5;

const X_STEP =
  AREA_WIDTH * 0.06;

const BASE_Y =
  AREA_HEIGHT * 1.0;

const Y_STEP =
  AREA_HEIGHT * 0.18;

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

      stageSelect.appendChild(
        option
      );

    });

  });

/* =========================
   描画関数
========================= */

function renderFormation() {

  partsContainer.innerHTML = "";

  if (!currentStage) return;
  if (!songSelect.value) return;

  fetch(
    `formations/${currentStage.stageId}/${songSelect.value}`
  )
    .then(r => r.json())
    .then(data => {

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
          card.querySelector(
            ".formation-area"
          );

        /* =========================
           使用列数
        ========================= */

        const maxY = Math.max(
          ...(part.members ?? []).map(
            m => m.y ?? 1
          )
        );

        const rows =
          Math.max(1, maxY);

        /* =========================
           上余白だけ削減
           （フォーメーションは固定）
        ========================= */

        if (rows <= 3) {

          formationArea.style.height =
            "220px";

        }

        else if (rows === 4) {

          formationArea.style.height =
            "300px";

        }

        else {

          formationArea.style.height =
            "380px";

        }

        /* =========================
           メンバー描画
        ========================= */

        (part.members ?? []).forEach(member => {

          const memberDiv =
            document.createElement(
              "div"
            );

          memberDiv.className =
            "member";

          const memberId =
            member.name;

          const isActive =
            memberId === focusMember;

          memberDiv.classList.add(
            isActive
              ? "active"
              : "sub"
          );

          /* =========================
             座標
             （完全固定）
          ========================= */

          const posX =
            BASE_X +
            (
              (member.x ?? 0)
              * X_STEP
            );

          const posY =
            BASE_Y -
            (
              (member.y ?? 0)
              * Y_STEP
            );

          memberDiv.style.left =
            `${posX}px`;

          memberDiv.style.top =
            `${posY}px`;

          /* =========================
             メンバー情報
          ========================= */

          const memberData =
            currentStage.members.find(
              m => m.id === memberId
            );

          /* =========================
             画像
          ========================= */

          const imgKey =
            memberData?.image
            ?? memberId;

          const img =
            document.createElement(
              "img"
            );

          img.src =
            `images/members/${currentStage.stageId}/${imgKey}.PNG`;

          img.alt =
            memberData?.name
            ?? memberId;

          img.onerror = () => {

            console.warn(
              "画像が見つからない:",
              img.src
            );

          };

          memberDiv.appendChild(
            img
          );

          /* =========================
             ラベル
          ========================= */

          if (isActive) {

            const label =
              document.createElement(
                "div"
              );

            label.className =
              "label";

            label.textContent =
              Math.abs(
                member.x ?? 0
              );

            memberDiv.appendChild(
              label
            );

          }

          formationArea.appendChild(
            memberDiv
          );

        });

        partsContainer.appendChild(
          card
        );

      });

    })
    .catch(err => {

      console.error(
        "描画エラー:",
        err
      );

    });

}

/* =========================
   演目変更
========================= */

stageSelect.addEventListener(
  "change",
  async () => {

    memberSelect.innerHTML =
      '<option value="">メンバーを選択</option>';

    songSelect.innerHTML =
      '<option value="">楽曲を選択</option>';

    memberSelect.disabled =
      true;

    songSelect.disabled =
      true;

    partsContainer.innerHTML =
      "";

    const stageInfo =
      stagesData.find(
        s =>
          s.stageId
          === stageSelect.value
      );

    if (!stageInfo) return;

    /* =========================
       演目データ読み込み
    ========================= */

    const response =
      await fetch(
        `data/${stageInfo.file}`
      );

    currentStage =
      await response.json();

    /* =========================
       メンバー
    ========================= */

    currentStage.members.forEach(
      member => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          member.id;

        option.textContent =
          member.name;

        memberSelect.appendChild(
          option
        );

      }
    );

    memberSelect.disabled =
      false;

    /* =========================
       楽曲
    ========================= */

    currentStage.songs.forEach(
      song => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          song.file;

        option.textContent =
          song.name;

        songSelect.appendChild(
          option
        );

      }
    );

    songSelect.disabled =
      false;

    renderFormation();

  }
);

/* =========================
   即時切替
========================= */

songSelect.addEventListener(
  "change",
  renderFormation
);

memberSelect.addEventListener(
  "change",
  renderFormation
);
