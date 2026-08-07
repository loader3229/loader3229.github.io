import cv2
import numpy as np
import os

# 让我找一个手指不在指板上的帧，或者找一个起始帧来完整观察指板
frame_dir = '/workspace/static/frames10'
frames = sorted([f for f in os.listdir(frame_dir) if f.endswith('.png')])

# 让我先查看整个视频的第一帧，找指板上的所有星星品记
# 从视觉上看，吉他指板是倾斜的，从左下(琴身)到右上(琴头)

# 先保存第一帧的高清分析
img = cv2.imread(os.path.join(frame_dir, frames[0]))
h, w = img.shape[:2]

# 让我检测指板区域内的所有高对比度点（星星和品丝）
# 指板是深棕色/黑色的，星星是白色的
roi_x1, roi_x2 = 240, 480
roi_y1, roi_y2 = 100, 270

roi = img[roi_y1:roi_y2, roi_x1:roi_x2]
gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

# 检测白色星星（在深色指板上的亮斑）
_, thresh_stars = cv2.threshold(gray, 160, 255, cv2.THRESH_BINARY)
contours_stars, _ = cv2.findContours(thresh_stars, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

stars = []
for cnt in contours_stars:
    area = cv2.contourArea(cnt)
    if 10 < area < 150:  # 星星大小
        M = cv2.moments(cnt)
        if M['m00'] != 0:
            cx = int(M['m10'] / M['m00']) + roi_x1
            cy = int(M['m01'] / M['m00']) + roi_y1
            # 检查是否在指板区域内（y在合理范围）
            if 120 < cy < 250:
                stars.append((cx, cy, area))

# 按x坐标从右到左排序(从琴头到琴身)
stars.sort(key=lambda p: -p[0])

print("Star markers (from nut/headstock toward body):")
for i, (x, y, area) in enumerate(stars):
    print(f"  Star {i+1}: x={x}, y={y}, area={area:.0f}")

# 在图上标记这些星星
img_marked = img.copy()
for i, (x, y, _) in enumerate(stars):
    cv2.circle(img_marked, (x, y), 6, (0, 255, 0), -1)
    cv2.putText(img_marked, str(i+1), (x-15, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0,255,0), 2)

cv2.imwrite('/workspace/static/analysis/fretboard_stars.png', img_marked)
print("\nSaved annotated fretboard to fretboard_stars.png")

# 现在让我检测品丝(金属条) - 这些是垂直于琴弦方向的亮线
# 它们应该大致是倾斜的，从左上到右下

# 让我用边缘检测来找品丝
blurred = cv2.GaussianBlur(gray, (3,3), 0)
edges = cv2.Canny(blurred, 30, 100)

# 霍夫直线检测
lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=30, minLineLength=40, maxLineGap=5)

fret_wires = []
if lines is not None:
    for line in lines:
        coords = line[0]
        x1, y1, x2, y2 = int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])
        x1 += roi_x1; x2 += roi_x1
        y1 += roi_y1; y2 += roi_y2
        # 计算角度 - 品丝应该有一个特定的角度范围
        angle = np.arctan2(y2-y1, x2-x1) * 180 / np.pi
        # 琴弦方向大约是从左下到右上，所以品丝应该是从左上到右下
        # 角度大概在 -30 到 -60 度 或 120 到 150 度
        if -70 < angle < -20 or 110 < angle < 160:
            length = ((x2-x1)**2 + (y2-y1)**2)**0.5
            if length > 50:
                fret_wires.append((x1, y1, x2, y2, angle, length))

print(f"\nDetected {len(fret_wires)} possible fret wires")

# 在图上画品丝
img_wires = img_marked.copy()
for i, (x1, y1, x2, y2, angle, length) in enumerate(fret_wires):
    cv2.line(img_wires, (x1,y1), (x2,y2), (0,0,255), 2)

cv2.imwrite('/workspace/static/analysis/fretboard_wires.png', img_wires)
print("Saved with fret wires to fretboard_wires.png")

# 现在让我更仔细地分析手指位置
# 问题：我之前检测的是黑色手套的顶部，但实际按弦的是指尖（白色/肉色的部分）
# 让我找白色指尖

def get_fingertip(img):
    """检测按弦的指尖（手指最靠近品丝的部分）"""
    roi = img[roi_y1:roi_y2, roi_x1:roi_x2]
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    
    # 检测手套的黑色
    lower_black = np.array([0, 0, 0])
    upper_black = np.array([180, 255, 80])
    mask_black = cv2.inRange(hsv, lower_black, upper_black)
    
    # 检测肤色/白色 - 指尖
    # 手是白色的（手套上的白色部分，或者卡通手的颜色）
    lower_skin = np.array([0, 20, 180])
    upper_skin = np.array([30, 150, 255])
    mask_skin = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # 合并黑色和肤色
    mask_hand = cv2.bitwise_or(mask_black, mask_skin)
    kernel = np.ones((5,5), np.uint8)
    mask_hand = cv2.morphologyEx(mask_hand, cv2.MORPH_CLOSE, kernel)
    mask_hand = cv2.morphologyEx(mask_hand, cv2.MORPH_OPEN, kernel)
    
    contours, _ = cv2.findContours(mask_hand, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return None
    
    # 找最大的手部区域
    max_area = 0
    best_cnt = None
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > max_area:
            max_area = area
            best_cnt = cnt
    
    if best_cnt is None or max_area < 100:
        return None
    
    # 找最靠近琴头(右上)的点 - 这应该是指尖
    points = best_cnt.reshape(-1, 2)
    # 在吉他上，按弦的指尖应该是最靠右(x最大)且y中等的点
    # 因为指板是倾斜的
    tip = max(points, key=lambda p: p[0] - 0.5*p[1])
    
    M = cv2.moments(best_cnt)
    if M['m00'] != 0:
        cx = int(M['m10'] / M['m00']) + roi_x1
        cy = int(M['m01'] / M['m00']) + roi_y1
    else:
        cx, cy = tip[0] + roi_x1, tip[1] + roi_y1
    
    return {
        'centroid': (cx, cy),
        'tip': (tip[0] + roi_x1, tip[1] + roi_y1),
        'area': max_area
    }

# 测试改进的检测
test_pos = get_fingertip(img)
if test_pos:
    print(f"\nTest detection - tip at: {test_pos['tip']}")
    cv2.circle(img_marked, test_pos['tip'], 8, (255, 0, 0), -1)
    cv2.imwrite('/workspace/static/analysis/finger_tip_test.png', img_marked)

# 现在让我分析所有帧的指尖位置
finger_history = []
for i, frame_name in enumerate(frames):
    img = cv2.imread(os.path.join(frame_dir, frame_name))
    pos = get_fingertip(img)
    if pos:
        finger_history.append({
            'frame': i,
            'time': i/10,
            **pos
        })

print(f"\nTracked finger in {len(finger_history)} frames")

# 找出静止的位置 = 正在按的音
positions = [f['tip'] for f in finger_history]
notes = []

if finger_history:
    current_pos = positions[0]
    note_start = 0
    min_note_duration = 4  # 0.4秒
    
    for i in range(1, len(positions)):
        dx = positions[i][0] - current_pos[0]
        dy = positions[i][1] - current_pos[1]
        dist = (dx*dx + dy*dy)**0.5
        
        if dist > 12:
            duration = i - note_start
            if duration >= min_note_duration:
                # 用该时间段内的平均位置
                avg_x = int(np.mean([positions[j][0] for j in range(note_start, i)]))
                avg_y = int(np.mean([positions[j][1] for j in range(note_start, i)]))
                notes.append({
                    'start_frame': finger_history[note_start]['frame'],
                    'end_frame': finger_history[i]['frame'],
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
            'end_frame': finger_history[-1]['frame'],
            'duration': duration/10,
            'pos': (avg_x, avg_y)
        })

print(f"\nDetected {len(notes)} notes:")
for i, note in enumerate(notes):
    print(f"  Note {i+1}: frames {note['start_frame']}-{note['end_frame']} ({note['duration']:.1f}s), pos={note['pos']}")

# 保存带标记的帧
os.makedirs('/workspace/static/analysis2', exist_ok=True)
for i, note in enumerate(notes):
    frame_idx = note['start_frame']
    if frame_idx < len(frames):
        img = cv2.imread(os.path.join(frame_dir, frames[frame_idx]))
        cv2.circle(img, note['pos'], 8, (0, 0, 255), -1)
        cv2.putText(img, str(i+1), (note['pos'][0]+10, note['pos'][1]), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,255), 2)
        cv2.imwrite(f'/workspace/static/analysis2/note_{i+1:02d}.png', img)

print("\nSaved annotated notes to analysis2/")
