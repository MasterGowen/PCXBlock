import copy
import cv2
import base64
import numpy as np

def check_method(func):
    return func


def pixels_count(img, color_min, color_max):
            color_min = np.array(color_min, np.uint8)
            color_max = np.array(color_max, np.uint8)
            dst = cv2.inRange(img, color_min, color_max)
            pix_count = cv2.countNonZero(dst)
            return pix_count


def base64_to_image(base64image):
    image_data_base64 = base64image
    image_data_base64 = image_data_base64.replace('data:image/png;base64,', '')
    decode_img = base64.b64decode(image_data_base64)
    npimg = np.fromstring(decode_img, dtype=np.uint8)
    result_img = cv2.imdecode(npimg, 1)
    return result_img


def thresh_callback(stud_pic, correct_pic, thick_cont, thresh):
    sp = copy.copy(stud_pic)
    cp = copy.copy(correct_pic)
    gray = cv2.cvtColor(cp, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, thresh, thresh * 2)
    drawing = np.zeros(cp.shape, np.uint8)     # Image to draw the contours
    _, contours, hierarchy = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in contours:
        cv2.drawContours(drawing, [cnt], 0, (0, 255, 0), thick_cont)
        cv2.drawContours(sp, [cnt], 0, (255, 255, 255), thick_cont)
    return sp