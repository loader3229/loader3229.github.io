import cv2
import numpy as np
import os

# 30fps的原始帧
frame_dir = '/workspace/static/orig_frames'
frames = sorted([f for f in os.listdir(frame_dir) if f.endswith('.png')])
print(f"Total frames: {len(frames)} (30fps, {len(frames)/30:.1f}s)")

# 让我用更好的方法检测音符变化：检测帧差（手移动时像素变化大）
# 计算连续帧之间的差异
os.makedirs('/workspace/static/note_frames', exist_ok=True)

# 读取所有帧到内存
all_frames = []
for f in frames:
    img = cv2.imread(os.path.join(frame_dir, f))
    all_frames.append(img)

# 计算指板区域的帧差
roi_x1, roi_x2 = 240, 480
roi_y1, roi_y2 = 100, 270

diffs = []
for i in range(1, len(all_frames)):
    prev = all_frames[i-1][roi_y1:roi_y2, roi_x1:roi_x2]
    curr = all_frames[i][roi_y1:roi_y2, roi_x1:roi_x2]
    diff = np.mean(np.abs(curr.astype(float) - prev.astype(float)))
    diffs.append(diff)

# 找出差异大的帧（手在移动 = 音符变化）
threshold = np.mean(diffs) + np.std(diffs) * 0.5
note_changes = []
for i, d in enumerate(diffs):
    if d > threshold:
        note_changes.append(i+1)  # 对应帧i+1

# 合并接近的变化点（同一移动过程）
min_gap = 8  # 至少间隔8帧
merged = []
for f in note_changes:
    if not merged or f - merged[-1] > min_gap:
        merged.append(f)

print(f"\nDetected {len(merged)} note change frames:")
for i, f in enumerate(merged):
    print(f"  Note {i+1}: frame {f} ({f/30:.2f}s)")

# 在每个音符变化后几帧取稳定位置（手移动完，按弦稳定）
note_stable_frames = []
for i, change_frame in enumerate(merged):
    # 取变化后3-4帧
    stable = min(change_frame + 4, len(all_frames)-1)
    note_stable_frames.append(stable)

print(f"\nStable frames for each note:")
for i, f in enumerate(note_stable_frames):
    print(f"  Note {i+1}: frame {f} ({f/30:.2f}s)")
    cv2.imwrite(f'/workspace/static/note_frames/note_{i+1:02d}_f{f}.png', all_frames[f])

# 让我也看看第一帧之前的起始位置
# 找到视频开始到第一个音符之间的稳定位置
first_note = merged[0] if merged else 30
start_stable = max(5, first_note - 10)
# 不对，应该在第一个变化之前
if merged:
    start_stable = merged[0] - 5
    cv2.imwrite(f'/workspace/static/note_frames/note_00_start_f{start_stable}.png', all_frames[start_stable])

print(f"\nSaved note frames to /workspace/static/note_frames/")
