export function LoadingSequence() {
    let video = document.createElement("VIDEO");
    video.id = "loader";
    video.defaultMuted = true;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsinline = true;
    video.setAttribute('playsinline', '');

    let src = document.createElement("SOURCE");
    src.src = "videos/loading_300x300.mp4"; 
    src.type = "video/mp4";

    video.appendChild(src);

    document.body.appendChild(video);
    video.play();
}