import cv2
import numpy as np
import os

def detect_stars(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 50, 255])
    mask = cv2.inRange(hsv, lower_white, upper_white)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    stars = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 10 and area < 250:
            M = cv2.moments(cnt)
            if M['m00'] > 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                stars.append((cx, cy, area))
    return stars

frame_dir = '/workspace/static/note_frames'
files = sorted(os.listdir(frame_dir))

print("Stars per frame:")
for f in files:
    img_path = os.path.join(frame_dir, f)
    img = cv2.imread(img_path)
    if img is None:
        continue
    stars = detect_stars(img)
    print(f"{f}: {len(stars)} stars")
