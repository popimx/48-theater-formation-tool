const stageSelect = document.getElementById("stage-select");
const positionSelect = document.getElementById("position-select");
const songSelect = document.getElementById("song-select");
const imageContainer = document.getElementById("image-container");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");

let data = [];

/* JSON読み込み */

fetch("data/stages.json")
  .then(response => response.json())
  .then(json => {

    data = json;

    /* 演目一覧 */

    data.forEach(stage => {

      const option = document.createElement("option");

      option.value = stage.stage;
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

  const selectedStage = data.find(
    s => s.stage === stageSelect.value
  );

  if (!selectedStage) return;

  selectedStage.positions.forEach(position => {

    const option = document.createElement("option");

    option.value = position.name;
    option.textContent = position.name;

    positionSelect.appendChild(option);

  });

  positionSelect.disabled = false;

});

/* ポジション変更 */

positionSelect.addEventListener("change", () => {

  songSelect.innerHTML =
    '<option value="">楽曲を選択</option>';

  songSelect.disabled = true;

  clearImage();

  const selectedStage = data.find(
    s => s.stage === stageSelect.value
  );

  if (!selectedStage) return;

  const selectedPosition = selectedStage.positions.find(
    p => p.name === positionSelect.value
  );

  if (!selectedPosition) return;

  selectedPosition.songs.forEach(song => {

    const option = document.createElement("option");

    option.value = song.title;
    option.textContent = song.title;

    songSelect.appendChild(option);

  });

  songSelect.disabled = false;

});

/* 楽曲変更 */

songSelect.addEventListener("change", () => {

  clearImage();

  const selectedStage = data.find(
    s => s.stage === stageSelect.value
  );

  if (!selectedStage) return;

  const selectedPosition = selectedStage.positions.find(
    p => p.name === positionSelect.value
  );

  if (!selectedPosition) return;

  const selectedSong = selectedPosition.songs.find(
    s => s.title === songSelect.value
  );

  if (!selectedSong) return;

  imageContainer.innerHTML = `
    <div class="image-card">

      <div class="song-title">
        ${selectedSong.title}
      </div>

      <img
        src="${selectedSong.image}"
        class="formation-image"
        alt="${selectedSong.title}"
      >

    </div>
  `;

  const image = document.querySelector(".formation-image");

  image.addEventListener("click", () => {

    modalImage.src = selectedSong.image;

    modal.classList.add("active");

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
