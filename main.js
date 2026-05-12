songSelect.addEventListener("change", async () => {

  partsContainer.innerHTML = "";

  if (!currentStage) return;

  const response =
    await fetch(
      `formations/${currentStage.stageId}/${songSelect.value}`
    );

  const data =
    await response.json();

  const focusMember =
    memberSelect.value;

  /* パートごと */

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
        ${part.lyrics.trim()}
      </div>

      <div class="formation-area"></div>
    `;

    const formationArea =
      card.querySelector(".formation-area");

    /* メンバー描画 */

    part.members.forEach(member => {

      const memberDiv =
        document.createElement("div");

      memberDiv.className =
        "member";

      /* 強調（idベースで安定化） */

      if (member.name === focusMember) {
        memberDiv.classList.add("active");
      } else {
        memberDiv.classList.add("sub");
      }

      /* 座標 */

      const posX =
        50 + (member.x * 5);

      const posY =
        92 - (member.y * 18);

      memberDiv.style.left =
        `${posX}%`;

      memberDiv.style.top =
        `${posY}%`;

      /* メンバー情報取得（★ここ修正：nameで統一） */

      const memberData =
        currentStage.members.find(
          m => m.name === member.name
        );

      /* 画像 */

      const image =
        document.createElement("img");

      image.src =
        memberData
          ? `images/members/${currentStage.stageId}/${memberData.image}.PNG`
          : `images/members/${currentStage.stageId}/${member.name}.PNG`;

      image.alt =
        member.name;

      memberDiv.appendChild(image);

      /* ラベル（display優先） */

      if (member.name === focusMember) {

        const label =
          document.createElement("div");

        label.className =
          "label";

        let positionText = "";

        if (member.x < 0) {
          positionText = `下 ${Math.abs(member.x)}`;
        } else if (member.x > 0) {
          positionText = `上 ${member.x}`;
        } else {
          positionText = "0";
        }

        const displayName =
          memberData?.display ?? member.name;

        label.innerHTML = `
          ${displayName}<br>
          ${positionText}
        `;

        memberDiv.appendChild(label);

      }

      formationArea.appendChild(memberDiv);

    });

    partsContainer.appendChild(card);

  });

});
