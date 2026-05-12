songSelect.addEventListener("change", async () => {

  partsContainer.innerHTML = "";

  if (!currentStage) return;

  try {

    const response =
      await fetch(
        `formations/${currentStage.stageId}/${songSelect.value}`
      );

    if (!response.ok) {
      throw new Error("formation JSON not found");
    }

    const data =
      await response.json();

    const focusMember =
      memberSelect.value;

    if (!data.parts) {
      console.error("partsが存在しません:", data);
      return;
    }

    /* パートごと */

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

      /* メンバー描画 */

      part.members.forEach(member => {

        const memberDiv =
          document.createElement("div");

        memberDiv.className =
          "member";

        /* ★フォーカス判定（安全版） */

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

        /* ★メンバー取得（idベース統一） */

        const memberData =
          currentStage.members.find(
            m => m.id === member.name
          );

        /* 画像 */

        const image =
          document.createElement("img");

        image.src =
          memberData
            ? `images/members/${currentStage.stageId}/${memberData.image}.PNG`
            : `images/members/${currentStage.stageId}/${member.name}.PNG`;

        image.alt =
          memberData?.name ?? member.name;

        memberDiv.appendChild(image);

        /* ラベル（フォーカスのみ） */

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
    console.error("エラー:", err);
  }

});
