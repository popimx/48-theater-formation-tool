const stageSelect = document.getElementById("stage-select");
const positionSelect = document.getElementById("position-select");
const songSelect = document.getElementById("song-select");

const imageContainer = document.getElementById("image-container");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");

let indexData = [];
let currentData = null;

/* index.json 読み込み */

fetch("data/index.json")
  .then(response => response.json())
  .then(data => {

    indexData = data;

    data.forEach(stage => {

      const option = document.createElement("option");

      option.value = stage.stageId;
      option.textContent = stage.stage;

      stageSelect.appendChild(option);

    });

  });

/* 演目変更 */

stageSelect.addEventListener("change", () => {

  positionSelect.innerHTML =
    '<option value="">ポジションを選択</option>';

  songSelect.innerHTML =
    '<option value="">楽曲を選択</option>';

  positionSelect.disabled = true;
  songSelect.disabled = true;

  clearImage();

  const selectedStage = indexData.find(
    s => s.stageId === stageSelect.value
  );

  if (!selectedStage) return;

  selectedStage.positions.forEach(position => {

    const option = document.createElement("option");

    option.value = position.id;
    option.textContent = position.name;

    positionSelect.appendChild(option);

  });

  positionSelect.disabled = false;

});

/* ポジション変更 */

positionSelect.addEventListener("change", async () => {

  songSelect.innerHTML =
    '<option value="">楽曲を選択</option>';

  songSelect.disabled = true;

  clearImage();

  const fileName =
    `${stageSelect.value}_${positionSelect.value}.json`;

  const response =
    await fetch(`data/${fileName}`);

  currentData = await response.json();

  const songNames = [
    ...new Set(
      currentData.parts.map(part => part.song)
    )
  ];

  songNames.forEach(song => {

    const option = document.createElement("option");

    option.value = song;
    option.textContent = song;

    songSelect.appendChild(option);

  });

  songSelect.disabled = false;

});

/* 楽曲変更 */

songSelect.addEventListener("change", () => {

  clearImage();

  const selectedSong = songSelect.value;

  const filteredParts =
    currentData.parts.filter(
      part => part.song === selectedSong
    );

  imageContainer.innerHTML = "";

  filteredParts.forEach(part => {

    imageContainer.innerHTML += `

      <div class="image-card">

        <div class="song-name">
          ${part.song}
        </div>

        <h2 class="part-title">
          ${part.title}
        </h2>

        <div class="lyrics">
          ${part.lyrics}
        </div>

        <img
          src="${part.image}"
          class="formation-image"
          alt="${part.title}"
        >

      </div>

    `;

  });

  /* 画像クリック */

  document.querySelectorAll(".formation-image")
    .forEach(image => {

      image.addEventListener("click", () => {

        modalImage.src = image.src;

        modal.classList.add("active");

      });

    });

});

/* モーダル閉じる */

modal.addEventListener("click", () => {

  modal.classList.remove("active");

});

/* 初期化 */

function clearImage() {

  imageContainer.innerHTML = `
    <div id="empty-message">
      演目・ポジション・楽曲を選択してください
    </div>
  `;

}
