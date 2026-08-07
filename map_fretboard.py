
import cv2
import numpy as np
import os

def detect_stars(img):
    """Detect white star inlays on the fretboard."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 50, 255])
    mask = cv2.inRange(hsv, lower_white, upper_white)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    stars = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 10 &lt; area &lt; 250:
            M = cv2.moments(cnt)
            if M['m00'] &gt; 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                stars.append((cx, cy, area))
    return stars

def detect_fretboard(img):
    """Detect the dark fretboard region."""
    h, w = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # Dark wood/green color for fretboard
    lower_dark = np.array([20, 20, 10])
    upper_dark = np.array([100, 180, 120])
    mask = cv2.inRange(hsv, lower_dark, upper_dark)
    
    # Find large contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        # Merge nearby large contours
        valid = [c for c in contours if cv2.contourArea(c) &gt; 500]
        if valid:
            # Get combined bounding box
            x_min = y_min = float('inf')
            x_max = y_max = 0
            for c in valid:
                x, y, bw, bh = cv2.boundingRect(c)
                x_min = min(x_min, x)
                y_min = min(y_min, y)
                x_max = max(x_max, x + bw)
                y_max = max(y_max, y + bh)
            return (x_min, y_min, x_max - x_min, y_max - y_min)
    return None

def detect_strings(img, roi):
    """Detect the 6 guitar strings as bright lines."""
    x, y, w, h = roi
    fb_roi = img[y:y+h, x:x+w]
    gray = cv2.cvtColor(fb_roi, cv2.COLOR_BGR2GRAY)
    
    # Strings are horizontal bright lines (in ROI coordinates, but remember fretboard is angled!)
    # Let's look for them by scanning horizontally for bright thin lines
    # Actually let's use edge detection then Hough or just find peaks in row brightness
    from scipy.signal import find_peaks
    
    # Average along horizontal direction to find horizontal bright lines
    row_avg = np.mean(gray, axis=1)
    
    # Find peaks (strings)
    peaks, props = find_peaks(row_avg, height=20, distance=6, prominence=4)
    if len(peaks) &gt;= 6:
        # Take top 6 brightest peaks
        peaks = sorted(peaks, key=lambda p: -row_avg[p])[:6]
        peaks.sort()
    
    return [y + p for p in peaks]

# Let's look at a frame where hand is at highest position (most stars visible)
# Let's check multiple frames from note_frames (original)
frame_dir = '/workspace/static/note_frames'
files = sorted(os.listdir(frame_dir))

# First, let's find a frame with the hand far to the left (low position/high fret number, showing 12th fret double stars)
low_fret_imgs = []
high_fret_imgs = []
for f in files:
    if 'f1' in f and 'f10' not in f and 'f17' not in f and 'f18' not in f and 'f19' not in f:  # f2xx, f3xx... are lower positions?
        pass
    img_path = os.path.join(frame_dir, f)
    img = cv2.imread(img_path)
    if img is None:
        continue
    stars = detect_stars(img)
    print(f"{f}: {len(stars)} stars")

print("\n=== Examining first frame (note_00) ===")
first_path = os.path.join(frame_dir, 'note_00_start_f10.png')
if os.path.exists(first_path):
    img0 = cv2.imread(first_path)
    if img0 is not None:
        h, w = img0.shape[:2]
        print(f"Image size: {w}x{h}")
        stars0 = detect_stars(img0)
        stars0.sort(key=lambda s: -s[0])  # Sort by x descending
        print("Stars (right to left):")
        for i, (x, y, a) in enumerate(stars0):
            print(f"  {i}: x={x}, y={y}, area={a:.1f}")
        
        fb = detect_fretboard(img0)
        print(f"Fretboard ROI: {fb}")
        
        if fb:
            strings = detect_strings(img0, fb)
            print(f"Strings detected (y): {strings}")
