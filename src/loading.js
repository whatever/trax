export function LoadingSequence() {
    let video = document.createElement("VIDEO");
    video.defaultMuted = "defaultMuted";
    video.loop = "loop";
    video.autoplay = "autoplay";
    video.playsinline = "playsinline";
    video.id = "loader";
    video.src = "videos/loading_300x300.mp4"; 
    document.body.appendChild(video);
}