
import cv2
import numpy as np
import os
import re

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Standard guitar tuning (from thickest to thinnest string: 6 to 1)
# But visually, when looking at the guitar from the front (like in the video),
# the thinnest string (high E, string 1) is at the bottom, thickest (low E, string 6) at top
# Open string notes (MIDI note numbers, or just note name + octave for our purposes)
# String 6 (top/thickest): E2
# String 5: A2
# String 4: D3
# String 3: G3
# String 2: B3
# String 1 (bottom/thinnest): E4
OPEN_NOTES = [
    ('E', 4),  # String 1 (bottom, thinnest)
    ('B', 3),  # String 2
    ('G', 3),  # String 3
    ('D', 3),  # String 4
    ('A', 2),  # String 5
    ('E', 2),  # String 6 (top, thickest)
]

def note_at_fret(open_note, open_octave, fret):
    """Calculate note at given fret on an open string."""
    # Calculate semitones from A
    note_order = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    start_idx = note_order.index(open_note)
    new_idx = (start_idx + fret) % 12
    octave = open_octave + (start_idx + fret) // 12
    return note_order[new_idx], octave

def get_finger_position(img_path):
    """Detect fret position (x coordinate) and string position (y coordinate) of fingertip."""
    img = cv2.imread(img_path)
    if img is None:
        return None
    h, w = img.shape[:2]
    
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Detect light-colored fingertip (skin/light pink, not black glove)
    lower_skin1 = np.array([0, 20, 180])
    upper_skin1 = np.array([20, 150, 255])
    lower_skin2 = np.array([160, 20, 180])
    upper_skin2 = np.array([180, 150, 255])
    
    mask1 = cv2.inRange(hsv, lower_skin1, upper_skin1)
    mask2 = cv2.inRange(hsv, lower_skin2, upper_skin2)
    mask_skin = cv2.bitwise_or(mask1, mask2)
    
    # Clean up mask
    kernel = np.ones((3,3), np.uint8)
    mask_skin = cv2.morphologyEx(mask_skin, cv2.MORPH_OPEN, kernel)
    mask_skin = cv2.morphologyEx(mask_skin, cv2.MORPH_CLOSE, kernel)
    
    contours, _ = cv2.findContours(mask_skin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    candidates = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 5 < area < 300:
            M = cv2.moments(cnt)
            if M['m00'] > 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                candidates.append((cx, cy, area))
    
    if not candidates:
        return None
    
    # Also detect white stars for reference
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 40, 255])
    mask_white = cv2.inRange(hsv, lower_white, upper_white)
    contours_white, _ = cv2.findContours(mask_white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    stars = []
    for cnt in contours_white:
        area = cv2.contourArea(cnt)
        if 15 < area < 200:
            M = cv2.moments(cnt)
            if M['m00'] > 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                stars.append((cx, cy, area))
    
    # The fingertip should be near the fretboard (which contains the stars)
    if stars:
        star_xs = [s[0] for s in stars]
        star_ys = [s[1] for s in stars]
        x_min, x_max = min(star_xs) - 50, max(star_xs) + 50
        y_min, y_max = min(star_ys) - 80, max(star_ys) + 80
        
        # Filter candidates that are near the fretboard and closest to strings
        valid = []
        for cx, cy, area in candidates:
            if x_min < cx < x_max and y_min < cy < y_max:
                valid.append((cx, cy, area))
        
        if valid:
            # Pick the rightmost (closest to nut/highest fret?) or just the largest?
            # Actually, pick the one that looks most like a fingertip pressing a string - should be bright
            tip = max(valid, key=lambda v: v[2])
            return {
                'tip': (tip[0], tip[1]),
                'stars': stars,
                'img_size': (w, h)
            }
    
    # Fallback
    tip = max(candidates, key=lambda v: v[2])
    return {
        'tip': (tip[0], tip[1]),
        'stars': stars,
        'img_size': (w, h)
    }

def analyze_all_frames():
    frame_dir = '/workspace/static/note_frames'
    files = sorted(os.listdir(frame_dir))
    note_files = [f for f in files if f.startswith('note_') and f.endswith('.png')]
    
    results = []
    
    for fname in note_files:
        path = os.path.join(frame_dir, fname)
        # Extract frame number
        m = re.search(r'note_(\d+)_f(\d+)', fname)
        if not m:
            continue
        note_idx = int(m.group(1))
        frame_num = int(m.group(2))
        
        info = get_finger_position(path)
        if info:
            results.append({
                'fname': fname,
                'note_idx': note_idx,
                'frame': frame_num,
                **info
            })
            print(f"{fname}: tip=({info['tip'][0]}, {info['tip'][1]}), stars={len(info['stars'])}")
        else:
            print(f"{fname}: no fingertip found")
    
    return results

if __name__ == '__main__':
    results = analyze_all_frames()
    
    # Now let's establish reference coordinates using a frame with many stars
    # We'll use a high position (near nut) frame
    print("\n=== Analyzing fret positions ===")
    
    # Find reference stars across frames
    # In standard guitars, inlays are at frets: 3,5,7,9,12,15,17,19,21...
    # From our earlier output, we have stars at various x positions
    # Let's collect all star positions and cluster them
    all_star_x = []
    all_star_y = []
    for r in results:
        for sx, sy, sa in r['stars']:
            all_star_x.append(sx)
            all_star_y.append(sy)
    
    if all_star_x:
        # Sort stars by x (descending = from nut/right to body/left)
        # Let's print fingertip x positions to see clusters
        tip_xs = sorted([r['tip'][0] for r in results], reverse=True)
        tip_ys = sorted([r['tip'][1] for r in results])
        print(f"\nFingertip X positions (right to left): {tip_xs}")
        print(f"Fingertip Y positions (top to bottom): {tip_ys}")
