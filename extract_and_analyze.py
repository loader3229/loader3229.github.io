
import cv2
import numpy as np
import os

VIDEO_PATH = '/workspace/static/6z.mp4'
OUTPUT_DIR = '/workspace/static/note_frames_v2'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Open video
cap = cv2.VideoCapture(VIDEO_PATH)
fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Video: {total_frames} frames, {fps} fps, duration: {total_frames/fps:.2f}s")

NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# First, let's scan through video and detect when notes change (left hand moves)
prev_frame = None
note_starts = []
frame_idx = 0
stable_frames = []
MIN_STABLE_FRAMES = 4

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    h, w = frame.shape[:2]
    roi = frame[0:h, 0:w]
    
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    
    if prev_frame is not None:
        diff = cv2.absdiff(gray, prev_frame)
        motion = np.mean(diff)
        
        if motion < 3.0:
            stable_frames.append(frame_idx)
        else:
            if len(stable_frames) >= MIN_STABLE_FRAMES:
                mid = stable_frames[len(stable_frames)//2]
                note_starts.append(mid)
            stable_frames = []
    
    prev_frame = gray
    frame_idx += 1

if len(stable_frames) >= MIN_STABLE_FRAMES:
    mid = stable_frames[len(stable_frames)//2]
    note_starts.append(mid)

cap.release()

print(f"\nDetected {len(note_starts)} stable note positions at frames: {note_starts}")

cap = cv2.VideoCapture(VIDEO_PATH)
frames_saved = []
for i, fnum in enumerate(note_starts):
    cap.set(cv2.CAP_PROP_POS_FRAMES, fnum)
    ret, frame = cap.read()
    if ret:
        outpath = os.path.join(OUTPUT_DIR, f'note_{i:02d}_f{fnum}.png')
        cv2.imwrite(outpath, frame)
        frames_saved.append((fnum, outpath))
        print(f"Saved note {i} (frame {fnum})")
cap.release()

print(f"\nSaved {len(frames_saved)} frames total")
