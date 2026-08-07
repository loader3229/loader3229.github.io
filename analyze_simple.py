import cv2
import numpy as np
import os

NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

frame_dir = '/workspace/static/frames10'
frames = sorted([f for f in os.listdir(frame_dir) if f.endswith('.png')])

roi_x1, roi_x2 = 240, 480
roi_y1, roi_y2 = 100, 270

def get_fingertip(img):
    """检测按弦的指尖"""
    roi = img[roi_y1:roi_y2, roi_x1:roi_x2]
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    
    # 检测黑色手套
    lower_black = np.array([0, 0, 0])
    upper_black = np.array([180, 255, 70])
    mask_black = cv2.inRange(hsv, lower_black, upper_black)
    
    # 检测白色/浅色指尖
    lower_light = np.array([0, 0, 180])
    upper_light = np.array([180, 50, 255])
    mask_light = cv2.inRange(hsv, lower_light, upper_light)
    
    mask_hand = cv2.bitwise_or(mask_black, mask_light)
    kernel = np.ones((5,5), np.uint8)
    mask_hand = cv2.morphologyEx(mask_hand, cv2.MORPH_CLOSE, kernel)
    mask_hand = cv2.morphologyEx(mask_hand, cv2.MORPH_OPEN, kernel)
    
    contours, _ = cv2.findContours(mask_hand, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return None
    
    max_area = 0
    best_cnt = None
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > max_area:
            max_area = area
            best_cnt = cnt
    
    if best_cnt is None or max_area < 80:
        return None
    
    points = best_cnt.reshape(-1, 2)
    # 找最靠右的点（最靠近琴头方向的点 = 指尖）
    tip = max(points, key=lambda p: p[0])
    
    return (int(tip[0]) + roi_x1, int(tip[1]) + roi_y1)

# 分析所有帧
finger_history = []
for i, frame_name in enumerate(frames):
    img = cv2.imread(os.path.join(frame_dir, frame_name))
    tip = get_fingertip(img)
    if tip:
        finger_history.append({
            'frame': i,
            'time': i/10,
            'tip': tip
        })

print(f"Tracked finger in {len(finger_history)} frames")

# 找出静止的位置
positions = [f['tip'] for f in finger_history]
notes = []

if finger_history:
    current_pos = positions[0]
    note_start = 0
    min_note_duration = 3
    
    for i in range(1, len(positions)):
        dx = positions[i][0] - current_pos[0]
        dy = positions[i][1] - current_pos[1]
        dist = (dx*dx + dy*dy)**0.5
        
        if dist > 10:
            duration = i - note_start
            if duration >= min_note_duration:
                avg_x = int(np.mean([positions[j][0] for j in range(note_start, i)]))
                avg_y = int(np.mean([positions[j][1] for j in range(note_start, i)]))
                notes.append({
                    'start_frame': finger_history[note_start]['frame'],
                    'duration': duration/10,
                    'pos': (avg_x, avg_y)
                })
            current_pos = positions[i]
            note_start = i
    
    duration = len(positions) - note_start
    if duration >= min_note_duration:
        avg_x = int(np.mean([positions[j][0] for j in range(note_start, len(positions))]))
        avg_y = int(np.mean([positions[j][1] for j in range(note_start, len(positions))]))
        notes.append({
            'start_frame': finger_history[note_start]['frame'],
            'duration': duration/10,
            'pos': (avg_x, avg_y)
        })

print(f"\nDetected {len(notes)} notes:")
for i, note in enumerate(notes):
    print(f"  Note {i+1}: frame {note['start_frame']} ({note['duration']:.1f}s), pos={note['pos']}")

# 保存带标记的帧
os.makedirs('/workspace/static/notes', exist_ok=True)
for i, note in enumerate(notes):
    frame_idx = note['start_frame']
    if frame_idx < len(frames):
        img = cv2.imread(os.path.join(frame_dir, frames[frame_idx]))
        cv2.circle(img, note['pos'], 8, (0, 0, 255), -1)
        cv2.putText(img, str(i+1), (note['pos'][0]+10, note['pos'][1]), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,255), 2)
        cv2.imwrite(f'/workspace/static/notes/note_{i+1:02d}.png', img)

print("\nSaved to /workspace/static/notes/")

# 现在让我们手动分析指板几何
# 从之前的观测：
# 双星(12品)在大约 x=462-476 的位置
# 让我们看看所有音符位置相对于这两颗星的位置

print("\n=== Fretboard Analysis ===")
print("Double star (12th fret) at approx x=469, y=146")
print("Nut (fret 0) should be to the right of this")

# 吉他标准调弦：从最细(1弦)到最粗(6弦): E B G D A E
# 让我们看看音符的y坐标来确定弦
# 从图像看，指板是倾斜的
# 当手指在更上面的弦（y更小，更靠图片上方），是高音弦还是低音弦？

# 让我们输出音符位置并按x坐标排序（即按品位排序，从琴头向琴身）
print("\nNotes sorted by x position (right to left = fret 0 toward body):")
notes_sorted = sorted(notes, key=lambda n: -n['pos'][0])
for i, n in enumerate(notes_sorted):
    print(f"  pos={n['pos']}")
