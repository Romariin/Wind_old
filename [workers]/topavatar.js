const canvas = require("canvas");
const ordinal = require("ordinal");
const fs = require("fs");

//const { workerData, parentPort } = require("worker_threads");

const workerData = process.argv.slice(2);

const avatarUrl = workerData[0];

const rank = parseInt(workerData[1]);

const RESOURCES_PATH = __dirname + "/../[misc]/[topAvatar]";

(async () => {
    canvas.registerFont(RESOURCES_PATH + "/NasalizationRg-Regular.ttf", {
        family: "Nasalization Rg",
    });

    const avatarCanvas = new canvas.Canvas(256, 256, "image");
    const context = avatarCanvas.getContext("2d");

    const maskImg = await canvas.loadImage(RESOURCES_PATH + "/roundMask.png");
    const avatarImg = await canvas.loadImage(avatarUrl + "?size=256");
    const overlay = await canvas.loadImage(
        RESOURCES_PATH + "/circleOverlay.png"
    );
    const crown = await canvas.loadImage(RESOURCES_PATH + "/crown.png");

    // Dessine le masque noir
    context.drawImage(maskImg, 0, 0, 256, 256);

    // Dessine l'avatar dans le masque
    context.globalCompositeOperation = "source-in";
    context.drawImage(avatarImg, 0, 0, 256, 256);

    // Dessine la couronne si l'utilisateur est premier
    if (rank == 1) {
        context.globalCompositeOperation = "source-over";
        context.drawImage(crown, 0, 0, 256, 256);
    }

    // Dessine l'overlay rond
    context.globalCompositeOperation = "source-over";
    context.drawImage(overlay, 0, 0, 256, 256);

    // Ecrit le rank de l'utilisateur
    context.font =
        rank <= 9999 ? "33px 'Nasalization Rg'" : "24px 'Nasalization Rg'";
    context.textAlign = "center";
    context.fillStyle = "white";
    context.fillText(ordinal(rank), 256 / 2, rank <= 9999 ? 501 / 2 : 495 / 2);

    let canvasBuffer = avatarCanvas.toBuffer("image/png", {
        compressionLevel: 9,
    });

    process.send(canvasBuffer);
})();
