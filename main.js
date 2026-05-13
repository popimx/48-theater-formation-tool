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
   固定グリッド設定
========================= */

/* 横間隔 */
const GRID_X_STEP = 6;

/* 縦間隔（4列時基準で固定） */
const GRID_Y_STEP = 18;

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
           使用列数取得
        ========================= */

        const maxY = Math.max(
          ...(part.members ?? []).map(
            m => m.y ?? 1
          )
        );

        /* =========================
           エリア高さ
        ========================= */

        if (maxY <= 3) {

          formationArea.style.height =
            "320px";

        }

        else if (maxY === 4) {

          formationArea.style.height =
            "400px";

        }

        else {

          formationArea.style.height =
            "480px";

        }

        /* =========================
           上空白カット量
        ========================= */

        /*
          1〜3列
          → 上2列分だけ空白削除

          4列
          → 上1列分だけ空白削除

          5列
          → そのまま
        */

        let cropRows = 0;

        if (maxY <= 3) {

          cropRows = 2;

        }

        else if (maxY === 4) {

          cropRows = 1;

        }

        else {

          cropRows = 0;

        }

        const cropOffset =
          cropRows * GRID_Y_STEP;

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
          ========================= */

          const posX =
            50 +
            (
              (member.x ?? 0)
              * GRID_X_STEP
            );

          /*
             縦間隔は完全固定
             上の空白だけ削除
          */

          const posY =
            100 -
            (
              (member.y ?? 0)
              * GRID_Y_STEP
            ) +
            cropOffset;

          memberDiv.style.left =
            `${posX}%`;

          memberDiv.style.top =
            `${posY}%`;

          /* =========================
             メンバー情報
          ========================= */

          const memberData =
            currentStage.members.find(
              m =>
                m.id === memberId
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
