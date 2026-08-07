
import cv2
import numpy as np
from PIL import Image

def analyze_fretboard():
    # 使用note_07帧（高把位，最清晰之一）来建立参考
    img_path = '/workspace/static/note_frames/note_07_f171.png'
    img = cv2.imread(img_path)
    h, w = img.shape[:2]
    print(f"Image size: {w}x{h}")
    
    # 转换为HSV来检测白色品记（星星）
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 白色范围
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 30, 255])
    mask_white = cv2.inRange(hsv, lower_white, upper_white)
    
    # 检测星星轮廓
    contours, _ = cv2.findContours(mask_white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    stars = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 20 < area < 200:  # 星星大小
            M = cv2.moments(cnt)
            if M['m00'] > 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                stars.append((cx, cy, area))
    
    # 按x坐标排序（从右到左，即从nut到琴身）
    stars.sort(key=lambda s: -s[0])  # x大的在前（右边）
    
    print(f"\nFound {len(stars)} stars:")
    for i, (x, y, area) in enumerate(stars):
        print(f"  Star {i+1}: x={x}, y={y}, area={area:.1f}")
    
    # 前4颗应该是3,5,7,9品的品记
    if len(stars) >= 4:
        star3 = stars[0]   # 3品
        star5 = stars[1]   # 5品
        star7 = stars[2]   # 7品
        star9 = stars[3]   # 9品
        
        print(f"\nFret markers:")
        print(f"  3rd fret marker: ({star3[0]}, {star3[1]})")
        print(f"  5th fret marker: ({star5[0]}, {star5[1]})")
        print(f"  7th fret marker: ({star7[0]}, {star7[1]})")
        print(f"  9th fret marker: ({star9[0]}, {star9[1]})")
        
        # 检测品丝（深色水平线？不对，品丝是垂直于弦的金属条）
        # 指板是倾斜的，让我们检测指板区域
        # 先找nut（最右上角的白色条）
        
        # 检测指板区域（深绿色/棕色区域）
        hsv2 = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lower_dark = np.array([30, 30, 20])
        upper_dark = np.array([80, 150, 100])
        mask_fb = cv2.inRange(hsv2, lower_dark, upper_dark)
        
        # 找指板轮廓
        contours_fb, _ = cv2.findContours(mask_fb, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        fb_contour = max(contours_fb, key=cv2.contourArea)
        x_fb, y_fb, w_fb, h_fb = cv2.boundingRect(fb_contour)
        print(f"\nFretboard bounding: x={x_fb}, y={y_fb}, w={w_fb}, h={h_fb}")
        
        # 检测琴弦（6根平行的深色线）
        # 让我们沿指板取一条水平线看亮度
        # 取中间y位置
        y_mid = y_fb + h_fb // 2
        
        # 提取指板区域
        fb_roi = img[y_fb:y_fb+h_fb, x_fb:x_fb+w_fb]
        gray_fb = cv2.cvtColor(fb_roi, cv2.COLOR_BGR2GRAY)
        
        # 沿垂直方向求和找弦（弦是深色的，在深色指板上是金属色/浅色？）
        # 弦是银色的，应该更亮
        col_avg = np.mean(gray_fb, axis=1)  # 沿水平方向平均，得到每一行的亮度
        
        # 找局部峰值（亮线 = 弦）
        from scipy.signal import find_peaks
        peaks, props = find_peaks(col_avg, height=10, distance=8, prominence=3)
        
        print(f"\nDetected string positions (y in ROI): {peaks}")
        print(f"Number of strings detected: {len(peaks)}")
        
        # 转换为全图坐标
        string_y = [y_fb + p for p in peaks]
        print(f"String y coordinates (full image): {string_y}")
        
        # 如果找到6根弦，排序
        if len(string_y) >= 6:
            string_y.sort()
            print(f"\n6 strings found (sorted, top to bottom):")
            for i, y in enumerate(string_y[:6]):
                print(f"  String {6-i} (or {i+1}?): y={y}")
        
        # 现在检测nut位置（最右上的白色横条）
        # 让我们看指板右上角
        roi_nut = img[y_fb:y_fb+h_fb, x_fb+w_fb-50:x_fb+w_fb]
        gray_nut = cv2.cvtColor(roi_nut, cv2.COLOR_BGR2GRAY)
        
        # 找nut（白色条）
        row_avg_nut = np.mean(gray_nut, axis=0)
        nut_x_in_roi = np.argmax(row_avg_nut)
        nut_x = x_fb + w_fb - 50 + nut_x_in_roi
        nut_y_mid = y_fb + h_fb // 2
        print(f"\nNut position (approx): x={nut_x}")
        
        # 品丝是垂直于弦的，但是指板是倾斜的
        # 让我们使用星星位置来推算品的位置
        # 品记在3,5,7,9品的格子中间
        
        # 注意：吉他品格间距是按比例的，不是等距的
        # 从nut到12品是一个八度，每个品的宽度比例是 2^(-1/12)
        
        # 让我们先在note_09_f216.png中找12品的双星（部分可见）
        img_low = cv2.imread('/workspace/static/note_frames/note_09_f216.png')
        hsv_low = cv2.cvtColor(img_low, cv2.COLOR_BGR2HSV)
        mask_white_low = cv2.inRange(hsv_low, lower_white, upper_white)
        contours_low, _ = cv2.findContours(mask_white_low, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        stars_low = []
        for cnt in contours_low:
            area = cv2.contourArea(cnt)
            if 20 < area < 200:
                M = cv2.moments(cnt)
                if M['m00'] > 0:
                    cx = int(M['m10'] / M['m00'])
                    cy = int(M['m01'] / M['m00'])
                    stars_low.append((cx, cy, area))
        
        stars_low.sort(key=lambda s: -s[0])
        print(f"\nStars in low-position frame (note_09): {len(stars_low)}")
        for i, (x, y, area) in enumerate(stars_low):
            print(f"  Star {i+1}: x={x}, y={y}")
        
        # 现在找指尖（浅色指尖，在黑色手套前面）
        # 让我们在note_07（高把位）检测指尖
        # 指尖是肤色/浅色
        
        # 手套是黑色的，指尖是浅粉色/肤色
        lower_skin = np.array([0, 30, 150])
        upper_skin = np.array([30, 150, 255])
        mask_skin = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # 找最大的skin轮廓（指尖）
        contours_skin, _ = cv2.findContours(mask_skin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours_skin:
            # 过滤指板区域附近的
            valid_skin = []
            for cnt in contours_skin:
                area = cv2.contourArea(cnt)
                if area > 5:
                    M = cv2.moments(cnt)
                    if M['m00'] > 0:
                        cx = int(M['m10'] / M['m00'])
                        cy = int(M['m01'] / M['m00'])
                        if x_fb - 20 < cx < x_fb + w_fb + 20 and y_fb - 20 < cy < y_fb + h_fb + 20:
                            valid_skin.append((cx, cy, area))
            
            if valid_skin:
                # 取最靠右上方的（最可能是按弦的指尖）
                fingertip = max(valid_skin, key=lambda s: s[0] - s[1])
                print(f"\nFingertip in note_07: x={fingertip[0]}, y={fingertip[1]}")

if __name__ == '__main__':
    analyze_fretboard()
