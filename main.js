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

/* 演目一覧 */

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

/* 演目変更 */

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
      stage =>
        stage.stageId === stageSelect.value
    );

  if (!currentStage) return;

  /* メンバー */

  currentStage.members.forEach(member => {

    const option =
      document.createElement("option");

    option.value =
      member.id;

    option.textContent =
      member.name;

    memberSelect.appendChild(option);

  });

  memberSelect.disabled = false;

});

/* メンバー変更 */

memberSelect.addEventListener("change", () => {

  songSelect.innerHTML =
    '<option value="">楽曲を選択</option>';

  songSelect.disabled = true;

  partsContainer.innerHTML = "";

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

/* 楽曲変更 */

songSelect.addEventListener("change", async () => {

  partsContainer.innerHTML = "";

  const response =
    await fetch(
      `formations/${currentStage.stageId}/${songSelect.value}`
    );

  const data =
    await response.json();

  const focusMember =
    memberSelect.value;

  data.parts.forEach(part => {

    const card =
      document.createElement("div");

    card.className =
      "part-card";

    card.innerHTML = `
      <h2 class="part-title">
        ${part.title}
      </h2>

      <div class="lyrics">
        ${part.lyrics}
      </div>

      <div class="formation-area"></div>
    `;

    const formationArea =
      card.querySelector(".formation-area");

    part.members.forEach(member => {

      const memberDiv =
        document.createElement("div");

      memberDiv.className =
        "member";

      if (member.name === focusMember) {

        memberDiv.classList.add("active");

      } else {

        memberDiv.classList.add("sub");

      }

      const posX =
        50 + (member.x * 5);

      const posY =
        92 - (member.y * 18);

      memberDiv.style.left =
        `${posX}%`;

      memberDiv.style.top =
        `${posY}%`;

      const image =
        document.createElement("img");

      image.src =
        `images/members/${member.name}.webp`;

      memberDiv.appendChild(image);

      /* ラベル */

      if (member.name === focusMember) {

        const label =
          document.createElement("div");

        label.className =
          "label";

        let positionText = "";

        if (member.x < 0) {

          positionText =
            `下 ${Math.abs(member.x)}`;

        } else if (member.x > 0) {

          positionText =
            `上 ${member.x}`;

        } else {

          positionText =
            "0";

        }

        label.innerHTML = `
          ${member.name}<br>
          ${positionText}
        `;

        memberDiv.appendChild(label);

      }

      formationArea.appendChild(memberDiv);

    });

    partsContainer.appendChild(card);

  });

});
