import cv2
import numpy as np
import os

# 吉他标准调弦: 从6弦(最粗)到1弦(最细)
# 注意：视频中吉他是倾斜的，琴头在右上
# 标准调弦: E2(6弦), A2(5弦), D3(4弦), G3(3弦), B3(2弦), E4(1弦)
STRING_NOTES = ['E', 'B', 'G', 'D', 'A', 'E']  # 从最细(1弦)到最粗(6弦)？需要根据图像确定
# 半音顺序
NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def get_note(string_idx, fret, is_high_e_first=True):
    """
    string_idx: 0-5, 如果is_high_e_first=True, 0=1弦(最细,高音E)
    fret: 品位, 0=空弦
    """
    if is_high_e_first:
        # STRING_NOTES[0] = 'E' (1弦, 高音E)
        base_note = STRING_NOTES[string_idx]
    else:
        # 反过来
        base_note = ['E', 'A', 'D', 'G', 'B', 'E'][string_idx]
    base_idx = NOTES.index(base_note)
    note_idx = (base_idx + fret) % 12
    octave = 4 if string_idx <= 2 else (3 if string_idx <= 4 else 2)
    if base_note in ['A', 'B'] and string_idx > 2:
        octave = 2
    if base_note == 'E' and string_idx == 5:
        octave = 2
    if base_note == 'E' and string_idx == 0:
        octave = 4
    if base_note == 'B':
        octave = 3
    if base_note == 'G':
        octave = 3
    if base_note == 'D':
        octave = 3
    if base_note == 'A':
        octave = 2
    return NOTES[note_idx]

# 先查看一帧来确定坐标
frame_dir = '/workspace/static/frames10'
frames = sorted([f for f in os.listdir(frame_dir) if f.endswith('.png')])
print(f"Total frames: {len(frames)}")

# 先读取第一帧，看看指板区域
img = cv2.imread(os.path.join(frame_dir, frames[0]))
h, w = img.shape[:2]
print(f"Frame size: {w}x{h}")

# 吉他指板大概在右侧区域
# 让我们做简单的颜色检测来找手指(黑色手套)和按弦位置
# 黑色手套: 低亮度
# 琴弦: 深色线
# 品位丝: 金属色横线
# 品记: 白色星星

# 让我用更简单的方法 - 检测每帧中黑色手套(手指)的位置
# 然后看看手指是否在"按弦"状态(接触指板)

def detect_finger_position(img):
    """检测手指(黑色)在指板上的位置"""
    # 转换为HSV来检测黑色
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 指板区域大概是: x从250到480, y从100到270
    # 我们需要更精确地定位
    
    # 检测黑色(手套)
    lower_black = np.array([0, 0, 0])
    upper_black = np.array([180, 255, 80])
    mask_black = cv2.inRange(hsv, lower_black, upper_black)
    
    # 检测白色/银色品记星星
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 30, 255])
    mask_white = cv2.inRange(hsv, lower_white, upper_white)
    
    # 找到黑色区域的轮廓
    contours, _ = cv2.findContours(mask_black, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    finger_positions = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 50:  # 过滤小噪点
            M = cv2.moments(cnt)
            if M['m00'] != 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                finger_positions.append((cx, cy, area))
    
    # 找白色星星的位置作为参考
    white_contours, _ = cv2.findContours(mask_white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    star_positions = []
    for cnt in white_contours:
        area = cv2.contourArea(cnt)
        if 10 < area < 200:  # 星星大小
            M = cv2.moments(cnt)
            if M['m00'] != 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                star_positions.append((cx, cy))
    
    return finger_positions, star_positions

# 分析所有帧，记录手指位置变化
print("\nAnalyzing frames for finger positions...")

# 先获取星星(品记)的参考位置
finger_positions_over_time = []
star_positions_ref = None

for i, frame_name in enumerate(frames):
    img = cv2.imread(os.path.join(frame_dir, frame_name))
    fingers, stars = detect_finger_position(img)
    
    if stars and star_positions_ref is None:
        star_positions_ref = sorted(stars, key=lambda p: p[0])
        print(f"Reference star positions (from frame {i}):")
        for s in star_positions_ref:
            print(f"  ({s[0]}, {s[1]})")
    
    if fingers:
        # 取最大的黑色区域(手套)
        fingers.sort(key=lambda x: x[2], reverse=True)
        finger_positions_over_time.append((i, fingers[0][0], fingers[0][1]))

print(f"\nDetected finger in {len(finger_positions_over_time)} frames")

# 让我保存几帧带标注的图片来验证
os.makedirs('/workspace/static/annotated', exist_ok=True)
for i in [0, 5, 10, 15, 20, 25, 30, 40, 50]:
    if i < len(frames):
        img = cv2.imread(os.path.join(frame_dir, frames[i]))
        fingers, stars = detect_finger_position(img)
        for f in fingers:
            cv2.circle(img, (f[0], f[1]), 5, (0, 255, 0), -1)
        for s in stars:
            cv2.circle(img, (s[0], s[1]), 5, (0, 0, 255), -1)
        cv2.imwrite(f'/workspace/static/annotated/frame_{i:04d}.png', img)

print("Annotated frames saved to /workspace/static/annotated/")
