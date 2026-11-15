"""Create the site's real-app images and videos without changing the originals.

python scripts/prepare_app_media.py --source E:/iFastDesk/素材 --ffmpeg /path/to/ffmpeg.exe
Requires Pillow; imageio-ffmpeg can supply ffmpeg when --ffmpeg is omitted.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "media" / "app"
IMAGES = {
    "desktop-dark": "截图深色大屏9b.png",
    "desktop-light": "截图浅色大屏9b.png",
    "cards-dark-six": "截图深色6宫格仅主界面.png",
    "cards-dark-nine": "截图深色9宫格仅主界面.png",
    "cards-light-six": "截图浅色6宫格仅主界面.png",
    "cards-light-nine": "截图浅色9宫格仅主界面.png",
    "time-files": "时光文件-最近修改的文件显示 即时找到.png",
    "desktop-folders": "桌面文件设置入卡片.png",
}
VIDEOS = {
    "show-hide": "动画-移入移出-悬浮桌面2.mp4",
    "rearrange-cards": "动画-卡片面板换位-设置操作 (2).mp4",
    "first-setup": "动画-卡片设置-自定义卡片-首次使用-设置收藏连接文件夹.mp4",
    "split-view": "动画-分屏操作.mp4",
    "bind-folder": "视频-设置文件夹.mp4",
    "file-actions": "视频-新建文件编辑移动删除操作.mp4",
    "sort-apps": "视频-应用图标自己排序.mp4",
    "full-tour": "视频-全部演示.mp4",
}


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def prepare_image(item: tuple[str, str], source: Path) -> tuple[str, dict]:
    slug, filename = item
    with Image.open(source / filename) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        widths = sorted({min(w, image.width) for w in (480, 960, 1600)})
        variants = []
        for width in widths:
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            webp = OUTPUT / f"{slug}-{width}.webp"
            jpeg = OUTPUT / f"{slug}-{width}.jpg"
            # UI-only screenshots keep every original text pixel at full size.
            lossless = image.width == 990 and width == image.width
            resized.save(webp, "WEBP", lossless=lossless, quality=92, method=6)
            resized.save(jpeg, "JPEG", quality=92, subsampling=0, optimize=True)
            variants.append({"width": width, "height": height,
                             "webp": relative(webp), "jpeg": relative(jpeg),
                             "webp_bytes": webp.stat().st_size})
    return slug, {"source": filename, "width": image.width, "height": image.height,
                  "variants": variants, "full": variants[-1]["webp"],
                  "fallback": variants[-1]["jpeg"]}


def run(ffmpeg: str, arguments: list[str]) -> None:
    result = subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", *arguments],
                            capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode:
        raise RuntimeError(result.stderr)


def prepare_video(item: tuple[str, str], source: Path, ffmpeg: str) -> tuple[str, dict]:
    slug, filename = item
    output_slug = "rearrange-cards-v2" if slug == "rearrange-cards" else slug
    original = source / filename
    probe = subprocess.run([ffmpeg, "-hide_banner", "-i", str(original)],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
    match = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", probe.stderr)
    if not match:
        raise RuntimeError(f"Cannot read duration: {filename}")
    hours, minutes, seconds = map(float, match.groups())
    duration = hours * 3600 + minutes * 60 + seconds
    # Preserve the complete recording. At 24 fps mouse movements remain easy to follow.
    # Cap at 1600 px, retain aspect ratio, and never enlarge the source.
    scale = "scale='min(1600,iw)':-2:flags=lanczos,setsar=1"
    mp4 = OUTPUT / f"{output_slug}.mp4"
    run(ffmpeg, ["-i", str(original), "-an", "-vf", scale, "-r", "24",
                 "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-pix_fmt", "yuv420p",
                 "-movflags", "+faststart", "-threads", "2", str(mp4)])
    poster_png = OUTPUT / f"{output_slug}-poster.png"
    run(ffmpeg, ["-ss", str(min(1.0, duration / 4)), "-i", str(mp4),
                 "-frames:v", "1", str(poster_png)])
    with Image.open(poster_png) as poster:
        width, height = poster.size
        poster_path = OUTPUT / f"{output_slug}-poster.webp"
        poster.save(poster_path, "WEBP", quality=90, method=6)
        poster_jpeg = OUTPUT / f"{output_slug}-poster.jpg"
        poster.convert("RGB").save(poster_jpeg, "JPEG", quality=88, optimize=True)
    poster_png.unlink()
    print(f"video {slug}: {width}x{height}, {duration:.1f}s, {mp4.stat().st_size / 1048576:.2f} MiB", flush=True)
    return slug, {"source": filename, "width": width, "height": height,
                  "duration": round(duration, 2), "mp4": relative(mp4),
                  "bytes": mp4.stat().st_size, "source_bytes": original.stat().st_size,
                  "poster": relative(poster_path), "poster_fallback": relative(poster_jpeg)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--images-only", action="store_true")
    parser.add_argument("--video", choices=VIDEOS, help="Regenerate one video and keep the other assets.")
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if args.video and args.images_only:
        parser.error("--video and --images-only cannot be combined")
    selected_videos = {args.video: VIDEOS[args.video]} if args.video else VIDEOS
    required = [VIDEOS[args.video]] if args.video else list(IMAGES.values()) + ([] if args.images_only else list(VIDEOS.values()))
    missing = [name for name in required if not (args.source / name).is_file()]
    if missing:
        raise SystemExit(f"Missing source files: {missing}")
    path = ROOT / "_data" / "app_media.json"
    manifest = {"images": {}, "videos": {}}
    if args.video:
        if not path.is_file():
            parser.error("A media manifest is required for --video")
        manifest = json.loads(path.read_text(encoding="utf-8"))
    elif args.images_only and path.is_file():
        manifest["videos"] = json.loads(path.read_text(encoding="utf-8"))["videos"]
    for item in ([] if args.video else IMAGES.items()):
        slug, data = prepare_image(item, args.source)
        manifest["images"][slug] = data
        print(f"image {slug}: {data['width']}x{data['height']}", flush=True)
    if not args.images_only:
        ffmpeg = args.ffmpeg
        if not ffmpeg:
            import imageio_ffmpeg
            ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = executor.map(lambda item: prepare_video(item, args.source, ffmpeg), selected_videos.items())
            for slug, data in results:
                manifest["videos"][slug] = data
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Manifest: {path}")


if __name__ == "__main__":
    main()
