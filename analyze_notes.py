import cv2
import numpy as np
import os

NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def get_note(string_open, fret):
    """string_open: 开放弦音名, fret: 品位"""
    base_idx = NOTES.index(string_open)
    return NOTES[(base_idx + fret) % 12]

frame_dir = '/workspace/static/frames10'
frames = sorted([f for f in os.listdir(frame_dir) if f.endswith('.png')])

# 吉他标准调弦 (6弦到1弦, 从粗到细):
# 6弦: E2 (低E)
# 5弦: A2
# 4弦: D3
# 3弦: G3
# 2弦: B3
# 1弦: E4 (高E)
# 在视频中，琴头在右上，所以最上面的弦应该是1弦(高E)还是6弦(低E)？

# 让我们先仔细分析指板几何
# 从第一帧开始分析

sample_img = cv2.imread(os.path.join(frame_dir, frames[0]))
h, w = sample_img.shape[:2]

# 让我先检测品记星星来确定品位坐标
# 白色星星在深色指板上应该很明显

def detect_stars(img):
    """检测白色星形品记"""
    # 提取指板区域（右侧区域）
    roi = img[:, 250:480, :]
    
    # 转换为灰度
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    
    # 二值化找亮的区域
    _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
    
    # 形态学操作去除噪点
    kernel = np.ones((2,2), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    stars = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 5 < area < 150:
            M = cv2.moments(cnt)
            if M['m00'] != 0:
                cx = int(M['m10'] / M['m00']) + 250  # 加回ROI偏移
                cy = int(M['m01'] / M['m00'])
                stars.append((cx, cy, area))
    
    return sorted(stars, key=lambda p: p[0])

# 测试检测星星
stars = detect_stars(sample_img)
print(f"Detected {len(stars)} star markers:")
for i, (x, y, area) in enumerate(stars):
    print(f"  Star {i+1}: ({x}, {y}), area={area:.0f}")

# 检测琴弦（深色线条沿着指板方向）
def detect_strings_and_frets(img):
    """尝试检测琴弦和品丝"""
    roi = img[:, 250:480, :]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    
    # 边缘检测
    edges = cv2.Canny(gray, 50, 150)
    
    # 霍夫直线检测
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=30, maxLineGap=10)
    
    if lines is not None:
        print(f"\nDetected {len(lines)} lines")
        # 分类为琴弦（沿指板方向）和品丝（垂直于指板）
    
    return edges

# 让我们用更简单的方法：检测黑色手套的位置随时间的变化
# 找出手指"按下"的时刻（位置稳定的时刻 = 正在弹一个音）

print("\n=== Tracking finger position across frames ===")

def get_finger_pos(img):
    """获取黑色手套的指尖位置"""
    # 指板区域
    roi_x1, roi_x2 = 250, 480
    roi_y1, roi_y2 = 120, 270
    
    roi = img[roi_y1:roi_y2, roi_x1:roi_x2, :]
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    
    # 检测黑色
    lower_black = np.array([0, 0, 0])
    upper_black = np.array([180, 255, 70])  # 更严格的黑色检测
    mask = cv2.inRange(hsv, lower_black, upper_black)
    
    # 形态学操作
    kernel = np.ones((3,3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return None
    
    # 找最大的黑色区域
    max_area = 0
    best_cnt = None
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > max_area:
            max_area = area
            best_cnt = cnt
    
    if best_cnt is None or max_area < 30:
        return None
    
    # 找最靠近指板的点（指尖应该在最右上方）
    # 获取轮廓中x+y最小(右上)的点作为指尖
    points = best_cnt.reshape(-1, 2)
    # 指尖应该是y较小（靠上）且x较大（靠右）的点
    # 实际上，按弦时指尖在品丝上方
    tip_point = min(points, key=lambda p: -p[0] + p[1])  # 右下方？不对，琴头在右上
    
    # 用质心作为参考
    M = cv2.moments(best_cnt)
    if M['m00'] != 0:
        cx = int(M['m10'] / M['m00']) + roi_x1
        cy = int(M['m01'] / M['m00']) + roi_y1
    else:
        cx, cy = tip_point[0] + roi_x1, tip_point[1] + roi_y1
    
    # 寻找最上方的点（y最小），这可能是指尖接触琴弦的位置
    top_point = min(points, key=lambda p: p[1])
    
    return {
        'centroid': (cx, cy),
        'tip': (top_point[0] + roi_x1, top_point[1] + roi_y1),
        'area': max_area
    }

# 记录每帧的手指位置
finger_history = []
for i, frame_name in enumerate(frames):
    img = cv2.imread(os.path.join(frame_dir, frame_name))
    pos = get_finger_pos(img)
    if pos:
        finger_history.append({
            'frame': i,
            'time': i/10,  # 10fps
            **pos
        })

print(f"Tracked finger in {len(finger_history)} frames")

# 找出静止的位置 = 音符
# 当指尖位置保持稳定时，表示正在按一个音
positions = [(f['tip'][0], f['tip'][1]) for f in finger_history]

# 简单的变化检测
notes = []
if finger_history:
    current_pos = positions[0]
    note_start = 0
    min_note_duration = 5  # 至少持续0.5秒（在10fps下是5帧）
    
    for i in range(1, len(positions)):
        dx = positions[i][0] - current_pos[0]
        dy = positions[i][1] - current_pos[1]
        dist = (dx*dx + dy*dy)**0.5
        
        if dist > 15:  # 位置变化足够大
            duration = i - note_start
            if duration >= min_note_duration:
                notes.append({
                    'start_frame': finger_history[note_start]['frame'],
                    'end_frame': finger_history[i]['frame'],
                    'duration': duration/10,
                    'pos': current_pos
                })
            current_pos = positions[i]
            note_start = i
    
    # 最后一个音
    duration = len(positions) - note_start
    if duration >= min_note_duration:
        notes.append({
            'start_frame': finger_history[note_start]['frame'],
            'end_frame': finger_history[-1]['frame'],
            'duration': duration/10,
            'pos': current_pos
        })

print(f"\nDetected {len(notes)} distinct note positions:")
for i, note in enumerate(notes):
    print(f"  Note {i+1}: frames {note['start_frame']}-{note['end_frame']} ({note['duration']:.1f}s), pos=({note['pos'][0]}, {note['pos'][1]})")

# 现在需要将像素坐标映射到吉他弦和品位
# 让我手动观察指板几何
# 从图片中可以看到：
# - 琴头(弦钮)在右上角，大约 x=465, y=100-180
# - 上弦枕(nut)应该在琴头左边
# - 白色星星是品记，通常在3,5,7,9,12品...

# 让我可视化几帧带标注的图片
os.makedirs('/workspace/static/analysis', exist_ok=True)

# 保存带标记的帧
for i, note in enumerate(notes):
    frame_idx = note['start_frame']
    if frame_idx < len(frames):
        img = cv2.imread(os.path.join(frame_dir, frames[frame_idx]))
        # 标记指尖位置
        cv2.circle(img, note['pos'], 8, (0, 0, 255), -1)
        cv2.putText(img, str(i+1), (note['pos'][0]+10, note['pos'][1]), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,255), 2)
        cv2.imwrite(f'/workspace/static/analysis/note_{i+1:02d}_pos{note["pos"]}.png', img)

print("\nAnnotated frames saved to /workspace/static/analysis/")

# 现在让我仔细看看第一帧中星星的位置来确定品位映射
# 吉他上常见的品记位置：
# 单星: 3, 5, 7, 9, 15, 17, 19, 21
# 双星: 12 (有时候24也是)
# 从0品(上弦枕)开始，到琴身方向品位数字增加

# 从视频图片观察，我看到几颗白星在指板上
# 让我查看一张更清晰的图来手动确定坐标

print("\n=== Manual mapping by visual inspection ===")
# 从图像观察：
# 琴头区域有弦钮，上弦枕大约在 x=455-460
# 向琴身(左下方)移动，品位数字增加
# 指板与水平方向有一个角度
# 琴弦大约6条，平行排列
