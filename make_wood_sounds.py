import os
import subprocess

dest = "public/assets/sounds/chess"
os.makedirs(dest, exist_ok=True)

def make_sound(name, freq, dur):
    wav = os.path.join(dest, f"{name}.wav")
    mp3 = os.path.join(dest, f"{name}.mp3")

    # bruit blanc + tonalité basse = bruit de pièce sur bois
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-f", "lavfi", "-i", f"anoisesrc=a=0.02:c=white:d={dur}",
        "-f", "lavfi", "-i", f"sine=f={freq}:d={dur}",
        "-filter_complex",
        "[0][1]amix=inputs=2:duration=shortest,volume=6,highpass=f=150,lowpass=f=4000,aecho=0.6:0.4:10:0.5",
        "-t", str(dur), "-y", wav
    ]
    subprocess.run(cmd)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", wav, "-codec:a", "libmp3lame", "-q:a", "3", mp3])
    os.remove(wav)

print("🎵 Création des sons boisés…")
make_sound("move",       180, 0.22)
make_sound("capture",    160, 0.28)
make_sound("illegal",    220, 0.20)
make_sound("check",      250, 0.25)
make_sound("checkmate",  130, 0.35)
make_sound("draw",       190, 0.30)
print("✅ Pack généré dans", dest)
